import {createStore} from "vuex"

const store = createStore({
  state(){
    return {
      annotations:[],
      ocrs:[]
    }
  },
  getters:{
    ocrsIdSet(state){
      return new Set(state.ocrs.map=>anno=>anno.id);
    },
    isOcrLoaded(state){
      return id=>state.ocrsIdSet.has(id);
    },
    annotationsIdSet(state){
      return new Set(state.annotations.map(anno=>anno.id));
    },
    isAnnotationLoaded(state){
      return id=>state.annotationsIdSet.has(id);
    },
    isAnnotationOrOcrLoaded(state){
      return id=>state.isAnnotationLoaded(id) || state.isOcrLoaded(id);
    }
  },
  mutations:{
    addOcrs(state, list){
      state.ocrs.push(...list);
    },
    addAnnotationsLocal(state, list){
      state.annotations.push(...list);
    },
    addAnnotation(state, annotation){
      state.commit("addAnnotationsLocal", [annotation])
      state.dispatch("saveAnnotationsDB", [annotation]);
    },
    addAnnotationByList(state, list){
      state.commit("addAnnotationsLocal", list);
      state.dispatch("saveAnnotationsDB", list);
    },
    updateAnnotationLocal(state, payload){
      const {annotation, previous} = payload;
      if(!annotation || !previous) return;
      const index = state.annotations.findIndex(item=>{
        return item.id == previous.id;
      });
      state.annotations[index] = annotation;
    },
    updateAnnotation(state, payload){
      state.commit("updateAnnotationLocal", payload);
      state.dispatch("saveAnnotationsDB", [{previous, annotation}]);
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
    updateAnnotationByList(state, list){
      state.commit("updateAnnotationsLocal", list);
      state.dispatch("saveAnnotationsDB", list);
    },
    deleteAnnotationsLocal(state, list){
      list.forEach(annotation=>{
        const index = state.annotations.findIndex(item=>{
          return item.id == annotation.id;
        });
        state.annotations.splice(index,1);
      })
    },
    deleteAnnotation(state, annotation){
      state.commit("deleteAnnotationsLocal", [annotation])
      state.dispatch("deleteAnnotationsDB", [annotation]);
    },
    loadAnnotationsLocal(state, {list=[], forceUpdate=false}){
      const appends = [], updates = [];
      list.forEach(item=>{
        if(state.isAnnotationLoaded(item.id)&&forceUpdate){
          updates.push({annotation:item, previous:{id:item.id}});
        }
        else{
          appends.push(item);
        }
      });
      state.commit("addAnnotationsLocal", appends);
      if(updates.length>0){
        state.commit("updateAnnotationsLocal", updates)
      }
    },
    loadOcrsLocal(state, {list=[], forceUpdate=false}){
      const appends = [];
      list.forEach(item=>{
        if(!state.isOcrLoaded(item.id){
          appends.push(item);
        })
      });
      state.commit("addOcrs", appends);
    },
    loadJSON(state, {json:[], saveDB:false}){ //Annotation, OCR混在したArray
      const annots = [], ocrs = [];
      json.forEach(item=>{
        if(item["_type"]=="describing" || item["_type"]=="tagging"){
          annots.push(item);
        }
        else if(item["_type"]=="ocrtext"){
          ocrs.push(item);
        }
      });
      state.commit("loadAnnotationsLocal", {list:annots, forceUpdate:true});
      state.commit("loadOcrsLocal", {list:ocrs, forceUpdate:true});
      if(saveDB){
        state.dispatch("saveAnnotationsDB", annots);
        state.dispatch("saveOcrsDB", ocrs);
      }
    }
  },
  actions:{
    loadDefaultJSON(state){
      fetch("/iike/default.json").then(resp=>resp.json()).then(json=>{
        console.log("load default");
        state.commit("loadJSON", {json, saveDB:false});
      })
    },
    loadAnnotationsDB(state, {forceUpdate=false, bookid=""}){
      console.log("load annotations from db")
      const list = [];//db_get(bookid);
      state.commit("loadAnnotationsLocal", {list, forceUpdate});
    },
    loadOcrsDB(state, {forceUpdate=false, bookid=""}){
      console.log("load OCRs from db");
      const list = [];//db_get(bookid);
      state.commit("loadOcrsLocal", {list, forceUpdate});
    },
    saveAnnotationsDB(state, list){
      console.log("save annotations to db");
    },
    saveOcrsDB(state, list){
      console.log("save ocrs to db");
    },
    deleteAnnotationsDB(state, list){
      console.log("delete annotations on db")
    },

  }
});

export default store