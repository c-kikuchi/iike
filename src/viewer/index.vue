<style>
body {
  margin:0;
}

.ii-root {
  display:flex;
  flex-direction: row;
  position:fixed;
  inset:0;
}
.ii-main-pane {
  flex-grow:1;
  display:flex;
  flex-direction: column;
  height:100vh;
  container-type:inline-size;
  container-name:ii-main;
}
.ii-side-pane {
  display:none;
}
.ii-side-pane.show {
  display: flex;
  flex-direction: row;
  min-width: v-bind('sidepane_min_width + "px"');
}
.ii-side-pane .resizer {
  width:5px;
  background-color:#666;
  display: flex;
  justify-content: center;
  align-items:center;
  cursor:col-resize;
}
.ii-side-pane .resizer-handle {
  background-color: #ccc;
  width:3px;
  height:20px;
  border-radius:1px;
}
.ii-side-pane .ii-side-pane-main {
  display:flex;
  flex-direction:column;
  flex-grow:1;
  width:calc(100% - 5px);
}
.ii-side-pane .ii-side-pane-header {
  background-color:#0B8BEE;
  height:40px;
  color:#fff;
  display:flex;
  flex-direction: row;
  align-items:center;
}
.ii-side-pane .ii-side-pane-content {
  background-color:#fff;
  overflow-y:scroll;
  flex-grow:1;
  padding:5px;
}

@media screen and (max-width:480px) {
  .ii-side-pane.show::before{
    content:"";
    position:fixed;
    inset:0;
    width:100vw;
    background-color: rgba(0,0,0,0.3);
    z-index:-1;
  }
  .ii-side-pane.show{
    position:fixed;
    inset:5px;
    width:calc(100vw - 10px);
    border:1px solid #333;
  }
  .ii-side-pane .resizer {
    width:0;
    display:none;
  }
}

.ii-header .side-menu{
  display:flex;
  height:100%;
  align-items:center;
}

.sidepane-opener {
	background-color: #0090ff;
	padding: 5px;
	display: inline-block;
	width: 20px;
	height: 20px;
	text-align: center;
	line-height: 20px;
	color: #fff;
  margin:0 5px;  
}

.ii-side-pane-selector{
  flex-grow:1;
  text-align: center;
}

.ii-side-pane-selector-input {
	background-color: #39f;
	color: #fff;
	font-size: medium;
	border: none;
	border-radius: 3px;
	padding: 3px;
	text-align: center;
  cursor: pointer;
}

.ii-toolbar {
  background-color:#0B8BEE;
  height:30px;
}
.ii-toolbar-controls{
  display:flex;
  flex-direction: row;
  justify-content: center;
  align-items:center;
  height:100%;
  gap:18px;
}
@container ii-main (width < 650px) {
  .ii-toolbar{
    height:90px;
  }
  .ii-toolbar-controls{
    flex-direction: column;
    gap:3px;
  }
}

.ii-toolbar-controls button{
  background-color:#0B8BEE;
  border: solid 1px #ccc;
  border-radius:3px;
  color:#fff;
  padding:3px;
  font-size:small;
}
.ii-toolbar-controls button:hover{
  background-color:#309aeb;
}
.ii-toolbar-controls button:active{
  background-color:#0771c2;
}
.ii-toolbar-controls button:disabled{
  background-color:rgb(148, 177, 200);
  color:#666;
}

.ii-zoom-control button{
  width:22px;
  height:22px;
}

.ii-image-viewer {
	width: 100%;
	min-height: 800px;
	background-color: rgb(204, 204, 204);
	position: relative;
	flex-grow: 1;
}

label{
  cursor:pointer;
}
input[type=checkbox].togglebutton {
  display:none;
}
input[type=checkbox].togglebutton+span {
  font-size:small;
  border: solid 1px #ccc;
  border-radius:3px;
  color:#fff;
  margin-left:5px;
  padding:3px;

}
input[type=checkbox]:not(:checked).togglebutton+span {
  background-color:#0B8BEE;
}
input[type=checkbox]:not(:checked).togglebutton+span:hover {
  background-color:#309aeb;
}
input[type=checkbox]:checked.togglebutton+span {
  background-color:#0771c2;
  border-style:inset;
}

