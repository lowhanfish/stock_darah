<template>
    <header class="all-navbar" id="page">

        <!-- :: Top Navbar -->
        <div class="top-navbar">
            <div class="container">
                <div class="content-box d-flex align-items-center justify-content-between">
                    <ul class="website-info">
                        <li>
                            <i class="far fa-envelope" style="color: white;"></i>
                            <a href="mailto:support@MedDoctors.com">pindara@konaweutarakab</a>
                        </li>
                        <!-- <li>
                            <i class="fas fa-map-marker-alt" style="color: white;"></i>
                            14D street brooklyn, new york
                        </li> -->
                        <li>
                            <i class="far fa-clock" style="color: white;"></i>
                            Pelayanan Rawat Jalan Senin - Jumat : 8:30 - 14:00 WITA
                        </li>
                    </ul>
                    <ul class="website-icon-social">
                        <li><a href="https://www.facebook.com/bludrumahsakit.konut" target="_blank"><i class="fab fa-facebook-f"></i></a></li>
                        <li><a href="https://www.instagram.com/bludrs.konut" target="_blank"><i class="fab fa-instagram"></i></a></li>
                        <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                        <li><a href="#"><i class="fas fa-rss"></i></a></li>
                        <li><a href="#"><i class="fab fa-linkedin-in"></i></a></li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- :: Navbar -->
        <nav class="nav-bar">
            <div class="container">
                <div class="content-box d-flex align-items-center justify-content-between">
                    <div class="logo">
                        <a href="index.html" class="logo-nav">
                            <img class="img-fluid one" src="/assets/images/logo.png" alt="01 Logo"
                                style="height: 60px; width: 60px; margin-left: 120px;">
                        </a>
                        <a href="#open-nav-bar-menu" class="open-nav-bar">
                            <span></span>
                            <span></span>
                            <span></span>
                        </a>
                    </div>
                    <div class="nav-bar-links" id="open-nav-bar-menu">
                        <ul class="level-1">
                            <!-- <li class="item-level-1 has-menu">
                                    <a href="#" class="link-level-1 color-active">Home</a>
                                    <ul class="level-2">
                                        <li class="item-level-2">
                                            <a class="link-level-2" href="index.html">Home Main</a>
                                        </li>
                                        <li class="item-level-2">
                                            <a class="link-level-2" href="02_home.html">Home Modern</a>
                                        </li>
                                        <li class="item-level-2">
                                            <a class="link-level-2" href="03_home.html">Home Classic</a>
                                        </li>
                                    </ul>
                                </li> -->
                            <li class="item-level-1">
                                <a href="#" class="link-level-1 color-active">Home</a>
                            </li>
                           
                            <li class="item-level-1 has-menu">
                                <a href="#" class="link-level-1">Informasi</a>
                                <ul class="level-2">
                                    <li class="item-level-2">
                                        <router-link  class="link-level-2" to="/berita">Artikel/Edukasi</router-link>
                                    </li>
                                    <li class="item-level-2">
                                        <router-link  class="link-level-2" to="/berita">Jadwal Donor</router-link>
                                    </li>
                                   
                                </ul>
                            </li>

                            <li class="item-level-1">
                                <router-link  class="link-level-1" to="/stokdarah">Stok Darah</router-link>
                            </li>
                            <li class="item-level-1">
                                <router-link  class="link-level-1" to="/Pendonor">Pendonor Aktif</router-link>
                            </li>
                            <li class="item-level-1">
                                <router-link  class="link-level-1" to="/foto">Foto Kegiatan</router-link>
                            </li>
                           
                          
                            <li class="item-level-1">
                                <a href="01_contact.html" class="link-level-1">Contact</a>
                            </li>
                        </ul>
                    </div>
                    <ul class="nav-bar-tools">
                        <li class="btn">
                            <router-link to="/Login" class="btn-1">Masuk</router-link>
                        </li>
                        <li class="btn">
                            <a href="/register" class="btn-1">Registrasi</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

    </header>
</template>

<script>
import { onMounted } from 'vue'

export default {
    name: 'Header',
    setup() {
        onMounted(() => {
            // jika ada inisialisasi JS Navbar di main.js template, 
            // Anda bisa panggil fungsi init yang ada di /assets/js/main.js
            // e.g. if (window.initNavbar) window.initNavbar()
        })
    }
}
</script>

<style scoped>
/* styling khusus jika perlu */
</style>