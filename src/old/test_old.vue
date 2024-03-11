<style></style>
<template>
<div class="app-root">
  <div ref="toolbar_elm" class="ii-toolbar" style="background-color:#0B8BEE;">
    <button ref="zoominbutton" title="zoom in">+</button>
    <button ref="zoomoutbutton" title="zoom out">-</button>
    <button ref="homebutton" title="reset zoom">🏠&#xFE0E;</button>
    <button ref="fullpagebutton" title="full screen">⛶</button>
    <button :disabled="!this.nextPage" @click="this.currentPage=this.nextPage;setPage()">next</button>
    <select v-model="currentPage" @change="setPage()">
      <option v-for="jsonurl in meta.pages">{{jsonurl}}</option>
    </select>
    <button :disabled="!this.prevPage" @click="this.currentPage=this.prevPage;setPage()">prev</button>
    <label aria-role="button"><input type="checkbox" v-model="is_annotating" @change="startAnnotationMode()"><span>⌖索引の作成</span></label>
    <label><input type="checkbox" v-model="is_taggingmode"><small>文書番号指定</small></label>
  </div>
  <div ref="osd_elm" style="width: 800px; height: 600px; background-color: #ccc;"></div>
  <div>
    <button @click="exportAnnotationToJSON">Export</button>
    <input type="file" @change="loadAnnotationFromJSON"><br>
    Annotations: {{this.annotations.length}} (in this page: {{this.currentAnnotations.length}})
  </div>
  <div>
    <div v-for="anno in annotations" :key="anno.id">
      <details>
        <summary>{{anno.id}}</summary>
        <pre>{{JSON.stringify(anno, null, 2)}}</pre>
      </details>
    </div>
  </div>
