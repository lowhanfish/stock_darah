<template>
    <!-- :: Header -->
    <section class="header">
        <div ref="heroCarousel" class="header-carousel owl-carousel owl-theme">
            <div class="sec-hero display-table" style="background-image: url(/assets/images/header/01_header.jpg)">
                <div class="table-cell">
                    <div class="overlay"></div>
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="banner">
                                    <h1 class="handline">We Take Care Your Healthy Life</h1>
                                    <p class="about-website">
                                        MedDoctors Are A Medical And Health Department Provider Institutions.
                                        Suitable For Healthcare, Medical, Doctor, Dental, Dentist, Pharmacy,
                                        Health And Any Related Medical Care Field.
                                    </p>
                                    <a class="btn-1 move-section" href="#start">Let's Start</a>
                                    <a class="btn-1 btn-2 ml-30" href="01_department.html">Our Department</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="sec-hero display-table" style="background-image: url(/assets/images/header/02_header.jpg)">
                <div class="table-cell">
                    <div class="overlay"></div>
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="banner">
                                    <h1 class="handline">Best Doctor &amp; Medical Care</h1>
                                    <p class="about-website">
                                        MedDoctors Are A Medical And Health Department Provider Institutions.
                                        Suitable For Healthcare, Medical, Doctor, Dental, Dentist, Pharmacy,
                                        Health And Any Related Medical Care Field.
                                    </p>
                                    <a class="btn-1 btn-2" href="01_doctors-timetable.html">Find A Doctor</a>
                                    <a class="btn-1 btn-3 ml-30" href="01_about-us.html">Discover More</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="sec-hero display-table" style="background-image: url(/assets/images/header/03_header.jpg)">
                <div class="table-cell">
                    <div class="overlay"></div>
                    <div class="container">
                        <div class="row">
                            <div class="col-lg-6">
                                <div class="banner">
                                    <h1 class="handline">Care Whenever You Need It</h1>
                                    <p class="about-website">
                                        MedDoctors Are A Medical And Health Department Provider Institutions.
                                        Suitable For Healthcare, Medical, Doctor, Dental, Dentist, Pharmacy,
                                        Health And Any Related Medical Care Field.
                                    </p>
                                    <a class="btn-1 btn-2" href="01_about-us.html">More About Us</a>
                                    <span class="header-video ml-30">
                                        <a href="https://youtu.be/TKnufs85hXk" class="pulse" data-lity="">
                                            <i class="fas fa-play"></i>
                                        </a>
                                        <span class="video-name">Watch Our <br>Video!</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- :: Features -->
    <section class="features" style="background-color: #F8F8F8;">
        <div class="container">
            <div class="row all-features-item">

                <div class="col-lg-4">
                    <div class="features-item one card-style">
                        <div class="card-content">
                            <div class="card-left">
                                <h4 class="card-title">Pendonor Aktif</h4>
                                <div class="card-number">{{ jumlahPendonor }}</div>
                                <div class="card-sub">Pendonor Terdaftar</div>
                            </div>

                            <div class="card-illustration">
                                <img class="features-icon" src="/assets/images/donor1.png" alt="Donor" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="features-item two card-style">
                        <div class="card-content">
                            <div class="card-left">
                                <h4 class="card-title">Total Stock Darah</h4>
                                <div class="card-number">24/7</div>
                                <div class="card-sub">Kantong Tersedia</div>
                            </div>

                            <div class="card-illustration">
                                <img class="features-icon" src="/assets/images/darah.png" alt="Appointment" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-4">
                    <div class="features-item three card-style">
                        <div class="card-content">
                            <div class="card-left">
                                <h4 class="card-title">Permintaan Darah</h4>
                                <div class="card-number">150+</div>
                                <div class="card-sub">Kantong Darah</div>
                            </div>

                            <div class="card-illustration">
                                <img class="features-icon" src="/assets/images/Permintaan.png" alt="Doctor" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <!-- :: Stok darah -->
    <section class="doctors py-100-70">
        <img src="/assets/images/virus.png" alt="dekor virus" class="decor decor-right" />
        <img src="/assets/images/cells.png" alt="dekor sel darah" class="decor decor-left" />


        <div class="container">
            <div class="sec-title">
                <div class="row">
                    <div class="col-lg-5">
                        <h2>STOK DARAH</h2>
                        <h3>Ketersediaan Darah &amp; yang Aman dan Terjamin</h3>

                    </div>
                    <div class="col-lg-5">
                        <p class="sec-explain">Pantau status ketersediaan darah di wilayah Anda secara real-time. Kami
                            menyediakan
                            data terkini mengenai semua golongan darah untuk layanan medis darurat.</p>

                        <a class="btn-1 sec-btn" href="01_doctors.html">Cek Ketersediaan Golongan Darah</a>
                    </div>
                </div>
            </div>
            <div class="provide-content">
                <div class="row">
                    <div class="row">
                        <div class="col-md-6 col-lg-3" v-for="(b, idx) in bloods" :key="idx">
                            <div class="blood-card">
                                <div class="blood-card-header">
                                    <div class="blood-type">
                                        <img :src="b.image" :alt="'Golongan ' + b.type" class="blood-icon" />
                                        <div class="blood-stats">
                                            <div class="count">{{ b.count }}</div>
                                            <div class="unit">Kantong</div>
                                        </div>

                                        <div class="blood-label">
                                            <div class="type-text">{{ b.type }}</div>
                                            <div :class="['badge',
                            b.status === 'Tersedia' ? 'badge-available' :
                                b.status === 'Rendah' ? 'badge-low' :
                                    b.status === 'Kritis' ? 'badge-critical' : 'badge-default']">
                                                {{ b.status }}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="blood-card-footer">
                                    <div class="divider"></div>
                                    <div class="meta">Terakhir diperbarui: <span class="time">{{ b.updated }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <!-- :: Blog (3 berita terakhir dari this.list_berita) -->
    <section class="blog py-100-70">
        <div class="container">
            <div class="sec-title">
                <div class="row">
                    <div class="col-lg-4">
                        <h2>Artikel Terbaru</h2>
                        <h3>Kegiatan dan Edukasi Kesehatan Terkini</h3>
                    </div>
                    <div class="col-lg-4">
                        <p class="sec-explain">
                            Ikuti berita tentang kegiatan, kampanye kesehatan, dan tips dari tim kami. Selalu update
                            demi hidup sehat Anda.
                        </p>
                        <a class="btn-1 sec-btn" href="/berita">Jelajahi Artikel Kami</a>
                    </div>


                    <div class="col-lg-4">

                        <div class="features-opening-hours" style="position: relative;">
                            <div :class="['status-badge', jadwalStatusClass]">{{ jadwalStatusText }}</div>
                            <div class="header-icon-title">
                                <img src="/assets/images/donasi.png" alt="Donor Icon" style="height: 100px;"
                                    class="flaticon-globe" />
                                <h4>Jadwal Donor Darah</h4>
                            </div>


                            <div class="content-row" v-if="loading">Memuat jadwal...</div>
                            <div class="content-row" v-else>

                                <div class="schedule">
                                    <p><strong>Nama Kegiatan:</strong><br> {{ jadwal.nama_kegiatan || '—' }}</p>
                                    <p><strong>Tanggal:</strong><br>
                                        <span
                                            v-if="jadwal.tanggal_mulai && jadwal. tanggal_selesai && jadwal.tanggal_mulai !== jadwal.tanggal_selesai">
                                            {{ (UMUM.tglConvert(jadwal.tanggal_mulai)?.tgl) ||
                            UMUM.tglConvert(jadwal.tanggal_mulai) || '' }}
                                            –
                                            {{ (UMUM.tglConvert(jadwal.tanggal_selesai)?.tgl) ||
                            UMUM.tglConvert(jadwal.tanggal_selesai) || '' }}
                                        </span>
                                        <span v-else-if="jadwal.tanggal_mulai">
                                            {{ (UMUM.tglConvert(jadwal.tanggal_mulai)?.tgl) ||
                            UMUM.tglConvert(jadwal.tanggal_mulai) || '' }}
                                        </span>
                                        <span v-else>—</span>
                                    </p>

                                    <p><strong>Waktu:</strong><br> {{ jadwal.jam || '—' }} WITA</p>
                                    <p><strong>Lokasi:</strong><br> {{ jadwal.lokasi || '—' }}</p>
                                    <a v-if="jadwal.map_link" :href="jadwal.map_link" target="_blank" rel="noopener"
                                        class="btn-map">📍 Google Maps</a>
                                </div>
                                <div class="poster">
                                    <img v-if="poster" :src="poster" class="poster-img" @click="openModal(poster)"
                                        :alt="'Poster ' + (jadwal?.nama_kegiatan || 'Donor Darah')" />
                                    <div v-else class="no-poster">Tidak ada poster</div>
                                </div>



                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 col-lg-4" v-for="data in list_berita" :key="data.id">
                    <div class="blog-item">
                        <div class="img-box">
                            <a @click.prevent="pushKe(data.id)" href="javascript:void(0)" class="open-post"
                                :title="data.judul">
                                <img v-if="data.file_name" class="img-fluid" :src="file_path + data.file_name"
                                    :alt="data.judul" style="
                                        width: 100%;
                                        height: 300px;
                                        object-fit: cover;
                                        object-position: center;
                                        border-radius: 6px;
                                        display: block;
                                        margin: 0 auto;
                                    ">

                            </a>


                        </div>

                        <div class="text-box">
                            <span class="blog-date">
                                {{ (UMUM.tglConvert(data.createAt)?.tgl) || UMUM.tglConvert(data.createAt) || '' }}
                            </span>
                            <a @click.prevent="pushKe(data.id)" href="javascript:void(0)" class="title-blog"
                                :title="data.judul">
                                <h5>{{ truncateText(data.judul, 80) }}</h5>
                            </a>
                            <p v-html="truncateText(data.isi || '', 120)"></p>
                            <a @click.prevent="pushKe(data.id)" href="javascript:void(0)" class="link">Baca
                                selengkapnya</a>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>


    <!-- :: Gallery -->
    <div class="gallery py-100-70" style="background-color: #F8F8F8;">
        <div class="container">
            <div class="sec-title">
                <div class="row">
                    <div class="col-lg-5">
                        <h2>Feature's Gallery</h2>
                        <h3>Momen Pelayanan dan Aksi Sosial Terbaik Kami</h3>
                    </div>
                    <div class="col-lg-5">
                        <p class="sec-explain">Kami mengabadikan setiap momen komitmen kami, mulai dari bakti sosial,
                            kampanye kesehatan masyarakat, hingga event edukasi medis yang kami selenggarakan.</p>
                        <a class="btn-1 sec-btn" href="01_gallery.html">View All Gallery</a>
                    </div>
                </div>
            </div>
            <div class="row">
                <!-- gallery items tetap seperti semula (tidak diubah) -->
                <div class="col-md-6 col-lg-4">
                    <div class="gallery-item">
                        <span></span>
                        <div class="img-box">
                            <img class="img-fluid gallery-item-img" src="/assets/images/gallery/01_gallery.jpg"
                                alt="01 Gallery">
                        </div>
                        <div class="hover-box">
                            <div class="text-box">
                                <div class="tags"><a href="01_single-gallery.html">surgery</a></div>
                                <h4><a href="01_single-gallery.html">Complete surgery</a></h4>
                            </div>
                            <ul class="gallery-icon">
                                <li><a href="01_single-gallery.html"><i class="fas fa-link"></i></a></li>
                                <li><a class="popup" href="/assets/images/gallery/01_gallery.jpg"><i
                                            class="far fa-eye"></i></a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- ... sisa gallery tetap sama ... -->
            </div>
        </div>
    </div>

    <!-- Modal Gambar -->
    <div id="imageModal" ref="imageModal" :class="['modal', { show: isModalOpen }]" @click.self="closeModal"
        aria-hidden="true">
        <span class="close" id="modalClose" aria-label="Tutup" @click="closeModal">&times;</span>
        <img class="modal-content" ref="modalImage" :src="modalSrc" alt="Poster besar" />
    </div>

</template>

<script>
import UMUM from '../library/umum.js';
import { useStore } from "vuex";
import { nextTick } from 'vue'

export default {
    data() {
        const store = useStore();
        return {
            bloods: [
                { type: 'A', count: 45, status: 'Tersedia', image: '/assets/images/aa.png', updated: '21/9/2025, 01.45.34' },
                { type: 'AB', count: 2, status: 'Kritis', image: '/assets/images/abab.png', updated: '21/9/2025, 01.45.34' },
                { type: 'B', count: 10, status: 'Rendah', image: '/assets/images/bb.png', updated: '21/9/2025, 01.45.34' },
                { type: 'O', count: 10, status: 'Rendah', image: '/assets/images/oo.png', updated: '21/9/2025, 01.45.34' },
                // ... dst
            ],
            isModalOpen: false,
            modalSrc: '',
            list_berita: [],
            file_path: '',
            UMUM: UMUM,
            jadwal: null,     // hanya 1 jadwal terbaru
            poster: null,     // url poster (jika ada)
            loading: true,
            jumlahPendonor: 0,

        }
    },
    name: 'Home',
    methods: {
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


                    this.list_berita = res_data;


                    this.cek_load_data_list = false;
                })
                .catch(err => {
                    console.error("❌ Error getListBerita:", err);
                    this.cek_load_data_list = false;
                });
        },

        async loadJadwal() {
            this.loading = true;
            try {
                const res = await fetch(this.$store.state.URL.JADWAL + "viewData", {
                    method: "GET",
                    headers: { "Accept": "application/json" }
                });
                if (!res.ok) throw new Error("Gagal mengambil data jadwal");

                const json = await res.json();
                const list = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
                this.jadwal = list.length ? list[0] : null;

                // ambil poster (kalau ada)
                this.poster = this.jadwal?.file_name
                    ? this.file_path + this.jadwal.file_name
                    : null;
            } catch (err) {
                console.error("loadJadwal error:", err);
                this.jadwal = null;
                this.poster = null;
            } finally {
                this.loading = false;
            }
        },

        getJumlahPendonor: function () {
        fetch(this.$store.state.URL.HOME + "jumlahPendonor", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            }
        })
            .then(res => res.json())
            .then(res_data => {
                this.jumlahPendonor = res_data.jumlah || 0;
                console.log(res_data);
            })
            .catch(err => {
                console.error("❌ Error getJumlahPendonor:", err);
                this.jumlahPendonor = 0;
            });
    },



        openModal(src) {
            this.modalSrc = src
            this.isModalOpen = true
            document.body.style.overflow = 'hidden'
        },
        closeModal() {
            this.isModalOpen = false
            this.modalSrc = ''
            document.body.style.overflow = '' // reset
        },

        routerKe(id) {
            this.$router.push(`/Kegiatancsrisi/${id}`);
        },
        pushKe(id) {
            this.$router.push(`/Beritaisi/${id}`);
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
        }


    },


    async mounted() {

        this.getJumlahPendonor();
        const uploads = this.$store?.state?.UPLOADS || '/uploads/';
        this.file_path = uploads.endsWith('/') ? uploads : uploads + '/';
        this.getListBerita();
        this.loadJadwal();
        await nextTick()
        const el = this.$refs.heroCarousel
        if (!el) {
            console.warn('heroCarousel ref tidak ditemukan')
            return
        }
        if (window.$ && typeof window.$.fn.owlCarousel === 'function') {
            const $el = window.$(el)
            // hindari double init
            if (!$el.hasClass('owl-loaded')) {
                $el.owlCarousel({
                    items: 1,
                    loop: true,
                    nav: true,
                    dots: true,
                    autoplay: true,
                    autoplayTimeout: 5000,
                    navText: [
                        '<i class="flaticon-back"></i>',
                        '<i class="flaticon-next"></i>'
                    ]
                })
                // paksa refresh ukuran
                setTimeout(() => $el.trigger('refresh.owl.carousel'), 200)
            }
        } else {
            console.error('jQuery / owlCarousel tidak tersedia')
        }

    },
    computed: {
        jadwalStatusText() {
            if (!this.jadwal) return '—';

            switch (this.jadwal.status) {
                case 1:
                case '1': // Sertakan string '1' jika data dari API berupa string
                    return 'Aktif';
                case 2:
                case '2': // Sertakan string '2' jika data dari API berupa string
                    return 'Selesai';
                case 3:
                case '3': // Sertakan string '3' jika data dari API berupa string
                    return 'Dibatalkan';
                default:
                    return 'Tidak Diketahui';
            }
        },
        jadwalStatusClass() {
            if (!this.jadwal) return 'status-default';

            switch (this.jadwal.status) {
                case 1:
                case '1':
                    return 'status-aktif';
                case 2:
                case '2':
                    return 'status-selesai';
                case 3:
                case '3':
                    return 'status-batal';
                default:
                    return 'status-default';
            }
        }
    },
}
</script>