</style>
<template>
<main class="ii-root">
<div class="ii-main-pane">
  <div class="ii-header" v-show="show_header">
    <div class="side-menu" style="float:left;padding-left:10px;"><RouterLink to="/"><strong>&lt;Home</strong></RouterLink></div>
    <!--<div style="float:right;">
      <details>
        <summary><strong>…</strong></summary>
        <div v-for="item in metalist.list">
          <RouterLink :to="'/viewer/'+item.bookid">{{ item.title }}</RouterLink>
        </div>
      </details>
    </div>-->
    <div class="side-menu" style="float:right;display:flex;padding-right:10px;">
      <popmenu right>
          <li><label><input type="checkbox" v-model="is_widget_simple_mode"><small>Simple mode</small></label></li>
          <li @click="exportAnnotationToJSON">Export JSON</li>
          <li @click="exportAnnotationToJSON_onlyThisBook">Export JSON <small>(only this book)</small></li>
          <li @click="exportManifest">Export Manifest</li>
          <!--<li><button @click="openManifest">Show Manifest</button></li>-->
          <li><label><input type="file" style="display:none" @change="loadAnnotationFromJSON">Load JSON</label></li>
          <!--<li><button @click="getPageDimension">page size</button></li>-->
          <!--<li><button @click="demo_openDefault">(DEMO)load demo json</button></li>-->
          <li @click="saveTest">Save All</li>
          <li @click="authLogout">Logout</li>
      </popmenu>
      <label role="button" aria-role="button" class="sidepane-opener">
        <input type="checkbox" v-model="is_sidepane_shown" style="display:none">
        <span v-show="!is_sidepane_shown">&#x276E;</span>
        <span v-show="is_sidepane_shown">&#x276F;</span>
      </label>
    </div>
    <h1 style="text-align:center;font-size:large">{{ meta.title }}</h1>
  </div>
  <div ref="toolbar_elm" class="ii-toolbar">
    <div class="ii-toolbar-controls">
      <div class="ii-zoom-control">
        <button ref="zoominbutton" title="zoom in">＋</button>
        <button ref="zoomoutbutton" title="zoom out">－</button>
        <button ref="homebutton" title="reset zoom">🏠&#xFE0E;</button>
        <button ref="fullpagebutton" title="full screen">⛶</button>
        <button @click="show_header = !show_header" title="expand view">○</button>
        <button title="refresh" @click="setPage" style="margin-left:10px;width:auto">更新</button>
      </div>
      <div class="ii-page-control">
        <button :disabled="!this.nextPage" @click="this.currentPage=this.nextPage;setPage()">next</button>
        <select v-model="currentPage" @change="setPage()">
          <option v-for="jsonurl in meta.pages">{{jsonurl}}</option>
        </select>
        <button :disabled="!this.prevPage" @click="this.currentPage=this.prevPage;setPage()">prev</button>
      </div>
      <div class="ii-tag-control">
        <label role="button" aria-role="button"><input class="togglebutton" type="checkbox" v-model="is_annotating" @change="startAnnotationMode()"><span>⌖索引の作成</span></label>
        <label role="button" aria-role="button"><input class="togglebutton" type="checkbox" v-model="is_taggingmode" @change="startTagAnnotationMode()"><span>文書番号指定</span></label>
        
        &nbsp;<label style="color:#fff;font-size:small;"><input type="checkbox" v-model="show_ocrs" @change="loadOcr" :disabled="!has_ocr">OCR結果を表示</label>
      </div>
    </div>
  </div>
  <div class="ii-image-viewer" ref="osd_elm"></div>
  <!--<div>
    <div>
      {{ currentPageUrl }}<br>
      {{ currentImageUrl }}
    </div>
  </div>-->
  <div style="padding:0 20px;" v-if="isDev">
    <div>
      <span v-show="is_mobile">●</span>
      Annotations: {{this.annotations.length}} 
      (in this page: {{this.currentAnnotations.length}})
      <input type="checkbox" v-model="show_annotation_list">
    </div>
    <div v-if="show_annotation_list">
      <div v-for="anno in annotations" :key="anno.id">
        <details>
          <summary>{{anno.id}}</summary>
          <pre>{{JSON.stringify(anno, null, 2)}}</pre>
        </details>
      </div>
    </div>
  </div>
