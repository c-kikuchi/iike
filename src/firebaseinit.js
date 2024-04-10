import { initializeApp } from "firebase/app";
import firebaseConfig from './firebaseconfig';

const fbApp = initializeApp(firebaseConfig);
console.log("firebase initialized");

export default fbApp;