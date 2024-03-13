//import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import store from "./store.js"

const app = createApp(App)

app.use(router);
app.use(store);

app.mount('#app')

/*
async function hoge(){
  const annotations = await fetch("/iike/default.json").then(resp=>resp.json());
  app.$store.commit("addAnnotationByList", annotations);
  console.log("default load");
}

hoge();*/