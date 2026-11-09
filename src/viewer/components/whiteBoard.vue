<style scoped>
.wrapper {
  position:relative;
  width:100%;
  height:100%;
  display:flex;
  flex-direction: column;
}
.droparea {
  flex-grow: 1;
  position: relative;
  margin:10px;
  border:#999 solid 1px;
  border-radius:8px;
}
.controls {
  height:30px;
  padding:0 10px;
}
</style>

<script setup>
import {ref} from "vue";
import dragPanel from '@/components/dragPanel.vue';

const list = ref([]);
function removeitem(name){
  const index = list.value.findIndex(item=>item.name==name);
  list.value.splice(index, 1);
}
function clearAll(){
  if(confirm("全削除しますか?")){
    list.value = [];
  }
}

function ondrop(e){
  e.preventDefault();
  const data = e.dataTransfer;
  procDataTransfer(data);
}
function onpaste(e){
  e.preventDefault();
  const data = e.clipboardData || window.clipboardData;
  procDataTransfer(data);
}
function procDataTransfer(data){
  const text = data.getData("text");
  if(text){
    addTextPanel(text);
  }
  else{
    if(data.files.length){
      for(const file of data.files){
        addImagePanel(file);
      }
    }
    else if(data.items.length){
      for(const item of data.items){
        if(item.kind=="string"){
          item.getAsString(str=>{
            addTextPanel(str);
          })
        }
        else{
          const file = item.getAsFile();
          addImagePanel(file);
        }
      }
    }
  }
}

const generateId = (()=>{
  let idcounter = 0;
  return function(){
    return Date.now()+("0"+Math.floor(Math.random()*256)).slice(-3)+("000"+idcounter++).slice(-4);
  }
})();
function addTextPanel(text){
  list.value.push({
    name:generateId(),
    type:"text",
    value:text,
  })
}
function addImagePanel(file){
  //console.log("filename",file.name, "filetype",file.type);
  const objurl = URL.createObjectURL(file);
  list.value.push({
    name:generateId(),
    type:"image",
    src:objurl
  })
}
</script>

<template>
<div class="wrapper">
  <div class="droparea"
    @drop="ondrop($event)"
    @dragover.prevent
    @paste="onpaste($event)">
    
    <template  v-for="item in list" :key="item.name">
      <dragPanel 
        v-if="item.type=='text'"
        type="text"
        :name="item.name"
        v-model="item.value"
        :width="200"
        removable
        @remove="removeitem"></dragPanel>
      <dragPanel 
        v-if="item.type=='image'"
        type="image"
        :name="item.name"
        :src="item.src"
        :width="200"
        removable
        @remove="removeitem">></dragPanel>
    </template>

  </div>
  <div class="controls">
    <a href="javascript:void(0)" @click="addTextPanel('')" style="font-size:small">Add Text</a>&nbsp;
    <a href="javascript:void(0)" @click="clearAll" style="font-size:small">Clear All</a>
  </div>
</div>
</template>