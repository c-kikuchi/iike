import {createStore} from "vuex";
import {dbconnection} from "./firebaseconnetcion"

const store = createStore({
  state(){
    return {
      annotations:[],
      ocrs:[]
    }
  },
  getters:{
    ocrsIdSet(state){
      return new Set(state.ocrs.map(anno=>anno.id));
    },
    isOcrLoaded(state, getters){
      return id=>getters.ocrsIdSet.has(id);
    },
    annotationsIdSet(state){
      return new Set(state.annotations.map(anno=>anno.id));
    },
    isAnnotationLoaded(state, getters){
      return id=>getters.annotationsIdSet.has(id);
    },
    isAnnotationOrOcrLoaded(state, getters){
      return id=>getters.isAnnotationLoaded(id) || getters.isOcrLoaded(id);
    }
  },
  mutations:{
    addOcrs(state, list){
      state.ocrs.push(...list);
    },
    addAnnotationsLocal(state, list){
      state.annotations.push(...list);
    },
    updateAnnotationLocal(state, payload){
      const {annotation, previous} = payload;
      if(!annotation || !previous) return;
      const index = state.annotations.findIndex(item=>{
        return item.id == previous.id;
      });
      state.annotations[index] = annotation;
    },
    updateAnnotationsLocal(state, list){ //list = [{annotation:{}, previous:{}}]
      const listMap = new Map();
      if(list.length>0){
        list.forEach(item=>{
          const {annotation, previous} = item;
          listMap.set(previous.id, annotation);
        });
        state.annotations.forEach((item, index)=>{
          if(listMap.has(item.id)){
            state.annotations[index] = listMap.get(item.id);
          }
        });
      }
    },
    deleteAnnotationsLocal(state, list){
      list.forEach(annotation=>{
        const index = state.annotations.findIndex(item=>{
          return item.id == annotation.id;
        });
        state.annotations.splice(index,1);
      })
    },
  },
  actions:{
    addAnnotation(context, annotation){
      context.commit("addAnnotationsLocal", [annotation])
      context.dispatch("saveAnnotationsDB", [annotation]);
    },
    addAnnotationByList(context, list){
      context.commit("addAnnotationsLocal", list);
      context.dispatch("saveAnnotationsDB", list);
    },
    updateAnnotation(context, payload){
      const {annotation, previous} = payload;
      context.commit("updateAnnotationLocal", {previous, annotation});
      context.dispatch("saveAnnotationsDB", [annotation]);
    },
    updateAnnotationByList(context, list){
      context.commit("updateAnnotationsLocal", list);
      context.dispatch("saveAnnotationsDB", list);
    },
    deleteAnnotation(context, annotation){
      context.commit("deleteAnnotationsLocal", [annotation])
      context.dispatch("deleteAnnotationsDB", [annotation]);
    },
    loadAnnotationsLocal(context, {list=[], forceUpdate=false}){
      const appends = [], updates = [];
      list.forEach(item=>{
        if(!context.getters.isAnnotationLoaded(item.id)){
          appends.push(item);
        }
        else if(forceUpdate){
          updates.push({annotation:item, previous:{id:item.id}});
        }
      });
      context.commit("addAnnotationsLocal", appends);
      if(updates.length>0){
        context.commit("updateAnnotationsLocal", updates)
      }
    },
    loadOcrsLocal(context, {list=[], forceUpdate=false}){
      const appends = [];
      list.forEach(item=>{
        if(!context.getters.isOcrLoaded(item.id)){
          appends.push(item);
        }
      });
      context.commit("addOcrs", appends);
    },
    loadJSON(context, {json=[], saveDB=false}){ //Annotation, OCR混在したArray
      const annots = [], ocrs = [];
      json.forEach(item=>{
        if(item["_type"]=="describing" || item["_type"]=="tagging"){
          annots.push(item);
        }
        else if(item["_type"]=="ocrtext"){
          ocrs.push(item);
        }
      });
      context.dispatch("loadAnnotationsLocal", {list:annots, forceUpdate:true});
      context.dispatch("loadOcrsLocal", {list:ocrs, forceUpdate:true});
      if(saveDB){
        context.dispatch("saveAnnotationsDB", annots);
        context.dispatch("saveOcrsDB", ocrs);
      }
    },
    loadDefaultJSON(context){
      fetch("/iike/default.json").then(resp=>resp.json()).then(json=>{
        console.log("load default");
        context.dispatch("loadJSON", {json, saveDB:false});
      })
    },
    loadAnnotations(context, {forceUpdate=false, bookid="", loadOcrs=true}){
      context.dispatch("loadAnnotationsDB", {forceUpdate, bookid});
      if(loadOcrs){
        context.dispatch("loadOcrsDB", {forceUpdate, bookid});
      }
    },
    async loadAnnotationsDB(context, {forceUpdate=false, bookid=""}){
      console.log("load annotations from db")
      const list = await dbconnection.getAnnotations(bookid);
      context.dispatch("loadAnnotationsLocal", {list, forceUpdate});
    },
    async loadOcrsDB(context, {forceUpdate=false, bookid=""}){
      console.log("load OCRs from db");
      const list = await dbconnection.getOcrs(bookid);
      context.dispatch("loadOcrsLocal", {list, forceUpdate});
    },
    saveAnnotationsDB(context, list){
      console.log("save annotations to db");
      dbconnection.setAnnotations(list);
    },
    saveOcrsDB(context, list){
      console.log("save ocrs to db");
      dbconnection.setOcrs(list);
    },
    deleteAnnotationsDB(context, list){
      console.log("delete annotations on db")
    },
    saveAllToTestDB(context){
      console.log("saving start");
      dbconnection.saveTest(context.state.annotations).then(()=>{
        console.log("saving end.")
      });
    },
    async loadAllFromTestDB(context){
      console.log("loading start");
      const list = await dbconnection.loadTest();
      context.dispatch("loadAnnotationsLocal", {list});
    }
  }
});

export default store