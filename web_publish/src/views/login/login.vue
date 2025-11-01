<template>
    <!-- :: Breadcrumb Header -->
    <section class="breadcrumb-header" style="background-image: url(assets/images/header/05_header.jpg)">
        <div class="overlay"></div>
        <div class="container">
            <div class="row">
                <div class="col-lg-6">
                    <div class="banner">
                        <h1>Login</h1>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><i class="fas fa-angle-right"></i></li>
                            <li>Login</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="faqs-page py-100-70">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-6">
                    <form class="quote-box form-contact" @submit.prevent="btn_login">
                        <div class="sec-title">
                            <h3>Login to your account!</h3>
                        </div>
                        <div class="row">
                            <!-- Error Message Display -->
                            <div v-if="errorMessage" class="col-sm-12">
                                <div class="alert alert-warning" role="alert">
                                    <strong>Warning!</strong> {{ errorMessage }}
                                </div>
                            </div>

                            <div class="col-sm-12">
                                <div class="quote-item position-relative">
                                    <span class="lable">Username*</span>
                                    <i class="fas fa-user"></i>
                                    <input 
                                        type="text" 
                                        v-model="user.username" 
                                        name="username" 
                                        placeholder="Username" 
                                        required 
                                        class="form-control"
                                    >
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="quote-item position-relative">
                                    <span class="lable">Password*</span>
                                    <i class="fas fa-lock"></i>
                                    <input 
                                        :type="showPassword ? 'text' : 'password'" 
                                        v-model="user.password" 
                                        name="password" 
                                        placeholder="Password" 
                                        required 
                                        class="form-control"
                                    >
                                    <!-- Toggle Password Icon -->
                                    <i 
                                        class="fas fa-eye position-absolute" 
                                        style="right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; z-index: 10;" 
                                        :class="{ 'fa-eye-slash': showPassword }" 
                                        @click="togglePassword"
                                    ></i>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="quote-item">
                                    <button class="btn-1" type="submit">Login</button>
                                    <span class="out-message m-2"></span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import Joi from "joi";

const schema = Joi.object().keys({
    username: Joi.string().regex(/^[a-zA-Z0-9_]*$/).min(3).max(13).required(),
    password: Joi.string().min(6).required(),
});

export default {
    name: "LoginPage",
    data() {
        return {
            errorMessage: '',
            user: {
                username: "",
                password: ""
            },
            showPassword: false,
            url: {
                LOGIN_URL: this.$store ? this.$store.state.url.URL_APP + "auth/login" : "/api/auth/login" // Sesuaikan jika tidak ada store
            }
        };
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
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        btn_login() {
            this.errorMessage = '';
            if (this.validUser ()) {
                // Tampilkan loading jika ada store (mirip admin)
                if (this.$store) {
                    this.$store.commit("shoWLoading");
                }

                const body = {
                    username: this.user.username,
                    password: this.user.password
                };

                fetch(this.url.LOGIN_URL, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(body),
                })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    return response.json().then(error => {
                        throw new Error(error.message || "Login gagal");
                    });
                })
                .then((result) => {
                    console.log("Login sukses:", result);
                    // Simpan token dan profile seperti di admin
                    localStorage.token = result.token;
                    localStorage.profile = JSON.stringify(result.profile);
                    
                    setTimeout(() => {
                        if (this.$store) {
                            this.$store.commit("hideLoading");
                        }
                        this.$router.push('/');
                        // Optional: location.reload(); jika perlu refresh
                    }, 1000);
                })
                .catch(error => {
                    console.error("Login error:", error);
                    setTimeout(() => {
                        if (this.$store) {
                            this.$store.commit("hideLoading");
                        }
                        this.errorMessage = error.message || "Terjadi kesalahan saat login";
                    }, 1000);
                });
            }
        },
        validUser () {
            const result = Joi.validate(this.user, schema);
            if (result.error === null) {
                return true;
            }
            // Sesuaikan pesan error seperti di admin
            if (result.error.message.includes("username")) {
                this.errorMessage = "Username tidak valid (min 3-13 karakter, huruf/angka/_ saja)";
            } else {
                this.errorMessage = "Password tidak valid (min 6 karakter)";
            }
            return false;
        }
    }
};
</script>

<style scoped>
/* Tambahan style untuk positioning ikon toggle password agar rapi */
.quote-item {
    position: relative;
}

.position-absolute {
    position: absolute !important;
}

.form-control {
    padding-right: 40px; /* Ruang untuk ikon toggle password */
}

/* Pastikan alert warning sesuai gaya Bootstrap */
.alert {
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
}

.alert-warning {
    color: #856404;
    background-color: #fff3cd;
    border-color: #ffeaa7;
}
</style>