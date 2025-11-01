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
                            <h4><a href="javascript:void(0);">{{ donor.nama_lengkap }}</a></h4>
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
            itemsPerPage: 12
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

/* Gaya untuk elemen select */
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
</style>