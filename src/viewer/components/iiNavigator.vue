<style scoped>
h3 {
	color: #1F6480;
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
<template>
<nav class="ii-nav">
  <div v-for="category in metalist_categorized">
    <h3>{{ category.name }}</h3>
    <div v-for="meta in category.list">
      <RouterLink class="ii-link" :to="'/viewer/'+meta.bookid+'/'+meta.pages[0]" @click="$emit('navigated')">{{ meta.title }}</RouterLink>
    </div>
  </div>
</nav>
</template>
<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router"
import metalist from "../../metalist.js";

const emit = defineEmits(["navigated"]);

const metalist_categorized = ref(metalist.categories.map(cat=>{
  return {
    name:cat,
    list:metalist.list.filter(item=>item.category == cat)
  };
}));


</script>