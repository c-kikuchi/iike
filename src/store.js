import {createStore} from "vuex"

const store = createStore({
  state(){
    return {
      annotations:[]
    }
  },
  mutations:{
    addAnnotation(state, annotation){
      state.annotations.push(annotation);
    },
    updateAnnotation(state, payload){
      const {annotation, previous} = payload;
      const index = state.annotations.findIndex(item=>{
        return item.id == previous.id;
      });
      state.annotations[index] = annotation;
    },
    deleteAnnotation(state, annotation){
      const index = state.annotations.findIndex(item=>{
        return item.id == annotation.id;
      });
      state.annotations.splice(index,1);
    },
    addAnnotationByList(state, list){
      state.annotations.push(...list);      
    },
    updateAnnotationByList(state, list){ //list = [{annotation:{}, previous:{}}]
      const listMap = new Map();
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
  actions:{
    loadDefaultJSON(state){
      fetch("/iike/default.json").then(resp=>resp.json()).then(json=>{
        console.log("load default");
        state.commit("addAnnotationByList", json);
      })
    }
  }
});

export default store