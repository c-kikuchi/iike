<style scoped>
h1 {
  font-size:x-large;
  text-align: center;
}
.caution-message{
  background-color: #f99;
  border:solid 1px #f00;
  padding:10px;
  text-align:center;
  font-weight:bold;
}
.control{
  border:1px solid #333;
  padding:10px;
  margin-bottom:10px;
}
.search-input {
  font-size:medium;
  background-color: #eee; 
  border:none; 
  width:calc(100% - 30px); 
  padding:5px;
  margin-bottom:5px;
}
.result{
  border-bottom: 1px solid #666;
}
.page-link {
  color:#039;
}
.annot-link {
  color:#333;
  text-decoration: none;
}
.annot-link:hover {
  text-decoration: underline;
}
.reset-button {
  color:#ccc;
  cursor:pointer;
  padding-left:3px;
}
.reset-button:hover {
  color:#999;
}

</style>
<template>
<div class="root">
  <h1 v-show="show_title">松平昭休原本OCR検索</h1>
  <div class="control">
    <small>8-14冊が登録済みです</small><br>
    <input v-model="search_query" @input="exec_search();$emit('input',search_query)" placeholder="検索語" class="search-input">
    <span role="button" class="reset-button" title="clear input" @click="search_query=''">&#x1F5D9;</span><br>
    <div v-show="is_this_akiyasu"><label><input type="checkbox" v-model="only_this_book" @change="exec_search"><small>この冊のみ検索</small></label></div>
    <select v-model="sort_method" @change="exec_search">
      <option value="">関連度順</option>
      <option value="kan_page">巻・頁順</option>
    </select>
    {{ results_len }} / {{ current_ocrs.length }} hits
  </div>
  <div class="results">
    <div v-for="pg in search_results" class="result">
      <strong>『{{ pg.title }}』 <RouterLink class="page-link" :to="'/viewer/'+pg.bookid+'/'+pg.page" @click="$emit('navigate')">{{ pg.page }}</RouterLink></strong><br>
      <ul style="margin-top:0;">
        <li v-for="result in pg.results">
          <RouterLink class="annot-link" :to="'/viewer/'+pg.bookid+'/'+pg.page+'?id='+result.obj.id" @click="$emit('navigate')">
            <span v-html="result.highlight('<b>','</b>')"></span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</div>
</template>
<script setup>
import { ref, computed, inject, onMounted, watch } from "vue";
import {RouterLink} from "vue-router";
import fuzzysort from "fuzzysort";
import metalist from "../../metalist";

const annotStore = inject("annotStore");
const props = defineProps({
  show_title:{
    type:Boolean,
    default:true
  },
  search_word:{
    type:String,
    default:""
  },
  bookid:{
    type:String,
    default:""
  }
});
const emit = defineEmits(["navigate","input"]);

const getpage_exps = new Map();
metalist.list.forEach(meta=>{
  const bookid = meta.bookid;
  const imageUrlRoot = meta.imageUrl.server+meta.imageUrl.prefix+meta.identifier+meta.imageUrl.suffix;
  const exp = new RegExp(`^${imageUrlRoot}(.+)${meta.imageUrl.extension}$`);
  getpage_exps.set(bookid, exp);
})

const akiyasu_ocrs_ids = ref(metalist.list.filter(meta=>{
    return meta.category == "松平昭休往復書翰留:原本" && !!meta.ocrtext;
  }).map(meta=>meta.bookid));
const current_ocrs = computed(()=>{
  return annotStore.ocrs.filter(annot=>akiyasu_ocrs_ids.value.includes(annot["_bookid"]));
})

const search_query = ref("");
const search_results = ref([]);
const results_len = ref(0);
const sort_method = ref("");
const only_this_book = ref(false);

const is_this_akiyasu = computed(()=>{
  return props.bookid && akiyasu_ocrs_ids.value.includes(props.bookid);
})

function get_page(annotation){
  if(annotation._page){
    return annotation._page;
  }
  else{
    const getpage_exp = getpage_exps.get(annotation._bookid);
    return getpage_exp.test(annotation.target.source)?RegExp.$1:"";
  }
}

function exec_search(){
  const query = search_query.value;
  const search_target = current_ocrs.value.filter(annot=>{
    if(is_this_akiyasu.value && only_this_book.value){
      return annot._bookid == props.bookid;
    }
    return true;
  }).map(annot=>{
    if(annot.body[0]){
      annot.body = annot.body[0];
    }
    return annot;
  })
  const results = fuzzysort.go(query, search_target, {key:"body.value"});

  const sr = [];
  results_len.value = results.length;
  results.forEach(result=>{
    const bookid = result.obj._bookid;
    const page = get_page(result.obj)||"-";
    let pg = sr.find(r=>r.bookid==bookid && r.page==page);
    if(!pg){
      pg = { bookid, page, results:[], score:0, title:metalist.list.find(m=>m.bookid==bookid).title };
      sr.push(pg);
    }
    pg.results.push(result);
    if(pg.score < result.score) pg.score = result.score;
  });
  const sort_funcs = {
    score: (a,b)=>b.score - a.score,
    kan_page: (a,b)=>{
      if(a.bookid < b.bookid) return -1;
      else if(a.bookid > b.bookid) return 1;
      else return parseInt(a.page,10)-parseInt(b.page,10);
    }
  }
  sr.sort(sort_funcs[sort_method.value||"score"]);
  search_results.value = sr;
}


watch(()=>props.search_word, (new_word)=>{ 
  //console.log(new_word);
  search_query.value = new_word;
  exec_search();
})

onMounted(()=>{
  //console.log(props.search_word);
  if(props.search_word) search_query.value = props.search_word;
  akiyasu_ocrs_ids.value.forEach(bookid=>{
    annotStore.loadAnnotations_onlyOCR(bookid);
  });
})
</script>