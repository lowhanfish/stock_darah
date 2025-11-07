<template>
    <div>
        <!-- :: Breadcrumb Header -->
        <section class="breadcrumb-header" style="background-image: url(assets/images/header/bgheader.png)">
            <div class="overlay"></div>
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="banner">
                            <h1>Daftar Pendonor Darah</h1>
                            <ul>
                                <li><a href="javascript:void(0);">Informasi lengkap pendonor aktif dan riwayat donasi
                                        darah</a></li>
                                <!-- <li><i class="fas fa-angle-right"></i></li>
                                <li>Careers</li> -->
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- :: Gallery -->
        <section class="gallery gallery-2 py-100-70">
            <div class="container">
                <div class="sec-title sec-title-2">
                    <div class="row">
                        <div class="col-lg-6">
                            <h2>Galeri Kegiatan & Aksi Sosial</h2>
                            <h3>Potret Pengabdian Kami untuk Kesehatan dan Kemanusiaan</h3>
                        </div>
                        <div class="col-lg-6">
                            <p class="sec-explain">Setiap foto di galeri ini menyimpan cerita tentang dedikasi,
                                kepedulian, dan kerja sama kami dalam memberikan pelayanan terbaik bagi masyarakat.
                                Mulai dari kegiatan donor darah, bakti sosial, hingga kampanye kesehatan — semua menjadi
                                bukti komitmen kami dalam menebarkan manfaat dan menyelamatkan sesama..</p>
                            <!-- <a class="btn-1 sec-btn" href="02_gallery.html">View All Gallery</a> -->
                        </div>
                    </div>
                </div>
                <div class="gallery-carousel owl-carousel owl-theme">
                    <div class="gallery-carousel-item">
                        <div class="gallery-item">
                            <span></span>
                            <div class="img-box">
                                <!-- <img class="img-fluid gallery-item-img" src="assets/images/gallery/01_gallery.jpg" alt="01 Gallery"> -->
                            </div>
                            <div class="hover-box">
                                <div class="text-box">
                                    <div class="tags"><a href="01_single-gallery.html">surgery</a></div>
                                    <h4><a href="01_single-gallery.html">Complete surgery</a></h4>
                                </div>
                                <ul class="gallery-icon">
                                    <li><a href="01_single-gallery.html"><i class="fas fa-link"></i></a></li>
                                    <!-- <li><a class="popup" href="assets/images/gallery/01_gallery.jpg"><i class="far fa-eye"></i></a></li> -->
                                </ul>
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
export default {
    data() {
        const store = useStore();
        return {

        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData: function () {
            fetch(this.$store.state.URL.FOTO + "getview", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    page: this.currentPage,
                    golongan_darah: this.selectedGolongan || null
                })
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.donors = res_data.data;
                        this.totalPages = res_data.pagination.totalPages;
                        this.totalItems = res_data.pagination.totalItems;
                        this.itemsPerPage = res_data.pagination.itemsPerPage;
                    }
                })
                .catch(err => {
                    console.error("❌ Error fetchData:", err);
                });
        },

        closeModal() {
            this.showModal = false;
            this.selectedDonor = null;
            this.riwayat = [];
        },
        formatDate(date) {
            if (!date) return '-';
            const d = new Date(date);
            return d.toLocaleDateString('id-ID'); // Format Indonesia: DD/MM/YYYY
        },

        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
                this.fetchData();
            }
        }
    }
};



</script>



<style scoped>
.quote-item {
    position: relative;
}

.quote-item span.lable {
    font-size: 13px;
    font-weight: 600;
    display: inline-block;
    text-transform: capitalize;
    position: relative;
    margin-bottom: 5px;
}

.quote-item select {
    border: 2px solid #F9F9F9;
    padding: 12px;
    width: 100%;
    color: #1A3D7D;
    font-size: 13px;
    margin-bottom: 30px;
    border-radius: 6px;
    background-color: #F9F9F9;
}

.quote-item select:focus {
    border-color: #13ADE5;
    outline: none;
}

/* Styling untuk modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #ddd;
    background-color: #fc7979;
    color: white;
    border-radius: 8px 8px 0 0;
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: white !important;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: white;
}

.modal-body {
    padding: 15px;
}

.riwayat-item {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #f9f9f9;
}

.riwayat-item h5 {
    margin: 0 0 5px 0;
    color: #13ADE5;
}

.loading-spinner {
    text-align: center;
    padding: 20px;
    color: #1A3D7D;
}

.no-data {
    text-align: center;
    padding: 20px;
    color: #666;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>