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
    }
  }
});

export default store