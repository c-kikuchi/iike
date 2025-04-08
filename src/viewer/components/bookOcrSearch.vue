<style scoped>

</style>
<template>
<div>
  <div v-if="!has_ocr">
    [!] この巻にはOCRテキストがありません
  </div>
  <div v-else-if="!show_ocr">
    [!] ［OCR結果を表示］にチェックしてください
  </div>
  <div v-else>

  </div>
</div>
</template>
<script setup>
import { ref, computed, inject } from "vue";
import metalist from "../../metalist";

const annotStore = inject("annotStore");
const props = defineProps(["bookid", "show_ocr"]);
const current_meta = computed(()=>{
  return metalist.find(meta=>meta.bookid==props.bookid);
})
const has_ocr = computed(()=>{
  return !!current_meta.ocrtext;
})
const current_ocrs = computed(()=>{
  return annotStore.ocrs.filter(annot=>annot["_bookid"]==props.bookid);
});


</script>