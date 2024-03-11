<style></style>
<template>
<main class="app-root">
  <div>
    <div style="float:left;"><RouterLink to="/"><strong>&lt;Home</strong></RouterLink></div>
    <!--<div style="float:right;">
      <details>
        <summary><strong>…</strong></summary>
        <div v-for="item in metalist.list">
          <RouterLink :to="'/viewer/'+item.bookid">{{ item.title }}</RouterLink>
        </div>
      </details>
    </div>-->
    <h1 style="text-align:center;font-size:large">{{ meta.title }}</h1>
  </div>
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
  <div ref="osd_elm" style="width:100%; height: 800px; background-color: #ccc;"></div>
  <div>
    {{ currentPageUrl }}<br>
    {{ currentImageUrl }}<br>
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
</main>
</template>
<script>
  import "./assets/annotorious.min.css";
  import OpenSeadragon from "openseadragon";
  import Tako from './components/tako.js';
  import widgetBuilder from "./components/widgets.js";
  import metalist from "./metalist.js";
  import {RouterLink} from "vue-router";

  export default {
    data(){
      return {
        is_taggingmode:false,
        is_annotating:false,
        currentPage:"0001",
        viewer:null,
        anno:null,
        metalist:metalist,
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
        return this.$route.params.bookid;
      },
      meta(){
        const currentid = this.bookid;
        return metalist.list.find(meta=>meta.bookid==currentid);
      },
      annotations(){
        return this.$store.state.annotations;
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
        if(annotations.length>0 /*&& confirm("Overwrite Annotations?")*/){
          //this.annotations = annotations;
          this.$store.commit("addAnnotationByList", annotations)
        }
      },
      async openViewer(){
        const url = this.currentPageUrl;
        const json = await fetch(url).then(resp=>resp.json());
        const tilesource = json.data?json.data:json;
        this.viewer.open(tilesource);
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
        return (new RegExp(`^${this.imageUrlBase}(.+?)${this.meta.imageUrl.suffix}`))
          .test(annotation.target.source)?RegExp.$1:"";
      },
      getPageFromAnnotation(annotation){
        return (new RegExp(`^${this.imageUrlRoot}(.+?)${this.meta.imageUrl.extension}`))
          .test(annotation.target.source)?RegExp.$1:"";
      },
      insertIdentifierAndPage(annotation){
        if(!annotation["_identifier"]){
          annotation["_identifier"] = this.meta.identifier;
        }
        if(!annotation["_page"]){
          //const page = this.getPageFromAnnotation(annotation);
          annotation["_page"] = this.currentPage;
        }
        if(!(new RegExp(`^${this.meta.imageUrlBase}`)).test(annotation.target.source)){
          annotation.target.source = this.currentImageUrl;
        }
      },
      addAnnotation(annotation){
        this.insertIdentifierAndPage(annotation);
        this.$store.commit("addAnnotation", annotation);
      },
      updateAnnotation(annotation, previous){
        this.insertIdentifierAndPage(annotation);
        this.$store.commit("updateAnnotation", annotation, previous);
      },
      deleteAnnotation(annotation){
        this.$store.commit("deleteAnnotation", annotation);
      },
      startAnnotationMode(){
        if(this.is_annotating) this.anno.setDrawingEnabled(true);
      }
    },
    watch:{
      $route(to,from){
        console.log(to,from);
        this.currentPage = this.meta.pages[0];
        this.setPage();
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
      anno.on("createSelection", selection=>{
        console.log(selection);
      })
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