<style scoped>
h1 {
  font-size:large;
  text-align:center;
}
.control{
  border:1px solid #999;
  padding:10px;
  margin-bottom:10px;
}
.search{
  margin:5px;
}
.search_input{
	background-color: #eee;
	padding: 3px;
	width: 250px;
	border: none;
}
</style>
<template>
<div>
  <h1 v-if="show_title">アノテーション一覧</h1>
  <div class="search">
    <input placeholder="読込済みのアノテーションへ移動" v-model="search_id" class="search_input">
    <button @click="goto_annotation">Jump</button>
  </div>
  <div class="control">
    ページ内のアノテーション: <span>{{ annotation_list.length }}{{ all_length>0?(` / ${all_length}`):"" }}</span><br>
    <label><input type="checkbox" v-model="show_ocrs">OCRテキストを含める</label>
  </div>
  <div>
    <div v-for="annotation in annotation_list" :key="annotation.id">
      <details>
        <summary>{{ annotation.id }}</summary>
        <button @click="selectAnnotation(annotation.id)">アノテーションを選択</button>
        <pre>{{ JSON.stringify(annotation, null, 2) }}</pre>
      </details>
    </div>
  </div>
</div>
</template>
<script setup>
import { ref, computed } from "vue";
const emit = defineEmits(["selectAnnotation"])
const props = defineProps({
  currentAnnotations:{
    type: Array,
    required: true,
    default:[]
  },
  show_title:{
    type:Boolean,
    default: true
  },
  all_length:{
    type:Number,
    default:0
  }
})
const show_ocrs = ref(false);
const annotation_list = computed(()=>{
  return props.currentAnnotations.filter(annot=>(show_ocrs.value || annot._type!="ocrtext"));
})
function selectAnnotation(id){
  //console.log("id",id);
  emit("selectAnnotation", id);
}
const search_id = ref("");
function goto_annotation(){
  if(search_id.value){
    emit("selectAnnotation", search_id.value, true);
  }
}
</script>