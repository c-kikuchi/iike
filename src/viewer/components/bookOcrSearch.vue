<style scoped>
.caution-message{
  background-color: #f99;
  color:#f00;
  border:solid 1px #f00;
  padding:10px;
  text-align:center;
  font-weight:bold;
}

</style>
<template>
<div>
  <div v-if="!has_ocr">
    <div class="caution-message">
      [!] この巻にはOCRテキストがありません
    </div>
  </div>
  <div v-else-if="!show_ocr">
    <div class="caution-message">
      [!] ［OCR結果を表示］にチェックしてください
    </div>
  </div>
  <div v-else>
    <div class="control">
      <input v-model="search_query"><br>
      <label><input type="checkbox" v-model="only_this_page"><small>このページのみ検索</small></label><br>
      {{ current_ocrs.length }} Annotations
    </div>

  </div>
</div>
</template>
<script setup>
import { ref, computed, inject } from "vue";
import metalist from "../../metalist";

const annotStore = inject("annotStore");
const props = defineProps(["bookid", "show_ocr", "currentPage"]);
const emit = defineEmits(["navigate"]);
const current_meta = computed(()=>{
  return metalist.find(meta=>meta.bookid==props.bookid);
});
const imageUrlRoot = computed(()=>{
  const meta = current_meta.value;
  return meta.imageUrl.server+meta.imageUrl.prefix+meta.identifier+meta.imageUrl.suffix
});
const getpage_exp = computed(()=>{
  return new RegExp(`^${imageUrlRoot.value}(.+)${current_meta.value.imageUrl.extension}$`)
})
const has_ocr = computed(()=>{
  return !!current_meta.value.ocrtext;
})
const current_book_ocrs = computed(()=>{
  return annotStore.ocrs.filter(annot=>annot["_bookid"]==props.bookid);
});
const current_ocrs = computed(()=>{
  return only_this_page.value?current_book_ocrs.value.filter(annot=>get_page(annot)==props.currentPage):current_book_ocrs.value;
})

const only_this_page = ref(false);
const search_query = ref("");
const search_results = ref([]);

function get_page(annotation){
  if(annotation._page){
    return annotation._page;
  }
  else{
    return getpage_exp.value.test(annotation.target.source)?RegExp.$1:"";
  }
}

</script>