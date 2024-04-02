<script setup>
import { onMounted, provide, ref } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { getAuth, onAuthStateChanged } from "firebase/auth";

//import { useStore } from 'vuex';
//const store = useStore();
/*onMounted(()=>{
  console.log("root mounted");
  store.dispatch("loadDefaultJSON");
})*/

const router = useRouter();
const auth = getAuth();

const loggedin = ref(false);
provide("loggedin", loggedin);

onMounted(()=>{
  onAuthStateChanged(auth, user=>{
    if(!user){
      console.log("logged out");
      loggedin.value = false;
      router.replace("/login");
    }
    else{
      loggedin.value = true;
      console.log("logged in");
    }
  })
})
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
