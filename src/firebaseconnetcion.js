
import { initializeApp } from "firebase/app";
import firebaseConfig from './firebaseconfig';
import { getFirestore, getDocs, setDoc, collection, doc, writeBatch, query, where, or, and } from "firebase/firestore";

function splitArray(array, num){
  num = num || 1;
  const newarray = [];
  for (let i=0; i<array.length; i+=num){
    newarray.push(array.slice(i,i+num));
  }
  return newarray;
}
function generateID(){
  return (Date.now()+(Math.floor(Math.random()*100000)+""))
}

const firebaseApp = initializeApp(firebaseConfig);
console.log("firebase initialized");
const db = getFirestore(firebaseApp);

const envMode = import.meta.env.MODE;
const isDev = envMode=="development";

const annotationCollectionPath = isDev?"annotation-test":"annotation";
const ocrCollectionPath = isDev?"ocr-test":"ocr";

const dbconnection = {
  async getAnnotations(bookid){
    if(!bookid){
      throw new Error("bookid is invalid");
    }
    const coll = collection(db, annotationCollectionPath);
    const q = query(coll,
      and(
        where("_bookid", "==", bookid),
        or(
          where("_type", "==", "describing"),
          where("_type", "==", "tagging")
        )
      )
    );
    console.time("getdoc");
    const querySnapshot = await getDocs(q);
    console.timeEnd("getdoc");
    return querySnapshot.docs.map(doc=>doc.data());
  },
  setAnnotation(annotation){
    console.log("set annotation");
    if(!annotation._bookid){
      throw new Error("_bookid is invalid");
    }
    if(annotation._type != "describing" && annotation._type != "tagging"){
      throw new Error("_type must be describing or tagging")
    }
    const id = annotation.id || generateID();
    const coll = collection(db, annotationCollectionPath);
    const docref = doc(coll, id);
    return setDoc(docref, annotation);
  },
  setAnnotations(list){
    console.log("set annotations");
    const coll = collection(db, annotationCollectionPath);
    return Promise.all(splitArray(list,500).map(slist=>{
      console.log("slist", slist);
      const batch = writeBatch(db);
      slist.forEach(item=>{
        if(!item._bookid){
          throw new Error("_bookid is invalid");
        }
        if(item._type != "describing" && item._type != "tagging"){
          throw new Error("_type must be describing or tagging")
        }
        const id = item.id || generateID();
        console.log("saving", id);
        const docref = doc(coll, id);
        batch.set(docref, item);
      });
      return batch.commit();
    }));
  },
  deleteAnnotation(annotation){
    if(!annotation.id){
      throw new Error("id is invalid");
    }
    const docref = doc(db, annotationCollectionPath, annotation.id);
    return deleteDoc(docref);
  },
  async getOcrs(bookid){
    return [];
    if(!bookid){
      throw new Error("bookid is invalid");
    }
    const coll = collection(db, ocrCollectionPath);
    const q = query(coll,
      where("_type", "==", "ocrtext"),
      where("_bookid", "==", bookid)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc=>doc.data());
  },
  setOcr(ocrannot){
    return;
    if(!ocrannot._bookid){
      throw new Error("_bookid is invalid");
    }
    if(ocrannot._type != "ocrtext"){
      throw new Error("_type must be describing or tagging")
    }
    const id = ocrannot.id || generateID();
    const coll = collection(db, ocrCollectionPath);
    const docref = doc(coll, id);
    return setDoc(docref, ocrannot);
  },
  setOcrs(list){
    return;
    const coll = collection(db, ocrCollectionPath);
    return Promise.all(splitArray(list,500).map(slist=>{
      const batch = writeBatch(db);
      slist.forEach(item=>{
        if(!item._bookid){
          throw new Error("_bookid is invalid");
        }
        if(item._type != "ocrtext"){
          throw new Error("_type must be describing or tagging")
        }
        const id = item.id || generateID();
        const docref = doc(coll, id);
        batch.set(docref, item);
      });
      return batch.commit();
    }));
  },
  saveTest(annotations){
    const test_coll = collection(db, annotationCollectionPath);
    const batch = writeBatch(db);
    annotations.forEach(item=>{
      const docref = doc(test_coll, item.id);
      batch.set(docref, item);
    })
    return batch.commit()
  },
  async loadTest(){
    const test_coll = collection(db, annotationCollectionPath);
    const querySnapshot = await getDocs(test_coll);
    const list = querySnapshot.docs.map(doc=>doc.data());
    return list;
  }
};

export {dbconnection};