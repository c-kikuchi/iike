
function ocrManifestConverter(ocr_manifest, bookid){
  console.log(ocr_manifest);
  ocr_manifest = typeof ocr_manifest=="string"?JSON.parse(ocr_manifest):ocr_manifest;
  const ocr_canvases = ocr_manifest["items"];
  const obj = [];
  ocr_canvases.forEach(canvas=>{
    const page = canvas.items[0];
    const pageimg = page.items[0].body.id.replace(/%2F/g,"/").replace(/\.jpg/g, ".tif");
    const annots = canvas.annotations[0].items;
    annots.forEach(annot=>{
      annot["_id"] = annot.id;
      annot.id = annot.id.replace(/https:\/\//,"").replace(/\//g, "-");
      const target = annot.target;
      const url = target.match(/^(.+)#/)?RegExp.$1:target;
      const xywh = target.match(/#xywh=([\d\,]+)$/)?RegExp.$1:"";
      //annot.target = pageimg + xywh;
      annot.target = {
        source:pageimg,
        selector:{
          "type": "FragmentSelector",
          "conformsTo": "http://www.w3.org/TR/media-frags/",
          "value": "xywh=pixel:"+xywh
        }
      }
      annot["_type"]="ocrtext";
      annot["_bookid"]=bookid;

      obj.push(annot);
    })
  })
  return obj;
}

export default ocrManifestConverter;