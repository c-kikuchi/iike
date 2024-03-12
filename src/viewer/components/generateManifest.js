import metalist from "../../metalist.js";

const utils = {
  hasIntersectionXYWH(rect1, rect2){
    const x0 = rect1[0], y0 = rect1[1], w0 = rect1[2], h0 = rect1[3];
    const x1 = rect2[0], y1 = rect2[1], w1 = rect2[2], h1 = rect2[3];
    return (Math.max(x0,x1) <= Math.min(x0+w0, x1+w1)) && (Math.max(y0,y1) <= Math.min(y0+h0, y1+h1));
  },
  getXYWHFromTarget(target){
    const xywh_text = target.selector.value;
    let xywh = [0,0,0,0];
    xywh_text.replace(/^xywh=pixel:([\d\.]+),([\d\.]+),([\d\.]+),([\d\.]+)$/,(match,...ps)=>{
      xywh = ps.slice(0,4).map(p=>parseFloat(p));
    })
    return xywh;
  },
}
const describing_keys = ["見出し語","読み","原文表記","肩書き","メモ","巻","頁","番号","枝番","備考"];
const describing_keys_dic = {};
describing_keys.forEach((v,i)=>describing_keys_dic[v]=i);

function generateIIIFPresentationManifest({
    annotations=[], bookid="", strict=false, iiifserver="http://localhost:5173/", iiifprefix="iiif/"
  }){
  if(!bookid) return;
  const meta = metalist.list.find(m=>m.bookid==bookid);
  const iiifRoot = iiifserver + iiifprefix;
  const imageUrlRoot = meta.imageUrl.server+meta.imageUrl.prefix+encodeURIComponent(meta.identifier)+meta.imageUrl.suffix;
  const current_annots = annotations.filter(anno=>{
    return (
      anno["_type"]=="describing" ||(  //_type describingのみ
        !anno["_type"] && !strict &&    //_type未定義の時、非厳密モードなら
        anno.body.some(b=>b.purpose=="describing") //bodyにdescribingを持つか確認
      ) 
    )&&(
      anno["_bookid"]==bookid ||( // _bookid一致
        !anno["_bookid"] && !strict && (     // _bookid未定義の時、非厳密モードなら
          (anno["_identifier"]==meta.identifier) || //_identifier一致を確認
          (!anno["_identifier"] && //_identifier未定義の時、target.sourceの一致を確認
            (new RegExp(`^${imageUrlRoot}`)).test(anno.target.source)
          )
        )
      )
    );
  });
  //console.log(current_annots);
  if(current_annots.length < 1){
    return;
  }

  const pagedic = {};

  const canvases = meta.pages.map((pageRaw,page)=>{
    pagedic[pageRaw] = page;
    const canvasId = iiifRoot + bookid + "/canvas/" + page;
    return {
      type:"Canvas",
      id:canvasId,
      label:{ none:[pageRaw]},
      width:meta.width,
      height:meta.height,
      items:[  //Image用AnnotationPage
        {
          type:"AnnotationPage",
          id:canvasId+"/page",
          items:[
            {
              type:"Annotation",
              id:canvasId+"/page/imageanno",
              motivation:"painting",
              target:canvasId,
              body:{
                type:"Image",
                width:meta.width,
                height:meta.height,
                id:imageUrlRoot + pageRaw + ".jpg" //meta.imageUrl.extension
              }
            }
          ]
        }
      ],
      annotations:[ //Annotation用AnnotationPage
        {
          type:"AnnotationPage",
          id:canvasId+"/annos",
          items:[]
        }
      ]
    };
  });

  current_annots.forEach(anno=>{
    const pageRaw = anno["_page"] || (strict?"":(new RegExp(`^${imageUrlRoot}(.+)${meta.imageUrl.extension}$`)).exec(anno.target.source)?RegExp.$1:"");
    //console.log("pageraw",pageRaw);
    if(!pageRaw) return;
    const page = pagedic[pageRaw];
    //console.log("page", page);
    if(typeof page != "number") return;
    const canvasId = iiifRoot + bookid + "/canvas/" + page

    const idx = canvases[page].annotations[0].items.length;
    //console.log(page, canvasId, idx);
    canvases[page].annotations[0].items.push({ //個別Annotation出力
      type:"Annotation",
      id:canvasId + "/annos/" + idx,
      motivation:"commenting",
      target:canvasId+"#xywh="+utils.getXYWHFromTarget(anno.target).join(","),
      body:anno.body.filter(b=>{
        return b.purpose=="describing" || b.purpose=="linking"
      }).map(b=>{
        return {
          type:"TextualBody",
          purpose:b.purpose,
          value:b.value
        }
      }).sort((a,b)=>{
        const [idxA, idxB] = [a,b].map(v=>
            (describing_keys_dic[/^(.+?): /.test(v.value)?RegExp.$1:""]+1)||9999
          );
          //console.log(idxA,idxB);
        return idxA-idxB;
      })
    });//Annotation出力終わり
  }); 

  const manifest = {      
    "@context": "http://iiif.io/api/presentation/3/context.json",
    type: "Manifest",
    id:iiifRoot + bookid + "/manifest.json",
    label:{
      "ja":[meta.title]
    },
    items:canvases
  }

  return manifest;
}


export default generateIIIFPresentationManifest;