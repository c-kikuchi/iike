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
})
const has_ocr = computed(()=>{
  return !!current_meta.ocrtext;
})
const current_ocrs = computed(()=>{
  return annotStore.ocrs.filter(annot=>annot["_bookid"]==props.bookid);
});

const search_query = ref("");

</script>