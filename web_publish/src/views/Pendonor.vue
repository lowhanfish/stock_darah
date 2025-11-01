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

        <!-- :: Careers -->
        <div class="careers py-100-70">
            <div class="container">
                <!-- Filter Golongan Darah -->
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="quote-item">
                            <span class="lable">Cari Berdasrkan Golongan Darah*</span>
                            <select v-model="selectedGolongan" @change="fetchData">
                                <option value="">Semua Golongan</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="AB">AB</option>
                                <option value="O">O</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div v-for="donor in donors" :key="donor.nama_lengkap" class="col-md-6 col-lg-3">
                        <div class="item-careers">
                            <h4><a href="javascript:void(0);" @click="showRiwayatModal(donor)"
                                    style="cursor: pointer;">{{ donor.nama_lengkap }}</a></h4>
                            <ul>
                                <!-- <li>081234567890</li> -->
                                <li class="active">Golongan Darah: {{ donor.golongan_darah }}{{ donor.rhesus }}</li>
                            </ul>
                            <!-- <p>MedDoctors Are A Medical And Health Department Provider Institutions. Suitable For Healthcare, Medical, Doctor, Dental, Dentist, Pharmacy, Health And Any Related Medical Care Field.......</p> -->
                            <!-- <i class="fas fa-phone"></i> -->
                            <a :href="'https://wa.me/' + donor.no_hp" class="link fab fa-whatsapp"> Hubungi: {{
                                donor.no_hp }}</a>
                        </div>
                    </div>


                    <div class="row">
                        <div class="col">
                            <div class="pagination-area">
                                <ul class="pagination">
                                    <li :class="{ disabled: currentPage === 1 }" @click="changePage(currentPage - 1)">
                                        Prev</li>
                                    <li v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }"
                                        @click="changePage(page)">{{ page }}</li>
                                    <li :class="{ disabled: currentPage === totalPages }"
                                        @click="changePage(currentPage + 1)">Next</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div v-if="showModal" class="modal-overlay" @click="closeModal">
                        <div class="modal-content" @click.stop>
                            <div class="modal-header">
                                <h3>Riwayat Donasi: {{ selectedDonor ? selectedDonor.nama_lengkap : '' }}</h3>
                                <button @click="closeModal" class="close-btn">&times;</button>
                            </div>
                            <div class="modal-body">
                                <div v-if="loadingRiwayat" class="loading-spinner">Memuat riwayat...</div>
                                <div v-else-if="riwayat.length === 0" class="no-data">Belum ada riwayat donor.</div>
                                <div v-else>
                                    <div v-for="item in riwayat" :key="item.id" class="riwayat-item">
                                        <h5>{{ item.nama_kegiatan }}</h5>
                                        <p><strong>Tanggal:</strong> {{ formatDate(item.tanggal_mulai) }} - {{
                                formatDate(item.tanggal_selesai) }}</p>
                                        <p><strong>Lokasi:</strong> {{ item.lokasi }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    </div>
</template>


<script>
import { useStore } from "vuex";
export default {
    data() {
        const store = useStore();
        return {
            donors: [],
            selectedGolongan: '',
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 12,
            // Data untuk modal riwayat
            showModal: false,
            selectedDonor: null,
            riwayat: [],
            loadingRiwayat: false
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData: function () {
            fetch(this.$store.state.URL.DONOR_PUBLISH + "getview", {
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

        // Method untuk menampilkan modal riwayat
        showRiwayatModal(donor) {
            this.selectedDonor = donor;
            this.showModal = true;
            this.riwayat = [];
            this.loadingRiwayat = true;
            this.fetchRiwayat(donor.nama_lengkap); // Asumsi pakai nama_lengkap sebagai identifier
        },
        // Method untuk fetch riwayat
        fetchRiwayat(namaLengkap) {
            fetch(this.$store.state.URL.DONOR_PUBLISH + "getriwayat", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    nama_lengkap: namaLengkap
                })
            })
                .then(res => res.json())
                .then(res_data => {
                    this.loadingRiwayat = false;
                    if (res_data.success) {
                        this.riwayat = res_data.data;
                    } else {
                        console.error("Error fetching riwayat:", res_data.message);
                        // Bisa tambahkan toast notification di sini
                    }
                })
                .catch(err => {
                    this.loadingRiwayat = false;
                    console.error("❌ Error fetchRiwayat:", err);
                });
        },
        // Method untuk menutup modal
        closeModal() {
            this.showModal = false;
            this.selectedDonor = null;
            this.riwayat = [];
        },
        // Helper untuk format tanggal
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
    color: white!important;
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