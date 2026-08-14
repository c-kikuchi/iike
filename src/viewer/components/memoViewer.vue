<style scoped>
.memo-search {
  position:sticky;
  top:0px;
  background-color: rgba(255,255,255,0.8);
  padding:5px;
}

.search-input {
  font-size:medium; 
  background-color: #eee; 
  border:none;
  width:calc(100% - 30px);
  padding:5px;
}
.reset-button {
  color:#ccc;
  cursor:pointer;
  padding-left:3px;
}
.reset-button:hover {
  color:#999;
}

.memo-list, .memo-search-results {
  padding: 5px;
}

.memo-list-item {
  margin-top: 3px;
  border-bottom: solid 1px #ddd;
}
.memo-list-item:last-child{
  border-bottom-style: none;
}

.page-link {
  color:#039;
  cursor: pointer;
  font-size: smaller;
}
.annot-link {
  color:#333;
  text-decoration: none;
  cursor: pointer;
}
.annot-link:hover {
  text-decoration: underline;
}
</style>
<template>
<div class="memo-viewer">
  <div class="memo-search">
    <input v-model="search_query" @input="exec_search" placeholder="検索語" class="search-input">
    <span role="button" class="reset-button" title="clear input" @click="search_query=''">&#x1F5D9;</span><br>
    <label><input type="checkbox" v-model="only_this_page" @change="exec_search"><small>現在のページのみ</small></label>
    <span style="float:right; font-size:smaller; margin-top:3px">
      <select v-model="sort_method" @change="exec_search" v-show="is_searching">
        <option value="score">関連度順</option>
        <option value="page">ページ順</option>
      </select>
      {{ is_searching?(results_len + " / "):"" }}{{ memo_len }} 件
    </span>
  </div>
  <div class="memo-search-results" v-if="is_searching">
    <div class="memo-list-item" v-for="result in search_results">
      <div class="memo-list-item-link" style="float:right">
        <RouterLink
          class="page-link"
          :to="result.obj.link"
          @click="$emit('navigate')">
          {{ result.obj.page }}
        </RouterLink>
      </div>
      <div class="memo-list-item-value">
        <a class="annot-link"
          v-html ="result.highlight('<b>','</b>')"
          @click="$emit('selectAnnotation', result.obj.id)"></a>
      </div>
    </div>
  </div>
  <div class="memo-list" v-else>
    <div class="memo-list-item" v-for="memo in memo_list_sorted" :key="memo.id">
      <div class="memo-list-item-link" style="float:right">
        <RouterLink 
          class="page-link"
          :to="memo.link"
          @click="$emit('navigate')">
          {{ memo.page }}
        </RouterLink>
      </div>
      <div class="memo-list-item-values">
        <div v-for="value in memo.values" class="memo-list-item-value">
          <a class="annot-link"
            @click="$emit('selectAnnotation', memo.id)">
            {{ value }}
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

</template>
<script setup>
import {ref, computed, inject} from 'vue';
import {RouterLink} from "vue-router";
import fuzzysort from "fuzzysort";
import metalist from "../../metalist";

const annotStore = inject("annotStore");
const props = defineProps(["bookid","currentPage"]);
const emit = defineEmits(["navigate", "selectAnnotation"]);

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
function sort_by_page(page_a, page_b){
  const idx_a = current_meta.value.pages.indexOf(page_a);
  const idx_b = current_meta.value.pages.indexOf(page_b);
  if(idx_a==-1 || idx_b==-1){
    return sort_intlike(page_a, page_b);
  }
  return idx_a - idx_b;
}

const search_query = ref("");
const search_results = ref([]);
const only_this_page = ref(false);
const is_searching = computed(()=>search_query.value!="");
const sort_method = ref("score");

const current_book_memos = computed(()=>{
  return annotStore.annotations.filter(annot=>(annot["_bookid"]==props.bookid && annot["_type"]=="memo"));
});

const memo_list = computed(()=>{
  return current_book_memos.value.map(annot=>{
    const id = annot.id;
    const page = get_page(annot);
    const values = annot.body.filter(body=>(body.purpose=="commenting"||body.purpose=="replying"||!body.purpose)).map(body=>body.value);
    const link = '/viewer/'+props.bookid+'/'+page+'?id='+id;
    return {id, page, values, link};
  });
});
const memo_list_filtered = computed(()=>{
  const list = memo_list.value;
  return only_this_page.value?list.filter(item=>item.page==props.currentPage):list;
});
const memo_list_sorted = computed(()=>{
  const list = memo_list_filtered.value;
  return only_this_page.value?list:list.toSorted((a,b)=>{
    return sort_by_page(a.page, b.page);
  })
});
const memo_len = computed(()=>{
  return memo_list_filtered.value.length;
})
const results_len = ref(0);

function exec_search(){
  const query = search_query.value;
  const search_target = (()=>{
    const list = [];
    memo_list_filtered.value.forEach(item=>{
      item.values.forEach(value=>{
        list.push({id:item.id,page:item.page,value,link:item.link});
      })
    })
    return list;
  })();
  const results = fuzzysort.go(query, search_target, {key:"value"});
  results_len.value = results.length;

  if(sort_method.value != "score"){
    const sort_funcs = {
      page(a,b){
        return sort_by_page(a.obj.page, b.obj.page)
      }
    };
    results.sort(sort_funcs[sort_method.value]);
  }

  search_results.value = results;
}

</script>