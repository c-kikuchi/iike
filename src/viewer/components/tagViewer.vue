<style scoped>
.tag_viewer {
  padding:20px;
}
.tag-list-item summary {
	background-color: #eee;
	cursor: pointer;
	padding-left: 10px;
	border: #ccc solid 1px;
}
/*.tag-list-item:nth-child(2n) summary{
  background-color: #fff;
}*/
.tag-list-item {
  margin-bottom:3px;
}
</style>
<template>
<div class="tag-viewer">
  <div class="tag-list">
    <div class="tag-list-item" v-for="tag in tag_list_sorted" :key="tag.key">
      <details>
        <summary>
          <RouterLink
            :to="'/viewer/'+props.bookid+'/'+tag.pages[0]"
            @click="$emit('navigate')">
            {{ tag.key }}
          </RouterLink>
        </summary>
        <ul style="margin:0;">
          <li v-for="page in tag.pages">
            <RouterLink
              :to="'/viewer/'+props.bookid+'/'+page"
              @click="$emit('navigate')">
                {{ page }}
            </RouterLink>
          </li>
        </ul>
      </details>
    </div>
  </div>
</div>
</template>
<script setup>
import {ref, computed, inject} from 'vue';
import {RouterLink} from "vue-router";
import metalist from "../../metalist";

const annotStore = inject("annotStore");
const props = defineProps(["bookid"]);
const emit = defineEmits(["navigate"]);


const current_meta = computed(()=>{
  return metalist.list.find(meta=>meta.bookid==props.bookid);
});
const imageUrlRoot = computed(()=>{
  const meta = current_meta.value;
  return meta.imageUrl.server+meta.imageUrl.prefix+meta.identifier+meta.imageUrl.suffix
});
const getpage_exp = computed(()=>{
  return new RegExp(`^${imageUrlRoot.value}(.+)${current_meta.value.imageUrl.extension}$`)
});
function get_page(annotation){
  if(annotation._page){
    return annotation._page;
  }
  else{
    return getpage_exp.value.test(annotation.target.source)?RegExp.$1:"";
  }
}

function sort_intlike(a,b){
  const ai = parseInt(a);
  const bi = parseInt(b);
  if(!isNaN(ai - bi)){
    return ai - bi;
  }
  else{
    return (a > b)?1:((a < b)?-1:0);
  }
}
function parseIntLike(str){
  const num = (str|0)||parseInt(str);
  if(isNaN(num)){
    const lastnum = str.match(/(\d+)\D*$/)?.[1];
    return parseInt(lastnum);
  }
  return num;
}

const current_book_tags = computed(()=>{
  return annotStore.annotations.filter(annot=>(annot["_bookid"]==props.bookid && annot["_type"]=="tagging"));
});
const tag_list = computed(()=>{
  const mp = new Map();
  current_book_tags.value.forEach(annot=>{
    if(annot["_type"]!="tagging") return;
    const body = annot.body.find(b=>b.purpose=="tagging");
    if(!body) return;
    const value = body.value;
    const page = get_page(annot);
    if(!mp.has(value)){
      mp.set(value, new Set());
    }
    mp.get(value).add(page);    
  });
  return Array.from(mp.entries().map(([k, v])=>{
    const [bango, eda] = bango_split(k);
    return {key:k, pages:Array.from(v).sort(sort_intlike), bango, eda};
  }));
});
function bango_split(str){
  const i = str.indexOf("-");
  return i==-1 ? [str,""] : [str.slice(0,i), str.slice(i+1)];
}
const tag_list_sorted = computed(()=>{
  return tag_list.value.toSorted((a,b)=>{
    const [bango_a, eda_a] = [a.bango, a.eda];
    const [bango_b, eda_b] = [b.bango, b.eda];
    const comp_bango = sort_intlike(bango_a, bango_b);
    if(comp_bango!=0 || (!eda_a || !eda_b)){
      return comp_bango;
    }
    else {
      return sort_intlike(eda_a, eda_b); 
    }
   })
})


</script>