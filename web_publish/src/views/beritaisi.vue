<template>
    <div>
        <section class="breadcrumb-header" style="background-image: url(assets/images/header/bgheader.png)">
            <div class="overlay"></div>
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="banner">
                            <h1>Detil Artikel / Edukasi</h1>
                            <ul>
                                <li><a href="javascript:void(0);">Berita tentang kegiatan, kampanye kesehatan, dan tips
                                        dari tim kami</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="single-bolg py-100-70">
            <div class="container">
                <div class="row">
                    <div class="col-lg-8">
                        <div class="blog-item">
                            <div class="img-box">
                                <img v-if="form.file_name" class="img-fluid" :src="file_path + form.file_name"
                                    :alt="form.judul">

                            </div>
                            <div class="text-box">
                                <span class="blog-date">{{ convert_tgl(form.createAt) }}</span>
                                <h5>{{ form.judul }}</h5>
                                <p v-html="form.isi"></p>
                                <div class="share-post">
                                    <span>Share Post :</span>
                                    <ul>
                                        <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>
                                        <li><a href="#"><i class="fab fa-twitter"></i></a></li>
                                        <li><a href="#"><i class="fab fa-instagram"></i></a></li>
                                        <li><a href="#"><i class="fab fa-dribbble"></i></a></li>
                                        <li><a href="#"><i class="fab fa-behance"></i></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>



                    <div class="col-lg-4">
                        <div class="sidebar-blog ml-20">
                            <div class="widget">
                                <div class="widget-title">
                                    <h3>Artikel, Tips &amp; Edukasi :</h3>
                                </div>
                                <div class="news-box" v-if="list_berita_side.length > 0">
                                    <div class="news-item" v-for="item in list_berita_side" :key="item.id">
                                        <img v-if="item.file_name" class="img-fluid" :src="file_path + item.file_name"
                                            :alt="item.judul" style="height: 60px; width: 60px;">
                                        <div class="item-content">
                                            <span><a>{{ UMUM.tglConvert(item.createAt).tgl }}</a></span>
                                            <a @click="pushKe(item.id)" class="title-blog">
                                                <h5>{{ truncateText(item.judul, 27) }}</h5>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div v-else>
                                    <p>Tidak ada berita terkini.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </div>
</template>

<script>

import { useStore } from "vuex";
import UMUM from '../library/umum';

export default {
    name: "web_pengumuman",
    //   title: "My page title",
    data: function () {
        const store = useStore();
        return {
            UMUM: UMUM,
            file_path: store.state.UPLOADS,
            id: "",
            form: {
                id: '',
                judul: '',
                sumber: '',
                isi: '',
                file_name: '',
                createdBy: '',
                createAt: '',
            },

            list_berita: [],
            list_berita_side: [],
        }
    },


    // =============================================================== METHODS =========================================================================
    methods: {

        getView() {
            fetch(this.$store.state.URL.BERITA + "detilBerita", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: this.id })
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.form = res_data.data;
                    } else {
                        console.error("❌ detilBerita gagal:", res_data.message);
                    }
                })
                .catch(err => console.error("❌ Error getView:", err))
        },

        truncateText(text, limit = 50) {
            if (!text) return '';
            return text.length > limit ? text.substring(0, limit) + '...' : text;
        },
        getListBerita: function () {
            this.cek_load_data_list = true;
            fetch(this.$store.state.URL.HOME + "beritaHome", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    this.list_berita_side = res_data;
                    this.cek_load_data_list = false;
                })
                .catch(err => {
                    console.error("❌ Error getListBerita:", err);
                    this.cek_load_data_list = false;
                });
        },

        // ================== PAGINASI ====================
        alertku: function (type, title) {
            this.$swal({
                type: type,
                title: title,
                showConfirmButton: false,
                timer: 800
            });
        },


        onFileSelected: function (event) {
            this.foto = event.target.files[0];
            console.log(this.foto);
        },
        convert_tgl: function (dateString) {
            var date = new Date(dateString);
            var getBulan = date.getMonth() + 1; var bulan = '';
            if (getBulan == '1') { bulan = 'Jan' }
            else if (getBulan == '2') { bulan = 'Feb' }
            else if (getBulan == '3') { bulan = 'Mar' }
            else if (getBulan == '4') { bulan = 'Apr' }
            else if (getBulan == '5') { bulan = 'Mei' }
            else if (getBulan == '6') { bulan = 'Jun' }
            else if (getBulan == '7') { bulan = 'Jul' }
            else if (getBulan == '8') { bulan = 'Agt' }
            else if (getBulan == '9') { bulan = 'Sep' }
            else if (getBulan == '10') { bulan = 'Okt' }
            else if (getBulan == '11') { bulan = 'Nov' }
            else if (getBulan == '12') { bulan = 'Des' }



            return date.getDate() + " " + bulan + " " + date.getFullYear();
        },

        pushKe(id) {
            this.$router.push({ name: 'beritaisi', params: { id } })
        },

        // ================== PAGINASI ====================
    },
    // =============================================================== METHODS =========================================================================


    mounted() {
        this.id = this.$route.params.id || this.$route.query.id;
        if (!this.id) {
            console.error("❌ ID berita kosong!");
            return;
        }



        this.getView();
        this.getListBerita();
        //   this.getlistPengumuman();
        // this.getAsyncData();
        // alert(this.$route)
        // console.log('id = '+this.$route.query.id)
        // console.log(this.HOST);
    },

    watch: {
        '$route.params.id': {
            immediate: true,
            handler(newId) {
                this.id = newId || this.$route.query.id
                this.getView()
                // optional: scroll ke atas
                // window.scrollTo(0, 0)
            }
        }
    },


    computed: {
        shareUrl() {
            return encodeURIComponent(window.location.href)
        },
        encodedJudul() {
            return encodeURIComponent(this.form.judul)
        },
        facebookLink() {
            return `https://www.facebook.com/sharer.php?u=${this.shareUrl}&quote=${this.encodedJudul}`;
        },
        // twitterLink() {
        //   return `https://twitter.com/intent/tweet?text=${this.encodedJudul}&url=${this.shareUrl}`;
        // },
        whatsappLink() {
            return `https://wa.me/?text=${this.encodedJudul}%20${this.shareUrl}`;
        }
    },







};



</script>


<style>
.img_berita img {
    width: 100% !important;
    height: auto !important;
}
</style>