<style scoped>
/* Modal backdrop */
.modal {
    display: none;
    position: fixed;
    z-index: 9999;
    /* tingkat tinggi supaya di atas elemen lain */
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    padding: 60px;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.85);
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
}

/* Toggle tampil */
.modal.show {
    display: flex;
}

/* Gambar modal */
.modal-content {
    display: block;
    width: auto;
    height: auto;
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
    z-index: 10000;
    pointer-events: auto;
}

/* Tombol close */
.close {
    position: absolute;
    top: 18px;
    right: 22px;
    color: #ff0000;
    font-size: 36px;
    font-weight: bold;
    cursor: pointer;
    z-index: 10001;
    /* harus lebih tinggi dari gambar */
    user-select: none;
    pointer-events: auto;
    /* pastikan menerima klik */
    background: transparent;
    padding: 6px 10px;
    border-radius: 6px;
}

/* Jika ada plugin yg mengatur pointer-events: none atau overlay di dalam modal,
   pastikan close tetap menerima klik (pointer-events:auto sudah di atas) */

/* Responsive */
@media (max-width: 480px) {
    .close {
        font-size: 30px;
        right: 14px;
        top: 12px;
    }
}

/* Tombol Maps */
.btn-map {
    display: inline-block;
    margin-top: 8px;
    padding: 8px 14px;
    background-color: #ffd4d4;
    color: #f70505;
    border-radius: 6px;
    text-decoration: none;
    font-size: 14px;
    transition: background-color 0.3s ease;
}

.btn-map:hover {
    background-color: #c62828;
    color: #ffffff;
}

/* Badge Status */
.status-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    border-radius: 12px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* Warna berdasarkan status */
.status-aktif {
    background-color: #28a745;
    /* Hijau */
}

.status-selesai {
    background-color: #007bff;
    /* Biru */
}

.status-batal {
    background-color: #dc3545;
    /* Merah */
}
</style>
