<style scoped>
.loginform {
  position:fixed;
  inset:0;
  margin:auto;
  width:fit-content;
  height:fit-content;
  text-align:center;
}
.pwinput {
  font-size:large;
}
.loginbtn {
  margin:10px;
  padding:5px 10px;
}
.errormsg {
  border: 1px solid #f66;
  background-color: #fcc;
  border-radius:10px;
  padding:5px;
  font-size:smaller;
}
.errormsg.hidden {
  visibility: hidden;
}
</style>

<template>
<div class="loginform">
  <h1>
    <img src="/ii-icon_256.png" style="width:64px; height:64px; vertical-align: bottom;">
    Login
  </h1>
  <p>
    <input type="password" v-model="pw" class="pwinput"><br>
    <button @click="login" class="loginbtn">ログイン</button>
  </p>
  <p class="errormsg" :class="{hidden:isNotError}">
    [!] {{ message }}
  </p>
</div>

</template>
<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";


export default {
  data(){
    return {
      pw:"",
      code:"",
      message:""
    }
  },
  computed:{
    isNotError(){
      return !this.code && !this.message;
    }
  },
  methods:{
    login(){
      this.code="";
      this.message="";
      const auth = getAuth();
      const email = "iike@ii-annote.web.app";
      const password = this.pw;
      signInWithEmailAndPassword(auth, email, password).then(userCredential=>{
        let path = "/";
        const savedPath = sessionStorage.getItem("backPath");
        if(savedPath!=null){
          path = savedPath;
          sessionStorage.removeItem("backPath");
        }
        this.$router.replace(path);
      }).catch(error=>{
        this.code = error.code;
        this.message = error.message;
        console.error(error.code, error.message);
      })
    }
  }
}

</script>