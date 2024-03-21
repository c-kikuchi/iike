<script setup>
//import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
//import { useStore } from 'vuex';

//const store = useStore();


/*onMounted(()=>{
  console.log("root mounted");
  store.dispatch("loadDefaultJSON");
})*/
</script>

<template>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  background-color: rgb(162, 255, 186);
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}


</style>
