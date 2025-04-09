import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { dbconnection } from "./firestoreconnection.js"
import metalist from "@/metalist.js";
import ocrManifestConverter from "@/viewer/components/ocrManifestConverter.js";

export const useAnnotationsStore = defineStore("annotations", ()=>{
  console.log("initializing annotation store");

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
        annotations.value.push(item);
      }
    })
  }
  /**
   * Delete Annotations (local)
   * @private
   * @param {Object[]} list List of Annotations
   * @param {string} list[].id Unique ID of Annotation
   */
  function removeAnnotations(list){
    const listIdSet = new Set(list.map(item=>item.id));
    for (let i=0; i<annotations.value.length && listIdSet.size;){
      const id = annotations.value[i].id;
      if(listIdSet.delete(id)){
        annotations.value.splice(i,1);
      }
      else{
        i++;
      }
    }
  }

  /**
   * Append or Update Ocr Annotation (local)
   * @private
   * @param {Object[]} list List of Ocr Annotation
   * @param {string} list[].id Unique ID of Annotation
   * @param {boolean} [forceUpdate=false] 
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
        ocrs.value.push(item);
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
   * Load Annotation and Ocr List JSON
   * @param {Object[]} json List of Annotation or Ocr Annotation
   * @param {string} json[].id Unique ID of Annotation
   * @param {string} json[]._type Type of Annotation: "describing" | "tagging" | "ocrtext"
   * @param {boolean} [saveDB=false] Flag for saving to DB.
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

  /**
   * Load Default JSON
   * @returns {Promise}
   */
  async function loadDefaultJSON(){
    const resp = await fetch("./default.json");
    const json = await resp.json();
    console.log("load default");
    return await loadJSON(json, false);
  }

  /**
   * Load Annotations and Ocrs from DB.
   * @param {string} bookid 
   * @param {boolean} [forceUpdate=false]
   * @param {boolean} [loadOcrs=false] 
   * @returns {Promise}
   */
  function loadAnnotations(bookid="", forceUpdate=false, loadOcrs=false){
    const p = [];
    p.push(loadAnnotationsDB(bookid, forceUpdate));
    if(loadOcrs){
      p.push(loadOcrsDB(bookid));
    }
    return Promise.all(p);
  }

  function loadAnnotations_onlyOCR(bookid=""){
    return loadOcrsDB(bookid);
  }

  const dbloadedlist = new Set();
  const dbdiffs = {};
  //const dbsetlist = new Set();
  //const dbdeletelist = new Set();

  function setAnnotationDB(annotation){
    if(!annotation) return Promise.reject();
    //dbsetlist.add(annotation.id);
    return dbconnection.setAnnotation(annotation);
  }
  function setAnnotationsDB(list){
    if(!list.length) return Promise.reject();
    //list.forEach(item=>dbsetlist.add(item.id));
    return dbconnection.setAnnotations(list);
  }
  function deleteAnnotationDB (annotation){
    if(!annotation) return Promise.reject();
    //dbdeletelist.add(annotation.id);
    return dbconnection.deleteAnnotation(annotation);
  }
  /**
   * Save All Annotation to DB.
   * @returns {Promise}
   */
  function saveAll(){
    return dbconnection.setAnnotations(annotations.value);
  }

  /**
   * Load Annotations from DB.
   * @private
   * @param {string} bookid 
   * @param {boolean} [forceUpdate]
   * @returns {Promise}
   */
  function loadAnnotationsDB(bookid, forceUpdate=false){
    if(!bookid){
      throw new Error("bookid is invalid");
    }
    if(dbloadedlist.has(bookid)){
      console.log("re-loading", bookid, dbdiffs[bookid].appends.length, dbdiffs[bookid].deletes.length);
      setAnnotations(dbdiffs[bookid].appends, forceUpdate);
      removeAnnotations(dbdiffs[bookid].deletes);
      dbdiffs[bookid].appends = [];
      dbdiffs[bookid].deletes = [];
      return Promise.resolve();
    }
    else{
      console.log("first time loading", bookid)
      dbloadedlist.add(bookid);
      dbdiffs[bookid] = {appends:[], deletes:[]};
      return dbconnection.startLoadingAnnotation(bookid, (type, annotation, source)=>{
        if(source=="server"){
          if(type=="added" || type=="modified"){
            dbdiffs[bookid].appends.push(annotation);
          }
          else if(type=="removed"){
            dbdiffs[bookid].deletes.push(annotation);
          }
        }
      }).then(()=>{
        console.log("loading end!")
        setAnnotations(dbdiffs[bookid].appends, true);
        removeAnnotations(dbdiffs[bookid].deletes);
        dbdiffs[bookid].appends = [];
        dbdiffs[bookid].deletes = [];
      })
    }
  }

  const ocrloadedlist = new Set();
  async function loadOcrsDB(bookid){
    if(!bookid){
      throw new Error("bookid is invalid");
    }
    //console.log(bookid);
    const meta = metalist.list.find(m=>m.bookid==bookid);
    const url = meta.ocrtext;
    //console.log(url);
    if(!url) return;
    if(ocrloadedlist.has(url)){
      console.log(`ocr for ${bookid} is already loaded.`)
      return;
    }
    console.log("loading ocr for", bookid);
    const resp = await fetch(url);
    const manifest = await resp.text();
    //console.log(manifest);
    const json = ocrManifestConverter(JSON.parse(manifest), bookid);
    setOcrs(json, true);
    ocrloadedlist.add(url);
    return true;
  }

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
    loadAnnotations,
    loadAnnotations_onlyOCR,
    setOcrs,
    saveAll
  }
});