</div>
</template>
<script>
  import "./assets/annotorious.min.css";
  import OpenSeadragon from "openseadragon";
  import Tako from './components/tako.js';
  import widgetBuilder from "./components/widgets.js";

  export default {
    data(){
      return {
        is_taggingmode:false,
        is_annotating:false,
        meta:{
          title:"井伊家史料　三十",
          volume:"30",
          identifier:"850/8500/08/0130",
          pages: ["0001","0002","0003","0004","0005","0006","0007","0008","0009","0010","0011","0012","0013","0014","0015","0016","0017","0018","0019","0020","0021","0022","0023","0024","0025","0026","0027","0028","0029","0030","0031","0032","0033","0034","0035","0036","0037","0038","0039","0040","0041","0042","0043","0044","0045","0046","0047","0048","0049","0050","0051","0052","0053","0054","0055","0056","0057","0058","0059","0060","0061","0062","0063","0064","0065","0066","0067","0068","0069","0070","0071","0072","0073","0074","0075","0076","0077","0078","0079","0080","0081","0082","0083","0084","0085","0086","0087","0088","0089","0090","0091","0092","0093","0094","0095","0096","0097","0098","0099","0100","0101","0102","0103","0104","0105","0106","0107","0108","0109","0110","0111","0112","0113","0114","0115","0116","0117","0118","0119","0120","0121","0122","0123","0124","0125","0126","0127","0128","0129","0130","0131","0132","0133","0134","0135","0136","0137","0138","0139","0140","0141","0142","0143","0144","0145","0146","0147","0148","0149","0150","0151","0152","0153","0154","0155","0156","0157","0158","0159","0160","0161","0162","0163","0164","0165","0166","0167","0168","0169","0170","0171","0172","0173","0174","0175","0176","0177","0178","0179","0180","0181","0182","0183","0184","0185","0186","0187","0188","0189","0190","0191","0192","0193","0194","0195","0196","0197","0198","0199","0200","0201","0202","0203","0204","0205","0206","0207","0208","0209","0210","0211","0212","0213","0214","0215","0216","0217","0218","0219","0220","0221","0222","0223","0224","0225","0226","0227","0228","0229","0230","0231","0232","0233","0234","0235","0236","0237","0238","0239","0240","0241","0242","0243","0244","0245","0246","0247","0248","0249","0250","0251","0252","0253","0254","0255","0256","0257","0258","0259","0260","0261","0262","0263","0264","0265","0266","0267","0268","0269","0270","0271","0272","0273","0274","0275","0276","0277","0278","0279","0280","0281","0282","0283","0284","0285","0286","0287","0288"],
          jsonUrl: {
            server:"https://clioimg.hi.u-tokyo.ac.jp/viewer",
            prefix:"/api/info/idata/",
            suffix:"/supple/",
            extension:"",
          },
          imageUrl: {
            server:"https://clioimg.hi.u-tokyo.ac.jp/viewer",
            prefix:"/api/image/idata/",
            suffix:"/supple/",
            extension:".tif"
          }
        },
        currentPage:"0001",
        annotations:[],
        viewer:null,
        anno:null
      };
    },
    computed:{
      nextPage(){
        const pages = this.meta.pages;
        const nextIndex = pages.indexOf(this.currentPage)+1;
        return (nextIndex!=0 && nextIndex<pages.length)?pages[nextIndex]:"";
      },
      prevPage(){
        const pages = this.meta.pages;
        const prevIndex = pages.indexOf(this.currentPage)-1;
        return (prevIndex>=0)?pages[prevIndex]:"";
      },
      jsonUrlRoot(){
        return this.meta.jsonUrl.server+this.meta.jsonUrl.prefix+this.meta.identifier+this.meta.jsonUrl.suffix;
      },
      imageUrlBase(){
        return this.meta.imageUrl.server+this.meta.imageUrl.prefix;
      },
      imageUrlRoot(){
        return this.imageUrlBase+this.meta.identifier+this.meta.imageUrl.suffix;
      },
      currentImageUrl(){
        return this.imageUrlRoot + this.currentPage + this.meta.imageUrl.extension;
      },
      currentPageUrl(){
        return this.jsonUrlRoot + this.currentPage + this.meta.jsonUrl.extension;
        //return this.meta.jsonUrlTemplate.replace(/{identifier}/,this.meta.identifier).repalce(/{page}/,this.)
      },
      currentAnnotations(){
        //console.log(this.currentPageUrl);
        return this.annotations.filter(annotation=>{
          return (new RegExp("^"+this.currentImageUrl)).test(annotation.target.source);
        });
      }
    },
    methods:{
      exportAnnotationToJSON(){
        if(this.annotations.length<=0){
          return;
        }
        const blob = new Blob([JSON.stringify(this.annotations)], {type:"application/json"})
        const link = document.createElement("a");
        link.download = `annotation-${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(blob);
      },
      async loadAnnotationFromJSON(e){
        const file = e.target.files[0];
        const text = await file.text();
        const annotations = JSON.parse(text);
        if(this.annotations.length>0 && confirm("Overwrite Annotations?")){
          this.annotations = annotations;
        }
      },
      async openViewer(){
        const url = this.currentPageUrl;
        const json = await fetch(url).then(resp=>resp.json());
        this.viewer.open(json);
      },
      setPage(){
        this.openViewer();
        this.anno.setAnnotations(this.currentAnnotations);
      },
      gotoPage(page){
        this.currentPage = page;
        this.setPage();
      },
      getIdentifierFromAnnotation(annotation){
        return (new RegExp(`^${this.imageUrlBase}(.+?)\/supple\/`))
          .test(annotation.target.source)?RegExp.$1:"";
      },
      getPageFromAnnotation(annotation){
        return (new RegExp(`^${this.imageUrlRoot}(.+?)${this.meta.imageUrl.extension}`))
          .test(annotation.target.source)?RegExp.$1:"";
      },
      insertIdentifierAndPage(annotation){
        if(!annotation["_identifier"]){
          annotation["_identifier"]=this.meta.identifier;
        }
        if(!annotation["_page"]){
          const page = this.getPageFromAnnotation(annotation);
          annotation["_page"] = page;
        }
      },
      addAnnotation(annotation){
        this.insertIdentifierAndPage(annotation);
        this.annotations.push(annotation);
      },
      updateAnnotation(annotation, previous){
        this.insertIdentifierAndPage(annotation);
        const index = this.annotations.findIndex(item=>{
          return item.id == previous.id;
        });
        this.annotations[index] = annotation;
      },
      deleteAnnotation(annotation){
        const index = this.annotations.findIndex(item=>{
          return item.id == annotation.id;
        });
        this.annotations.splice(index);
      },
      startAnnotationMode(){
        //console.log(this.is_annotating)
        if(this.is_annotating) this.anno.setDrawingEnabled(true);
      }
    },
    async mounted(){
      const app = this;
      const bridge = {
        get is_taggingmode(){
          return app.is_taggingmode;
        },
        get currentAnnotations(){
          return app.currentAnnotations;
        },
        get meta(){
          return app.meta;
        },
        get currentPage(){
          return app.currentPage;
        }
      };

      this.viewer = OpenSeadragon({
        element:this.$refs.osd_elm,
        zoomInButton: this.$refs.zoominbutton,
        zoomOutButton: this.$refs.zoomoutbutton,
        homeButton: this.$refs.homebutton,
        fullPageButton: this.$refs.fullpagebutton,
        toolbar:this.$refs.toolbar_elm,
      });
      const anno = Tako(this.viewer,{
        widgets:widgetBuilder(bridge)
      });
      anno.on("createAnnotation", annotation=>{
        this.addAnnotation(annotation);
        this.is_annotating = false;
      });
      anno.on("updateAnnotation", (annotation,previous)=>{
        this.updateAnnotation(annotation, previous);
      });
      anno.on("deleteAnnotation", annotation=>{
        this.deleteAnnotation(annotation);
        console.log("delete annotation")
      })
      anno.on("cancelSelected", ()=>{
        this.is_annotating = false;
      });
      
      this.anno = anno;
      this.setPage();
    }
  };

</script>