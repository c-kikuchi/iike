<style scoped>
.drag-panel {
  box-sizing:border-box;
  position:absolute;
  background-color:#fcfcfc;
  border:rgba(0,0,0,0.2) solid 1px;
  width:fit-content;
  height:fit-content;
  max-width:800px;
  max-height:800px;
}
.drag-panel:hover {
  box-shadow:#ccc 0 1px 2px;
}
.drag-panel-inner {
  width:100%;
  height:100%;
  box-sizing:border-box;
  padding:5px;
  cursor:move;
}
.drag-panel-inner * {
  box-sizing: border-box;
  pointer-events:none;
}
.drag-panel-inner img {
  width:100%;
}
.drag-panel-inner textarea{
  width:100%;
  height:100%;
  font-size:1.2em;
  resize:none;
  pointer-events:auto;
} 
.drag-handle {
  position:absolute;
  width:10px;
  height:10px;
  background-color:#000;
  opacity:0.3;
}
.drag-handle:hover {
  opacity:1;
}
.drag-handle.bottomright {
  bottom:-5px;
  right:-5px;
  cursor:nwse-resize;
}
.remove-button {
  position:absolute;
  top:-8px;
  right:-8px;
  height:16px;
  width:16px;
  border-radius:8px;
  border:rgba(0,0,0,0.2) solid 1px;
  background-color: #fefefe;
  color:#999;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor:pointer;
}
.remove-button:hover {
  border-color:#ccc;
  color:#333;
}
</style>

<template>
<div class="drag-panel" ref="panel" :style="
  {
    translate:`${dx}px ${dy}px`,
    width:`${width}px`,
    height:(isImage?'fit-content':`${height}px`),
    minWidth:`${min_width}px`,
    minHeight:`${min_height}px`,
    zIndex:z
  }
  " @pointerdown="bringToFront">
  <div class="drag-panel-inner" @pointermove="ondrag($event)">
    <textarea v-if="props.type=='text'" v-model="value"></textarea>
    <img v-if="props.type=='image'" :src="props.src">
    <slot v-if="props.type=='html'"></slot>
  </div>
  <div class="remove-button" @click="onremove" v-if="props.removable">×</div>
  <div class="drag-handle bottomright" @pointermove="onresize($event)"></div>
</div>
</template>

<script>
let topZ = 0;
let idcounter = 0;
</script>
<script setup>
import {ref, computed, onMounted} from "vue";
const value = defineModel({default:""});
const props = defineProps({
  name:{
    type:[String, Number],
    default:()=>Date.now()+""+("0"+Math.floor(Math.random()*256)).slice(-3)+idcounter++
  },
  type:{
    type:String,
    default:"text"
  },
  src:{
    type:String
  },
  width:{
    type:Number
  },
  height:{
    type:Number
  },
  removable:{
    type:Boolean,
    default:false
  }
});
const emit = defineEmits(["remove"]);

const isImage = computed(()=>{
  return props.type=="image";
})
const panel = ref(null);
const dx = ref(0);
const dy = ref(0);
const width = ref(0);
const height = ref(0);
const min_width = 120;
const min_height = 80;

const z = ref(++topZ);
function bringToFront(){
  z.value = ++topZ;
}

onMounted(()=>{
  if(props.width) width.value = props.width;
  if(props.height) height.value = props.height;
})

function initSize(){
  if(width.value==0){
    width.value = panel.value.offsetWidth;
    height.value = panel.value.offsetHeight;
  }
}

function ondrag(e){
  if(e.buttons < 1) return;
  dx.value += e.movementX;
  dy.value += e.movementY;
  e.target.setPointerCapture(e.pointerId);
}

function onresize(e){
  if(e.buttons < 1) return;
  initSize();
  width.value = Math.max(width.value + e.movementX, min_width);
  if(!isImage.value){
    height.value = Math.max(height.value + e.movementY, min_height);
  }
  e.target.setPointerCapture(e.pointerId);
}

function onremove(){
  emit("remove", props.name);
}
</script>