</div>
<div class="ii-side-pane" :class="{show:is_sidepane_shown}" :style="{ width: sidepane_width_calc }">
  <div class="resizer" @pointermove="sidepane_resize($event)">
    <div class="resizer-handle"></div>
  </div>
  <div class="ii-side-pane-main">
    <div class="ii-side-pane-header">
      <label role="button" aria-role="button" class="sidepane-opener" style="background-color: rgb(13, 104, 221);">
        <input type="checkbox" v-model="is_sidepane_shown" style="display:none">
        <span>&#x2716;</span>
      </label>
      <div class="ii-side-pane-selector">
        <select class="ii-side-pane-selector-input" v-model="sidepane_selected">
          <option value="default">巻一覧</option>
          <option value="search_book">本巻内OCR検索</option>
          <option value="annot_list">アノテーション一覧</option>
        </select>
      </div>
    </div>
    <div class="ii-side-pane-content">
      <div v-if="sidepane_selected=='annot_list'">
        <currentAnnotationList
         :currentAnnotations="currentAnnotations"
         :show_title="false"
         :all_length="annotations.length"
         @select-annotation="selectAnnotation">
        </currentAnnotationList>
      </div>
      <div v-if="sidepane_selected=='default'">
        <iiNavigator @navigated="is_internal_routing=false"></iiNavigator>
      </div>
      <div v-if="sidepane_selected=='search_book'">
        <bookOcrSearch 
          :bookid="bookid" 
          :show_ocr="show_ocrs" 
          :currentPage="currentPage"
          @navigate="is_internal_routing=false">
        </bookOcrSearch>
      </div>
    </div>
  </div>
