import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAnnotationsStore = defineStore("annotations", ()=>{
  const annotations = ref([]);
  const ocrs = ref([]);
  
  //const annotationsIdSet = computed(()=>new Set(annotations.value.map(item=>item.id)));
  /**
   * return if annotation with provided id is loaded.
   * @param {string} id 
   * @returns {boolean}
   */
  /*function isAnnotationLoaded (id) {
    return annotationsIdSet.value.has(id);
  }*/

  /**
   * Append Single Annotation
   * @param {Object} annotation Annotation to be Appended
   * @param {string} annotation.id Unique ID of Annotation
   * @returns {Promise}
   */
  function addAnnotation(annotation){ 
    annotations.value.push(annotation);
    return setAnnotationDB(annotation);
  }
  /**
   * Append Multiple Annotations
   * @param {Object[]} list List of Annotations to be Appended
   * @param {string} list[].id Unique ID of Annotation
   * @returns {Promise}
   */
  function addAnnotations (list){
    annotations.value.push(...list);
    return setAnnotationsDB(list);
  };
  /**
   * Update Single Annotation
   * @param {object} annotation Annotation to be Updated
   * @param {string} annotation.id Unique ID of Annotation
   * @returns {Promise}
   */
  function updateAnnotation (annotation){
    if(!annotation) return Promise.reject();
    const index = annotations.value.findIndex(item=>{
      return item.id == annotation.id;
    });
    if(index==-1) return Promise.reject();
    annotations.value[index] = annotation;
    return setAnnotationDB(annotation);
  }
  /**
   * Update Multiple Annotations
   * @param {Object[]} list List of Annotations to be Updated
   * @param {string} list[].id Unique ID of Annotation
   * @returns {Promise}
   */
  function updateAnnotations (list){
    if(!list.length) return Promise.reject();
    const listMap = new Map();
    list.forEach(item=>{
      listMap.set(item.id, item);
    });
    annotations.value.forEach((item, index)=>{
      if(listMap.has(item.id)){
        annotations.value[index] = listMap.get(item.id);
      }
    });
    return setAnnotationsDB(list);
  };

  /**
   * Append or Update Annotations (local)
   * @private
   * @param {Object[]} list List of Annotations
   * @param {string} list[].id Unique ID of Annotation
   * @param {boolean} forceUpdate 
   */
  function setAnnotations(list=[], forceUpdate=false){
    const annotationsIdMap = new Map();
    annotations.value.forEach((v,i)=>{
      annotationsIdMap.set(v.id, i);
    });
    list.forEach(item=>{
      const index = annotationsIdMap.get(item.id);
      if(index && forceUpdate){
        annotations.value[index] = item;
      }
      else{
        annotations.push(item);
      }
    })
  }

  /**
   * Append or Update Ocr Annotation (local)
   * @param {Object[]} list List of Ocr Annotation
   * @param {string} list[].id Unique ID of Annotation
   * @param {boolean} forceUpdate 
   */
  function setOcrs(list=[], forceUpdate=false){
    const ocrsIdMap = new Map();
    ocrs.value.forEach((v,i)=>{
      ocrsIdMap.set(v.id, i);
    });
    list.forEach(item=>{
      const index = ocrsIdMap.get(item.id);
      if(index && forceUpdate){
        ocrs.value[index] = item;
      }
      else{
        ocrs.push(item);
      }
    })
  }
  /**
   * Delete Single Annotation
   * @param {object} annotation Annotation to be Deleted
   * @param {string} annotation.id Unique ID of Annotation
   * @returns {Promise}
   */
  function deleteAnnotation(annotation){ // delete single annotation
    const index = annotations.value.findIndex(item=>{
      return item.id == annotation.id;
    });
    if(index==-1) return Promise.reject();
    annotations.value.splice(index,1);
    return deleteAnnotationDB(annotation);
  }

  /**
   * 
   * @param {Object[]} json List of Annotation or Ocr Annotation
   * @param {string} json[].id Unique ID of Annotation
   * @param {string} json[]._type Type of Annotation: "describing" | "tagging" | "ocrtext"
   * @param {boolean} saveDB 
   * @returns {Promise} 
   */
  function loadJSON (json=[], saveDB=false){
    const annots_list = [];
    const ocrs_list = [];
    json.forEach(item=>{
      if(item["_type"]=="describing" || item["_type"]=="tagging"){
        annots_list.push(item);
      }
      else if(item["_type"]=="ocrtext"){
        ocrs_list.push(item);
      }
    });
    setAnnotations(annots_list, true);
    setOcrs(ocrs_list, true);
    if(saveDB){
      return setAnnotationsDB(annots_list);
    }
    return Promise.resolve();
  }

  async function loadDefaultJSON(){
    const resp = await fetch("./default.json");
    const json = await resp.json();
    console.log("load default");
    return await loadJSON(json, false);
  }

  const setAnnotationDB = (annotation)=>{

  };
  const setAnnotationsDB = (list)=>{

  };
  const deleteAnnotationDB = (annotation)=>{

  };

  return {
    annotations,
    ocrs,
    addAnnotation,
    addAnnotations,
    updateAnnotation,
    updateAnnotations,
    deleteAnnotation,
    loadJSON,
    loadDefaultJSON,
    setOcrs,
  }
});