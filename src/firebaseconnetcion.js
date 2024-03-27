
import { initializeApp } from "firebase/app";
import firebaseConfig from './firebaseconfig';
import { getFirestore, getDocs, collection, doc, writeBatch } from "firebase/firestore";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const dbconnection = {
  saveTest(){
    const test_coll = collection(db, "annotation-test");
    const batch = writeBatch(db);
    context.state.annotations.forEach(item=>{
      const docref = doc(test_coll, item.id);
      batch.set(docref, item);
    })
    return batch.commit()
  },
  async loadTest(){
    const test_coll = collection(db, "annotation-test");
    const querySnapshot = await getDocs(test_coll);
    const list = querySnapshot.docs.map(doc=>doc.data());
    return list;
  }
};

export {dbconnection};