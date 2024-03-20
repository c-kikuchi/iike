//import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import store from "./store.js"
import { initializeApp } from "firebase/app";
import firebaseConfig from './firebaseconfig';
import { getFirestore, addDoc, collection } from "firebase/firestore";



const app = createApp(App)

app.use(router);
app.use(store);

app.mount('#app')

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
async function firebasetest(){
  const docRef = await addDoc(collection(db, "annotations"), {
    hoge:"tanaka",
    soge:"yamada"
  });
  console.log("Document written with ID: ", docRef.id);
}
firebasetest();
