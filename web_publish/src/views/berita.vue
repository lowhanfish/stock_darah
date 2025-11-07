<template>
    <div>
        
        <section class="breadcrumb-header" style="background-image: url(assets/images/header/bgheader.png)">
            <div class="overlay"></div>
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="banner">
                            <h1>Artikel / Edukasi</h1>
                            <ul>
                                <li><a href="javascript:void(0);">Berita tentang kegiatan, kampanye kesehatan, dan tips dari tim kami</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- breadcrumb-area-end -->
        <section class="blog py-100-70">
            <div class="container">
                <div class="row">
                    <div class="col-lg-8">
                        <div class="row" v-if="list_berita.length > 0">
                            <div class="col-md-6" v-for="item in list_berita" :key="item.id">
                                <div class="blog-item">
                                    <div class="img-box">
                                        <a @click="pushKe(item.id)" class="open-post">
                                            <img class="img-fluid" style="
                                        width: 100%;
                                        height: 300px;
                                        object-fit: cover;
                                        object-position: center;
                                        border-radius: 6px;
                                        display: block;
                                        margin: 0 auto;
                                    " :src="file_path + item.gambar" :alt="item.judul">
                                            <!-- <img v-else class="img-fluid" src="assets/images/blog/default.jpg" alt="Default Blog"> -->
                                        </a>
                                        
                                    </div>
                                    <div class="text-box">
                                        <span class="blog-date">{{ UMUM.tglConvert(item.tanggal).tgl }}</span>
                                        <a @click="pushKe(item.id)" class="title-blog">
                                            <h5>{{ item.judul }}</h5>
                                        </a>
                                        <p v-html="truncateText(item.isi, 80)"></p>
                                        <!-- <a @click="pushKe(item.id)" class="link">Baca Selengkapnya</a> -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row" v-else>
                            <div class="col-12">
                                <p>Tidak ada berita ditemukan.</p>
                            </div>
                        </div>
                        <!-- Pagination -->
                        <div class="row" v-if="totalPages > 1">
                            <div class="col">
                                <div class="pagination-area">
                                    <ul class="pagination">
                                        <li @click="prevPage" :class="{ disabled: currentPage === 1 }">Prev</li>
                                        <li v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="{ active: page === currentPage }">
                                            {{ page }}
                                        </li>
                                        <li @click="nextPage" :class="{ disabled: currentPage === totalPages }">Next</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="sidebar-blog ml-20">
                            <div class="widget">
                                <div class="widget-title">
                                    <h3>Search</h3>
                                </div>
                                <div class="widget-body">
                                    <div class="search">
                                        <input v-model="cari_value" type="search" name="search" placeholder="Search Your Keywords..." @keyup.enter="cari_data">
                                        <button @click="cari_data" class="click">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="widget">
                                <div class="widget-title">
                                    <h3>Artikel, Tips &amp; Edukasi :</h3>
                                </div>
                                <div class="news-box" v-if="list_berita_side.length > 0">
                                    <div class="news-item" v-for="item in list_berita_side" :key="item.id">
                                        <img v-if="item.file_name" class="img-fluid" :src="file_path + item.file_name" :alt="item.judul" style="height: 60px; width: 60px;">
                                        <div class="item-content">
                                            <span><a>{{ UMUM.tglConvert(item.createAt).tgl }}</a></span>
                                            <a @click="pushKe(item.id)" class="title-blog">
                                                <h5>{{ truncateText (item.judul,27) }}</h5>
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
    data() {
        const store = useStore();
        return {
            file_path: store.state.UPLOADS,
            UMUM: UMUM,
            list_berita: [],
            list_berita_side: [],
            page_limit: 6,
            total: 0,
            cari_value: "",
            currentPage: 1,
            isLoading: false, // Tambahan untuk loading state
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.total / this.page_limit);
        },
    },
    methods: {
        async getListBerita() {
            this.isLoading = true;
            try {
                const response = await fetch(this.$store.state.URL.BERITA + "getview", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    },
                    body: JSON.stringify({
                        data_ke: this.currentPage,
                        page_limit: this.page_limit,
                        cari_value: this.cari_value
                    })
                });
                const res_data = await response.json();
                if (res_data.success) {
                    this.list_berita = res_data.data;
                    this.total = res_data.total;
                }
            } catch (err) {
                console.error("❌ Fetch error:", err);
            } finally {
                this.isLoading = false;
            }
        },

        async getListBeritaSide() {
            this.isLoading = true;
            try {
                const response = await fetch(this.$store.state.URL.HOME + "beritaHome", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json"
                    }
                });
                const res_data = await response.json();
                this.list_berita_side = res_data; // Asumsi langsung array
            } catch (err) {
                console.error("❌ Error getListBeritaSide:", err);
            } finally {
                this.isLoading = false;
            }
        },

        // Pindah halaman
        changePage(page) {
            this.currentPage = page;
            this.getListBerita();
        },

        cari_data() {
            this.currentPage = 1; // Reset ke halaman pertama
            this.getListBerita();
        },

        goToPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            this.getListBerita();
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.getListBerita();
            }
        },

        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.getListBerita();
            }
        },

        routerKe(data) {
            this.$router.push(data);
        },

        truncateText(html, maxLength) {
            // Buang tag HTML untuk menghitung panjang teks saja
            const div = document.createElement('div');
            div.innerHTML = html;
            const text = div.textContent || div.innerText || '';

            // Potong teks
            const truncated = text.length > maxLength
                ? text.substring(0, maxLength) + '...'
                : text;

            // Kembalikan lagi dalam format HTML aman (tanpa potong tag di tengah)
            return truncated;
        },

        pushKe(id) {
            // this.$router.push(`/beritaisi/${id}`);
            this.$router.push({ name: 'beritaisi', params: { id } })
        },
    },
    mounted() {
        
        this.getListBerita();
        this.getListBeritaSide();
    },
};
</script>

<style scoped>
.paginasia {
    font-size: 8pt !important;
    height: 35px !important;
    width: 35px !important;
}

.pagination li {
    cursor: pointer;
}

.pagination li.disabled {
    pointer-events: none;
    opacity: 0.5;
}

.blog-item img {
    width: 100%;
    height: auto;
}

.news-item img {
    width: 100%;
    height: auto;
    margin-bottom: 10px;
}
</style>