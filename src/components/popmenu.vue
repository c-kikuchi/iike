<style scoped>
.popmenuwrapper {
  position:relative;
}
.popmenuwrapper.inline {
  display:inline-block;
}
.popmenuopener {
	display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
	padding: 5px;
	width: 30px;
	height: 30px;
	line-height: 20px;
	background-color: #0090ff;
	color: #fff;
}
.popmenuopener.small {
  padding:3px;
  width:20px;
  height:20px;
  line-height:14px;
}
.popmenuopener.border {
  border:solid 1px #fff;
}
.popmenu {
  position:absolute;
  left:0;
  right:auto;
  z-index:1;
  background-color:#fff;
  margin:0;
  padding:0;
  min-width:120px;
  box-shadow:#999 3px 3px 3px;
  border:rgb(170, 184, 204) solid 1px;
}
.popmenu.right {
  right:0;
  left:auto;
}
.popmenu > :slotted(li) {
  list-style-type:none;
  background-color:#eee;
  border-bottom:#333 solid 1px;
  padding:5px 15px;
  cursor:pointer;
  font-size:small;
}
.popmenu > :slotted(li):hover {
  background-color:#aadaff;
}
.popmenu > :slotted(li):last-child {
  border-bottom-style: none;
}
</style>
<template>
<div class="popmenuwrapper" :class="{'inline':inline}">
  <label class="popmenuopener" :class="{'small':small,'border':border}">
    <input type="checkbox" v-model="showmenu" style="display:none;">…
  </label>
  <menu class="popmenu" v-show="showmenu" :class="{'right':right}">
    <slot />
  </menu>
</div>
</template>
<script setup>
import { ref } from "vue"
const props = defineProps({
  "right":{
    type:Boolean, 
    default:false
  },
  "inline":{
    type:Boolean,
    default:false
  },
  "small":{
    type:Boolean,
    default:false
  },
  "border":{
    type:Boolean,
    default:false
  }

})
const showmenu = ref(false);

document.addEventListener("click", e=>{
  if(!e.target.closest(".popmenuwrapper")){
    showmenu.value = false;
  }
})
</script>