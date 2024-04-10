<template>
<div>
  <div class="control">
    Name: <input v-model="username_temp" size="20">
    Message: <input v-model="message_temp" size="50">
    <button @click="addMessage">Post</button>
  </div>
  <div id="msg_container">
    <div v-for="message in messages">
      {{ message.username }} : {{ message.message }}
    </div>
  </div>
</div>
</template>
<script>
import fbApp from "../firebaseinit";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";

const db = getFirestore(fbApp);

export default {
  data(){
    return {
      message_temp:"",
      username_temp:"",
      firsttime:true,
      messages:[]
    }
  },
  methods:{
    async addMessage(){
      const message = this.message_temp;
      const username = this.username_temp;
      const coll = collection(db, "messages");
      const docref = await addDoc(coll, {
        message,
        username,
        deleted:false
      });
      console.log("added:", docref.id);      
      this.message_temp = "";
    }
  },
  mounted(){
    const coll = collection(db, "messages");
    (new Promise((resolve)=>{
      onSnapshot(coll, snapshot=>{
        snapshot.docChanges().forEach(change=>{
          console.log(change.type, change.doc.data(), change.doc.metadata.hasPendingWrites);
          if(change.type=="added"){
            this.messages.push(change.doc.data())
            resolve();
          }
        })
      })
    })).then(()=>{
      console.log("resolved!");
    });
  }
}

</script>