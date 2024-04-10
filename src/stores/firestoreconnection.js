import fbApp from "../firebaseinit";
import { getFirestore, onSnapshot, setDoc, collection, doc, writeBatch, query, where, or, and } from "firebase/firestore";

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

const db = getFirestore(fbApp);

const envMode = import.meta.env.MODE;
const isDev = envMode=="development";

const annotationCollectionPath = isDev?"annotation-test":"annotation";

const dbconnection = {
  setAnnotation(annotation){
    console.log("set annotation to db");
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
    console.log("set annotations to db");
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
    console.log("delete annotation from db.")
    if(!annotation.id){
      throw new Error("id is invalid");
    }
    const docref = doc(db, annotationCollectionPath, annotation.id);
    return deleteDoc(docref);
  },
  startLoadingAnnotation(bookid, callback=(type, annotation, source)=>{}){
    console.log("loading annotation from db.")
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
    return new Promise(resolve=>{
      onSnapshot(q, snapshot=>{
        snapshot.docChanges.forEach(change=>{
          const type = change.type;
          const annotation = change.doc.data();
          const source = change.doc.metadata.hasPendingWrites ? "local" : "server";
          callback(type, annotation, source);
          resolve();
        })
      })
    })

  }
}

export { dbconnection }