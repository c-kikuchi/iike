<script setup>
import {RouterLink} from "vue-router"
import metalist from "../metalist.js"

const isDev = import.meta.env.MODE

</script>

<template>
  <main>
    <h1><img src="/ii-icon_256.png" style="width:64px; height:64px; vertical-align: bottom;">ii Annote Home</h1>
    <nav>
      <div v-for="meta in metalist.list">
        <RouterLink :to="'/viewer/'+meta.bookid">{{ meta.title }}</RouterLink>
      </div>
      <!--<div>
        <a href="https://c-kikuchi.github.io/iiif/iike-15/manifest.json" target="_blank">Test Manifest</a>
      </div>-->
    </nav>
    <div>
      mode: {{ isDev }}
    </div>
  </main>
</template>