</div>
</main>
</template>
<script>
  import "./components/annotorious.min.css";
  import "./components/formatter.css"
  import OpenSeadragon from "openseadragon";
  import OSDAnnotorious from './components/openseadragon-annotorious.min.js';
  import widgetBuilder from "./components/widgets.js";
  import formatterBuilder from "./components/formatter.js";
  import manifestGenerator from "./components/generateManifest.js";
  import metalist from "../metalist.js";
  import popmenu from "../components/popmenu.vue";
  import currentAnnotationList from "./components/currentAnnotationList.vue";
  import iiNavigator from "./components/iiNavigator.vue";
  import bookOcrSearch from "./components/bookOcrSearch.vue";
  import {RouterLink} from "vue-router";

  

  export default {
    inject:["logout","loggedin", "annotStore", "isDev"],
    components:{
      popmenu,
      currentAnnotationList,
      iiNavigator,
      bookOcrSearch
    },
    data(){
      return {
        is_taggingmode:false,
        is_annotating:false,
        is_internal_routing:false,
        is_sidepane_shown:false,
        sidepane_width:350,
        sidepane_min_width:350,
        sidepane_selected:"default",
        is_mobile:false,
        is_widget_simple_mode:false,
        show_annotation_list:false,
        currentPage:"",
        viewer:null,
        anno:null,
        metalist:metalist,
        show_ocrs:false,     
        show_header:true,   
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
      bookid(){
        console.log("i");
        return this.$route.params.bookid;
      },
      routerpage(){
        return this.$route.params.page;
      },
      meta(){
        const currentid = this.bookid;
        const meta = metalist.list.find(meta=>meta.bookid==currentid);
        if(!this.currentPage){
          this.currentPage = meta.pages[0];
        }
        return meta;
      },
      annotations(){
        console.log("a");
        return !this.show_ocrs?
          this.annotStore.annotations
          :this.annotStore.annotations.concat(this.annotStore.ocrs);
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
        console.log("c")
        return this.annotations.filter(annotation=>{
          return this.isCurrentAnnotation(annotation);
        });
      },
      has_ocr(){
        return !!this.meta.ocrtext;
      },
      sidepane_width_calc(){
        if(this.is_mobile){
          return "calc(100vw - 10px)";
        }
        return this.sidepane_width + "px";
      },
    },
    methods:{
      isCurrentAnnotation(annotation){
        if(annotation["_bookid"]&&annotation["_page"]){
          return annotation["_bookid"] == this.bookid && annotation["_page"] == this.currentPage
        }
        else{
          return (new RegExp("^"+this.currentImageUrl)).test(annotation.target.source)
        }
      },
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
      exportAnnotationToJSON_onlyThisBook(){
        if(this.annotations.length<=0){
          return;
        }
        const annot_thisbook = this.annotations.filter(annotation=>{
          return annotation["_bookid"] == this.bookid;
        })
        const blob = new Blob([JSON.stringify(annot_thisbook)], {type:"application/json"})
        const link = document.createElement("a");
        link.download = `annotation-${this.bookid}-${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(blob);
      },
      generateManifest(){
        if(this.annotations.length<=0){
          return;
        }
        const manifest = manifestGenerator({
          annotations:this.annotations,
          bookid:this.bookid,
          iiifserver:"https://c-kikuchi.github.io/",
          iiifprefix:"iiif/"
        });
        return manifest
      },
      exportManifest(){
        const manifest = this.generateManifest();
        if(!manifest) return;
        const blob = new Blob([JSON.stringify(manifest,null,2)], {type:"application/json"});
        const link = document.createElement("a");
        link.download = `manifest-${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(blob);
      },
      openManifest(){
        const manifest = this.generateManifest();
        if(!manifest) return;
        const blob = new Blob([JSON.stringify(manifest,null,2)], {type:"application/json"});
        window.open(URL.createObjectURL(blob));
      },
      async loadAnnotationFromJSON(e){
        const file = e.target.files[0];
        const text = await file.text();
        const annotations = JSON.parse(text);
        if(annotations.length>0 /*&& confirm("Overwrite Annotations?")*/){
          //this.annotations = annotations;
          await this.annotStore.loadJSON(annotations, true);
          this.setPage();
        }
      },
      async openViewer(){
        const url = this.currentPageUrl;
        const json = await fetch(url).then(resp=>resp.json());
        const tilesource = json.data?json.data:json;
        this.viewer.open(tilesource);
      },
      setPage(){
        return new Promise(resolve=>{
          let jump_id = "";
          if(location.search){ 
            const params = (new URL(document.location)).searchParams;
            if(params.has("id")){
              jump_id = params.get("id");
            }
          }
          this.openViewer();
          this.is_internal_routing = true;
          this.$router.replace({path:`/viewer/${this.bookid}/${this.currentPage}`});
          this.anno.setAnnotations(this.currentAnnotations);
          if(jump_id) this.anno.selectAnnotation(jump_id);
          resolve(true);
        });
      },
      gotoPage(page){
        this.currentPage = page;
        return this.setPage();
      },
      getIdentifierFromAnnotation(annotation){
        return (new RegExp(`^${this.imageUrlBase}(.+?)${this.meta.imageUrl.suffix}`))
          .test(annotation.target.source)?RegExp.$1:"";
      },
      getPageFromAnnotation(annotation){
        return (new RegExp(`^${this.imageUrlRoot}(.+?)${this.meta.imageUrl.extension}`))
          .test(annotation.target.source)?RegExp.$1:"";
      },
      insertProperties(annotation){
        if(!annotation["_identifier"]){
          annotation["_identifier"] = this.meta.identifier;
        }
        if(!annotation["_page"]){
          //const page = this.getPageFromAnnotation(annotation);
          annotation["_page"] = this.currentPage;
        }
        if(!annotation["_bookid"]){
          annotation["_bookid"] = this.meta.bookid;
        }
        if(!(new RegExp(`^${this.meta.imageUrlBase}`)).test(annotation.target.source)){
          annotation.target.source = this.currentImageUrl;
        }
      },
      loadAnnotationFromDB(){
        console.log("ocr: ", this.show_ocrs);
        return this.annotStore.loadAnnotations(this.bookid,false,this.show_ocrs);
      },
      async loadOcr(){
        console.log("load ocr: ", this.show_ocrs);
        if(this.show_ocrs){
          await this.annotStore.loadAnnotations_onlyOCR(this.bookid);
        }
        this.setPage();
      },
      addAnnotation(annotation){
        if(annotation._type=="ocrtext") return;
        this.insertProperties(annotation);
        this.annotStore.addAnnotation(annotation);
      },
      updateAnnotation(annotation, previous){
        if(annotation._type=="ocrtext") return;
        //console.log(annotation, previous);
        this.insertProperties(annotation);
        this.annotStore.updateAnnotation(annotation);
      },
      deleteAnnotation(annotation){
        if(annotation._type=="ocrtext") return;
        this.annotStore.deleteAnnotation(annotation);
      },
      startAnnotationMode(){
        if(this.is_annotating) this.anno.setDrawingEnabled(true);
      },
      startTagAnnotationMode(){
        if(this.is_taggingmode){
          //this.is_annotating = true;
          this.anno.setDrawingEnabled(true);
        }
      },
      async selectAnnotation(id="",overPage=false){
        if(!id) return;
        if(!this.currentAnnotations.some(annot=>annot.id==id)){
          //console.log("!",id);
          if(overPage){
            const target = this.annotations.find(annot=>annot.id==id);
            if(!target) return;
            const target_page = target._page || ((new RegExp(`^${this.imageUrlRoot}(.+)${this.meta.imageUrl.extension}$`)).test(target.target.source)?RegExp.$1:"");
            if(!target_page || target._bookid != this.meta.bookid) return;
            await this.gotoPage(target_page);
          }
          else{
            return;
          }
        }
        //console.log(id);
        this.anno.selectAnnotation(id);
      },
      authLogout(){
        this.logout();
      },
      getPageDimension(){// remove on production
        const dimensions = this.viewer.source.dimensions;
        //const viewport_content = this.viewer.world.getItemAt(0).getContent();
        console.log("dimensions |", dimensions.x, dimensions.y);
        //console.log("viewport |", viewport_content.x, viewport_content.y);
      },
      sidepane_resize(e){
        if(e.buttons < 1) return;
        const new_width = this.sidepane_width - e.movementX;
        this.sidepane_width = Math.max(this.sidepane_min_width, new_width);
        e.target.setPointerCapture(e.pointerId);
      },
      async demo_openDefault(){// remove on production
        await this.annotStore.loadDefaultJSON();
        this.setPage();
        console.log("default loaded");
      },
      saveTest(){
        this.annotStore.saveAll();
      }
    },
    watch:{
      $route(to,from){
        //console.log(to,from);
        if(this.is_internal_routing){
          this.is_internal_routing = false;
          //console.log("internal");
          return;
        }
        if(to.params.page != from.params.page){
          this.currentPage = to.params.page;
        }
        if(to.params.bookid != from.params.bookid){
          console.log("change book");
          this.loadAnnotationFromDB().then(()=>this.setPage());
          this.currentPage = to.params.page||this.meta.pages[0];
          this.is_widget_simple_mode = this.meta.simplemode;
          this.show_ocrs = this.meta.show_ocr && this.has_ocr;
      
        }
        this.setPage();
      }
    },
    async mounted(){
      console.log("viewer mounted")
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
        },
        get is_simplemode(){
          return app.is_widget_simple_mode;
        }
      };

      if(this.routerpage){
        this.currentPage = this.routerpage;
      }

      this.is_widget_simple_mode = this.meta.simplemode;
      this.show_ocrs = this.meta.show_ocr && this.has_ocr;

      this.viewer = OpenSeadragon({
        element:this.$refs.osd_elm,
        zoomInButton: this.$refs.zoominbutton,
        zoomOutButton: this.$refs.zoomoutbutton,
        homeButton: this.$refs.homebutton,
        fullPageButton: this.$refs.fullpagebutton,
        toolbar:this.$refs.toolbar_elm,
      });
      const anno = OSDAnnotorious(this.viewer,{
        widgets:widgetBuilder(bridge),
        formatter:formatterBuilder(bridge)
      });
      /*anno.on("createSelection", selection=>{
        console.log(selection);
      })*/
      anno.on("createAnnotation", annotation=>{
        this.addAnnotation(annotation);
        this.is_annotating = false;
        this.is_taggingmode = false;
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
        this.is_taggingmode = false;
      });
      
      this.anno = anno;
      this.loadAnnotationFromDB().then(()=>{
        this.setPage();
      });
      this.setPage();
      //window.app = this;

      const mediaquery = window.matchMedia("(max-width: 480px)");
      this.is_mobile = mediaquery.matches;
            mediaquery.addEventListener("change", e=>{
        this.is_mobile = e.matches;
      })

    }
  };

</script>