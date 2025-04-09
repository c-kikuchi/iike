<style scoped>

</style>
<template>
<div style="margin-top:20px;margin-left:auto;margin-right:auto;width:480px;">
  
  <div>
    <RouterLink to="/"><strong>&lt;Home</strong></RouterLink>
  </div>
  <akiyasuOcrSearch 
    show_title="true" 
    :search_word="search_word"
    @input="on_input"
  ></akiyasuOcrSearch>
</div>
</template>
<script setup>
import akiyasuOcrSearch from '@/viewer/components/akiyasuOcrSearch.vue';
import { ref, onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const search_word = ref("");

function on_input(query){
  router.replace({path:"/akiyasu-search/"+query});
}

onMounted(()=>{
  const route_word = route.params.word;
  if(route_word) search_word.value = route_word;
})


</script>