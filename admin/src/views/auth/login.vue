<template>
  <div class="bgku">
    <div class="row items-center">
      <div class="col-11 col-md-3 fixed-center">

        <!-- <q-card class="my-card bgku">
            <br>
            <q-img src="img/LOGO.png" />
          <q-card-section>
            <hr />
            <br>
            <form>
              <q-input outlined square :dense="true" class="bg-white" placeholder="Username">
                <template v-slot:prepend>
                  <q-icon name="account_circle" />
                </template>
              </q-input>
              <br />

              <q-input
                outlined
                square
                :dense="true"
                class="bg-white"
                placeholder="Password"
                type="password"
              >
                <template v-slot:prepend>
                  <q-icon name="vpn_key" />
                </template>
              </q-input>
              <br />

              <q-btn push class="full-width" color="primary" icon-right="send" label="LOGIN" to="/" />
            </form>
            <br>
            <hr>
            
          </q-card-section>
          <div class="transAbu">
              <span class="h_fotter_title">Copyright : Diskominfo & DKPSDM Kab. Konawe Selatan</span>
          </div>
        </q-card> -->

        <div class="putihTrans formLogin shadow-5">
          <br>
            <q-img src="img/bloodform.png" />
            <hr />
            <br>



            <div v-if="errorMessage">
              <div  class="alertku shadow-2">
                <strong>Warning!</strong> {{ errorMessage }}.

              </div>
              <br>
            </div>

            <form @submit.prevent="btn_login()">
  <!-- Username -->
  <q-input
    v-model="user.username"
    outlined
    rounded
    :dense="true"
    color="red-10"
    bg-color="white"
    placeholder="Username"
    class="q-mb-md"
  >
    <template v-slot:prepend>
      <q-icon name="account_circle" color="red-7" />
    </template>
  </q-input>

  <!-- Password -->
  <q-input
    v-model="user.password"
    outlined
    rounded
    :dense="true"
    color="red-10"
    bg-color="white"
    placeholder="Password"
    :type="showPassword ? 'text' : 'password'"
    class="q-mb-md"
  >
    <template v-slot:prepend>
      <q-icon name="vpn_key" color="red-7" />
    </template>
    <template v-slot:append>
      <q-icon name="visibility" class="cursor-pointer" @click="togglePassword"/>
    </template>
  </q-input>

  <!-- Tombol Login -->
  <q-btn
  type="submit"
  push
  color="red-7"
  text-color="white"
  label="LOGIN"
  class="full-width q-mt-sm"
  unelevated
  rounded
>
  <template v-slot:icon>
    <img src="img/bloodtrack.png" style="width:20px; height:20px; object-fit:contain;" alt="icon darah" />
  </template>
</q-btn>

</form>

            <br>
            <hr>
            <div class="transDarah">
              <span class="h_fotter_titleform">Copyright : Rumah Sakit Umum Daerah Kab. Konawe Utara</span>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>










<script>

// const ADD_URL = URL_APP + "api/v1/rincian_obyek/";

  import Joi from "joi";
  const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(13).required(),
    password: Joi.string().min(6).required(),
  });

  import { Notify  } from 'quasar'

  export default {
    name: "monev_login",
    data : function(){
      return {
          testtttttt : [],
          errorMessage: '',
          user : {
            username : "",
            password : ""
          },
          showPassword: false,

          url : {
            LOGIN_URL : this.$store.state.url.URL_APP + "auth/login",
          }
      }
    },
    watch: {
      user: {
          handler() {
              this.errorMessage = "";
          },
          deep: true
      }
    },
    methods: {
      togglePassword () {
    this.showPassword = !this.showPassword
  },
      // go_register : function(){
      //   alert(App.data().sesseee);
      //   this.displayed = 'block';
      // },
      btn_login : function(){

this.errorMessage = '';
if(this.validUser()){
  this.$store.commit("shoWLoading");
  // this.$q.notify("hi");

  // this.$store.commit("shoWNotify", 'Kiken', 'primary', 'timer');
  const body = {
    username : this.user.username,
    password : this.user.password
  }
  fetch(this.url.LOGIN_URL, {
    method : 'POST',
    headers : {
      'content-type' : 'application/json',
    },
    body : JSON.stringify(body),
  }).then((response) => {

    // console.log(response);

        if (response.ok) {
            return response.json();
            this.$store.commit("shoWLoading");
        }

        return response.json().then(error => {
            throw new Error(error.message);
            this.$store.commit("shoWLoading");
        });
    })
    .then((result) => {
      console.log("=============================");
      // console.log(result);
      // menyimpan token yang tergenerate dari server
      localStorage.token = result.token;
      localStorage.profile = JSON.stringify(result.profile);
      setTimeout(() => {
        this.$store.commit("hideLoading")
        this.$router.push('/');
        // location.reload();
      }, 1000);
    })
    .catch(error => {
      setTimeout(() => {
        this.$store.commit("hideLoading")
        this.errorMessage = error.message;
      }, 1000);
    });;
}



},
      validUser: function(){
        const result = Joi.validate(this.user, schema);
        if (result.error === null) {
          return true;
        }
        if (result.error.message.includes("username")) {
          this.errorMessage = "Username tidak valid";
        } else {
          this.errorMessage = "Username tidak valid2";
        }
        return false;
      },



      testGetData : function(){
        // axios.get('https://api.coindesk.com/v1/bpi/currentprice.json')
        // .then(response => {
        //   console.log(response);
        //   this.testtttttt = response
        // })
        // .catch(error => {
        //   alert(error)
        //   console.log(error);
        // });




         axios
      .get('https://api.coindesk.com/v1/bpi/currentprice.json')
      .then(response => (this.testtttttt = response))






      }

    },
    mounted : function(){

      this.testGetData()
      

    },
  };
</script>