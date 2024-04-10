<script setup>
import { onMounted, provide, ref } from 'vue';
import { RouterView, useRouter, useRoute } from 'vue-router';
import fbApp from "./firebaseinit";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {useAnnotationsStore} from "@/stores/annotations";

//import { useStore } from 'vuex';
//const store = useStore();
/*onMounted(()=>{
  console.log("root mounted");
  store.dispatch("loadDefaultJSON");
})*/

const router = useRouter();
const route = useRoute();
const auth = getAuth(fbApp);
const annotStore = useAnnotationsStore();

const loggedin = ref(false);
const logout = ()=>{
  signOut(auth);
};

provide("loggedin", loggedin);
provide("logout", logout);
provide("annotStore", annotStore);

onMounted(()=>{
  onAuthStateChanged(auth, user=>{
    if(!user){
      console.log("logged out");
      if(route.fullPath != "/"){
        sessionStorage.setItem("backPath", route.fullPath);
      }
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
