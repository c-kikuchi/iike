<style scoped>
main {
	max-width: 800px;
	margin: auto;
	padding: 20px 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
}
h1 {
  text-align: center;
}
h3 {
	color: #1F6480;
	text-align: center;
	border-bottom: solid 3px;
}
h3::before {
	content: "■";
	color: #DC2328;
}

.ii-nav {
  margin: 0 30px;
}
.ii-link {
  color: #333
}

</style>
<script setup>
import { inject, ref } from "vue"
import { RouterLink } from "vue-router"
import metalist from "../metalist.js"

//const envMode = import.meta.env.MODE

const loggedin = inject("loggedin");
const logout = inject("logout");
const envMode = import.meta.env.MODE;
const isDev = ref(envMode=="development");

const metalist_categorized = ref(metalist.categories.map(cat=>{
  return {
    name:cat,
    list:metalist.list.filter(item=>item.category == cat)
  };
}));

</script>

<template>
  <main>
    <h1>
      <img src="/ii-icon_256.png" style="width:64px; height:64px; vertical-align: bottom;">
      ii Annotator
    </h1>
    <nav class="ii-nav">
      <div v-for="category in metalist_categorized">
        <h3>{{ category.name }}</h3>
        <div v-for="meta in category.list">
          <RouterLink class="ii-link" :to="'/viewer/'+meta.bookid">{{ meta.title }}</RouterLink>
        </div>
      </div>
      <!--<div>
        <a href="https://c-kikuchi.github.io/iiif/iike-15/manifest.json" target="_blank">Test Manifest</a>
      </div>-->
    </nav>
    <!--<div style="margin-top:50px;" v-if="isDev">
      <RouterLink to="/storetest">storetest</RouterLink>
    </div>-->
    <div style="margin-top:50px" v-if="isDev">
      <RouterLink to="/akiyasu-search">松平昭休原本OCR検索</RouterLink>
    </div>
    <div style="margin-top:50px;" v-if="loggedin">
      <button @click="logout">Log out</button>
    </div>
    <div style="margin-top:50px;font-size:x-small;text-align:center">
      &copy; 2024 UTokyo Historiographical Institute<br>
      Author: c-kikuchi@hi.u-tokyo.ac.jp
    </div>
  </main>
</template>
