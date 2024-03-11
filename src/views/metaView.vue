<template>
  <div>bookid: {{ bookid }}</div>
  <div><pre>{{ JSON.stringify(currentMeta,null,2) }}</pre></div>
</template>
<script>
import metalist from "../metalist.js";

export default {
  computed:{
    bookid(){
      return this.$route.params.bookid;
    },
    currentMeta(){
      const currentid = this.bookid;
      return metalist.list.find(meta=>meta.bookid==currentid);
    }
  },
  beforeRouteUpdate(to,from,next){
    console.log(to,from);
    const nextid = to.params.bookid;
    if(metalist.list.findIndex(meta=>meta.bookid==nextid)!=-1){
      next();
    }
    else{
      console.log("!")
      next(false);
    }
  }
}

</script>