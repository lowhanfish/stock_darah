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
                        <li><a href="https://www.facebook.com/bludrumahsakit.konut" target="_blank"><i
                                    class="fab fa-facebook-f"></i></a></li>
                        <li><a href="https://www.instagram.com/bludrs.konut" target="_blank"><i
                                    class="fab fa-instagram"></i></a></li>
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
                <div class="content-box d-flex align-items-center justify-content-start">
                    <div class="logo">
                        <a href="index.html" class="logo-nav">
                            <img class="img-fluid one" src="/assets/images/logo.png" alt="01 Logo"
                                style="height: 60px; width: 60px;">
                        </a>
                        <span class="open-nav-bar" @click="showMobileNav = !showMobileNav">
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>

                    </div>
                    <div class="nav-bar-links" :class="{ active: showMobileNav }">

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

                            <li class="item-level-1 has-menu" :class="{ open: openSubmenu === 'informasi' }">
                                <a href="javascript:void(0)" class="link-level-1" @click="toggleSubmenu('informasi')">
                                    Informasi
                                </a>

                                <ul class="level-2">
                                    <li class="item-level-2">
                                        <router-link class="link-level-2" to="/berita">
                                            Artikel / Edukasi
                                        </router-link>
                                    </li>
                                </ul>
                            </li>


                            <li class="item-level-1">
                                <router-link class="link-level-1" to="/stokdarah">Stok Darah</router-link>
                            </li>
                            <!-- <li class="item-level-1">
                                <router-link  class="link-level-1" to="/Pendonor">Pendonor Aktif</router-link>
                            </li> -->
                            <li class="item-level-1">
                                <router-link class="link-level-1" to="/foto">Foto Kegiatan</router-link>
                            </li>


                            <li class="item-level-1">
                                <router-link class="link-level-1" to="/kontak">Kontak</router-link>
                            </li>
                        </ul>
                    </div>
                    <!-- <ul class="nav-bar-tools" style=" margin-right: 250px">
                        <li class="item">
                            <span class="menu-icon" @click="showMenuBox = true">
                                <i class="fas fa-list"></i>
                            </span>
                        </li> -->
                        <!-- <li class="btn">
                            <router-link to="/Login" class="btn-1">Masuk</router-link>
                        </li>
                        <li class="btn">
                            <a href="/register" class="btn-1">Registrasi</a>
                        </li> -->
                    <!-- </ul> -->
                </div>
            </div>
        </nav>


    </header>
    <!-- :: MENU BOX (MOBILE) -->
    <div class="menu-box" :class="{ active: showMenuBox }">
        <div class="inner-menu">

            <div class="website-info">
                <a href="/" class="logo">
                    <img class="img-fluid" src="/assets/images/logo.png" alt="Logo">
                </a>
                <p>
                    PINDARA adalah sistem layanan informasi donor darah
                    BLUD RS Konawe Utara.
                </p>
            </div>

            <div class="contact-info">
                <h4>Kontak</h4>

                <div class="contact-box">
                    <i class="flaticon-call"></i>
                    <div class="box">
                        <a class="phone" href="tel:0401234567">0401 234 567</a>
                    </div>
                </div>

                <div class="contact-box">
                    <i class="flaticon-email"></i>
                    <div class="box">
                        <a class="mail" href="mailto:pindara@konaweutarakab">
                            pindara@konaweutarakab
                        </a>
                    </div>
                </div>
            </div>

            <!-- TOMBOL TUTUP -->
            <span class="menu-box-icon exit" @click="showMenuBox = false">
                <i class="fas fa-times"></i>
            </span>

        </div>
    </div>

</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Header',
  setup() {
    // === STATE ===
    const showMenuBox = ref(false)
    const showMobileNav = ref(false)
    const openSubmenu = ref(null)

    // === METHOD ===
    const toggleSubmenu = (name) => {
      openSubmenu.value = openSubmenu.value === name ? null : name
    }

    // === WAJIB RETURN SEMUA YANG DIPAKAI TEMPLATE ===
    return {
      showMenuBox,
      showMobileNav,
      openSubmenu,
      toggleSubmenu
    }
  }
}
</script>



<style scoped>
.menu-box {
    opacity: 0;
    visibility: hidden;
}

.menu-box.active {
    opacity: 1;
    visibility: visible;
}
/* SUBMENU MOBILE */
.nav-bar-links .level-2 {
  display: none;
}

.nav-bar-links .has-menu.open > .level-2 {
  display: block;
}

.nav-bar-links {
  margin-left: 1px;
}

</style>
