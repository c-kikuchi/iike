<script setup>
import { inject } from "vue"
import { RouterLink } from "vue-router"
import { getAuth, signOut } from "firebase/auth";
import metalist from "../metalist.js"

//const envMode = import.meta.env.MODE

const loggedin = inject("loggedin");
const logout = function(){
  const auth = getAuth();
  signOut(auth);
}

</script>

<template>
  <main>
    <h1>
      <img src="/ii-icon_256.png" style="width:64px; height:64px; vertical-align: bottom;">
      ii Annote
    </h1>
    <nav>
      <div v-for="meta in metalist.list">
        <RouterLink :to="'/viewer/'+meta.bookid">{{ meta.title }}</RouterLink>
      </div>
      <!--<div>
        <a href="https://c-kikuchi.github.io/iiif/iike-15/manifest.json" target="_blank">Test Manifest</a>
      </div>-->
    </nav>
    <div style="margin-top:20px;" v-if="loggedin">
      <button @click="logout">Log out</button>
    </div>
  </main>
</template>
