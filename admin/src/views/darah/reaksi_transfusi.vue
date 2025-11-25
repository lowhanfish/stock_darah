<template>
    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <!-- ================= HEADER ================= -->
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Reaksi Transfusi</div>
                    </div>
                    <div class="col-12 col-md-2"></div>
                    <div class="col-12 col-md-4">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true"
                                class="bg-white" style="width:90%" />
                            <q-btn glossy class="main1x" @click="mdl_add = true" dense flat icon="add"
                                style="width:10%">
                                <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                                    Tambah Reaksi
                                </q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>
            </q-card-section>

        </q-card>


        <hr class="hrpagin2">

        <!-- ================= FILTER ================= -->
        <div class="row q-col-gutter-md">

            <!-- Filter Komponen -->
            <div class="col-12 col-md-4">
                <span class="h_lable">Komponen</span>
                <q-select v-model="filter.komponen_id" :options="list_komponen" option-label="nama_komponen"
                    option-value="id" emit-value map-options outlined dense class="bg-white" @input="applyFilter" />
            </div>

            <!-- Filter Golongan Darah -->
            <div class="col-12 col-md-4">
                <span class="h_lable">Golongan Darah</span>
                <q-select v-model="filter.golongan_darah" :options="['A', 'B', 'O', 'AB']" outlined dense
                    class="bg-white" @input="applyFilter" />
            </div>

            <!-- Filter Tipe Transaksi -->
            <div class="col-12 col-md-4">
                <span class="h_lable">Tipe Transaksi</span>
                <q-select v-model="filter.tipe_transaksi" :options="['masuk', 'keluar']" outlined dense class="bg-white"
                    @input="applyFilter" />
            </div>

        </div>

        <hr class="hrpagin2" />

        <!-- <q-separator dark inset /> -->

        <!-- ================= TABLE ================= -->

        <div class="tbl_responsive">
            <table width="100%">
                <thead class="h_table_head main2x text-white">
                    <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="5%" class="text-center">Pemeriksaan Pretransfusi </th>
                        <th width="15%" class="text-center">Nama Pasien </th>
                        <th width="10%" class="text-center">Waktu Transfusi</th>
                        <th width="10%">Jenis Reaksi</th>
                        <th width="10%" class="text-center">Waktu Terjadi Reaksi</th>
                        <th width="10%" class="text-center">Waktu dilaporkan</th>
                        <th width="10%">Petugas Pelapor</th>
                        <th width="15%" class="text-center">Tindakan</th>
                        <th width="10%" class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>
                        <td class="text-center">
                            <q-btn color="light-green-6" icon="medical_services" @click="openPemeriksaan(data)">
                                <!-- Pemeriksaan Pretransfusi -->
                                <q-tooltip content-class="bg-green-7">Lanjut Pemeriksaan Pretransfusi</q-tooltip>
                            </q-btn>
                        </td>
                        <td class="text-center">{{ data.nama_pasien }}</td>
                        <td class="text-center">{{ UMUM.tglConvertx(data.jam_transfusi, true) }}</td>
                        <td>{{ data.jenis_reaksi }}</td>
                        <td class="text-center">{{ UMUM.tglConvertx(data.jam_terjadi, true) }}</td>
                        <td class="text-center">{{ UMUM.tglConvertx(data.jam_dilaporkan, true) }}</td>
                        <td class="text-center">{{ data.petugas_pelapor }}</td>
                        <td class="text-center">{{ data.tindakan }}</td>
                        <td class="text-center q-gutter-sm">
                            <q-btn dense round color="warning" icon="edit" @click="openEdit(data)">
                                <q-tooltip content-class="bg-amber-7">Edit Data</q-tooltip>
                            </q-btn>
                            <q-btn dense round color="negative" icon="delete" @click="openDelete(data)">
                                <q-tooltip content-class="bg-red-7">Hapus Data</q-tooltip>
                            </q-btn>
                            <!-- <q-btn dense round color="primary" icon="visibility" @click="openLihat(data)">
                                        <q-tooltip content-class="bg-blue-7">Lihat Data</q-tooltip>
                                    </q-btn> -->
                        </td>
                    </tr>

                    <tr v-if="list_data.length === 0">
                        <td colspan="8" class="text-center text-grey">
                            Belum ada data.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-center q-mt-md">
            <q-pagination v-model="page_first" :max="page_last" @input="getView" color="grey-6" :max-pages="4"
                :direction-links="true" :boundary-links="true" />
        </div>


        <!-- ===================== MODAL ADD REAKSI TRANSFUSI ===================== -->
        <q-dialog v-model="mdl_add" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Laporan Reaksi Transfusi</div>
                </q-card-section>

                <form @submit.prevent="addData">
                    <q-card-section class="q-pt-none">

                        <!-- Pilih Permintaan (Nama Pasien) -->
                        <!-- <span class="h_lable">Pilih Permintaan (Nama Pasien)</span>
                        <q-select v-model="form.permintaan_id" outlined square :dense="true" class="bg-white margin_btn"
                            :options="list_permintaan" option-value="id" option-label="nama_pasien" emit-value
                            map-options required /> -->

                        <span class="h_lable">Pilih Permintaan (Nama Pasien)</span>
                        <q-select ref="select" v-model="form.permintaan_id" outlined square :dense="true"
                            class="bg-white margin_btn" :options="list_permintaan" option-value="id"
                            option-label="nama_pasien" emit-value map-options required>
                            <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps" clickable @click="handleOptionClick(scope)">
                                    <q-item-section>
                                        <q-item-label class="text-dark text-bold">
                                            {{ scope.opt.nama_pasien }}
                                        </q-item-label>
                                        <q-item-label class="text-blue text-bold" style="font-size: 12px;">
                                            {{ UMUM.tglConvert(scope.opt.tanggal_lahir) }}
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>

                        <!-- Jam Transfusi -->
                        <span class="h_lable">Jam Transfusi</span>
                        <q-input v-model="form.jam_transfusi" type="datetime-local" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <!-- Jenis Reaksi -->
                        <span class="h_lable">Jenis Reaksi</span>
                        <q-input v-model="form.jenis_reaksi" outlined square :dense="true" class="bg-white margin_btn"
                            placeholder="Contoh: Urtikaria, Demam, Sesak, dll" required />

                        <!-- Jam Terjadinya Reaksi -->
                        <span class="h_lable">Jam Terjadinya Reaksi</span>
                        <q-input v-model="form.jam_terjadi" type="datetime-local" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <!-- Jam Dilaporkan -->
                        <span class="h_lable">Jam Dilaporkan</span>
                        <q-input v-model="form.jam_dilaporkan" type="datetime-local" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <!-- Petugas Yang Melaporkan -->
                        <span class="h_lable">Petugas Yang Melaporkan</span>
                        <q-input v-model="form.petugas_pelapor" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <!-- Tindakan -->
                        <span class="h_lable">Tindakan Yang Dilakukan</span>
                        <q-input v-model="form.tindakan" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                    </q-card-section>

                    <!-- Footer -->
                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_add" color="primary" type="submit" label="Simpan" />
                        <q-btn label="Batal" color="negative" v-close-popup />
                    </q-card-actions>
                </form>

            </q-card>
        </q-dialog>



        <!-- ===================== MODAL EDIT ===================== -->
        <q-dialog v-model="mdl_edit" persistent>
            <q-card class="mdl-md">
                <q-card-section class="bg-orange text-white">
                    <div class="text-h6 h_modalhead">Edit Transaksi Darah</div>
                </q-card-section>

                <form @submit.prevent="editData">
                    <q-card-section class="q-pt-none">
                        <span class="h_lable">Golongan Darah</span>
                        <q-select v-model="form_edit.golongan_darah" outlined square :dense="true"
                            class="bg-white margin_btn" :options="['A', 'B', 'O', 'AB']" required />

                        <span class="h_lable">Rhesus</span>
                        <q-select v-model="form_edit.rhesus" outlined square :dense="true" class="bg-white margin_btn"
                            :options="['+', '-']" required />

                        <span class="h_lable">Komponen Darah</span>
                        <q-select v-model="form_edit.komponen_id" outlined square :dense="true"
                            class="bg-white margin_btn" :options="list_komponen" option-value="id"
                            option-label="nama_komponen" emit-value map-options required />

                        <span class="h_lable">Jumlah (Kantong)</span>
                        <q-input v-model.number="form_edit.jumlah" type="number" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <span class="h_lable">Tipe Transaksi</span>
                        <q-select v-model="form_edit.tipe_transaksi" outlined square :dense="true"
                            class="bg-white margin_btn" :options="['masuk', 'keluar']" required />

                        <span class="h_lable">Keterangan</span>
                        <q-input v-model="form_edit.keterangan" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" />
                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_edit" color="primary" type="submit" label="Simpan Perubahan" />
                        <q-btn label="Batal" color="negative" v-close-popup />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>

        <!-- ===================== MODAL HAPUS ===================== -->
        <q-dialog v-model="mdl_hapus" persistent>
            <q-card class="mdl-sm">
                <q-card-section class="q-pt-none text-center orageGrad">
                    <form @submit.prevent="confirmDelete">
                        <br>
                        <img src="img/alert.png" alt="" width="75"> <br>
                        <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS TRANSAKSI INI??</span>
                        <div class="q-mt-md">
                            <div><strong>{{ hapus_target ? hapus_target.golongan_darah + hapus_target.rhesus + ' — ' +
                                (hapus_target.nama_komponen || '') : '' }}</strong></div>
                            <div>Jumlah: {{ hapus_target ? hapus_target.jumlah : '' }}</div>
                            <div class="q-mt-sm text-white">Tindakan ini akan mengubah stok darah sesuai transaksi yang
                                dihapus.</div>
                        </div>
                        <br>
                        <q-card-actions align="center">
                            <q-btn label="Batal" size="sm" color="negative" v-close-popup
                                @click="hapus_target = null" />
                            &nbsp;
                            <q-btn :loading="btn_hapus" type="submit" label="Hapus" size="sm" color="primary" />
                        </q-card-actions>
                    </form>
                </q-card-section>
            </q-card>
        </q-dialog>



    </div>
</template>

<script>
import UMUM from "../../library/umum.js";
export default {
    data() {
        return {
            UMUM: UMUM,
            list_permintaan: [],
            mdl_add: false,
            btn_add: false,
            form: {
                permintaan_id: null,
                jam_transfusi: null,
                jenis_reaksi: '',
                jam_terjadi: null,
                jam_dilaporkan: null,
                petugas_pelapor: '',
                tindakan: ''
            },
            form_edit: {
                id_transaksi: '',
                golongan_darah: '',
                rhesus: '',
                komponen_id: null,
                jumlah: 0,
                tipe_transaksi: '',
                keterangan: ''
            },
            list_data: [],
            list_komponen: [],

            page_first: 1,
            page_last: 0,
            page_limit: 10,
            jml_data: 0,
            total_data: 0,
            cari_value: '',

            mdl_add: false,
            btn_add: false,
            mdl_edit: false,
            btn_edit: false,

            mdl_hapus: false,      // modal konfirmasi hapus
            btn_hapus: false,      // loading untuk tombol hapus
            hapus_target: null,
            filter: {
                komponen_id: '',
                golongan_darah: '',
                tipe_transaksi: ''
            }

        }
    },
    methods: {

        handleOptionClick(scope) {
            this.form.permintaan_id = scope.opt.id;
            this.$refs.select.hidePopup();
        },

        async getData() {
            try {
                const baseURL = this.$store.state.url.REAKSI_TRANSFUSI
                    || (this.$store.state.url.BASE || '') + "api/v1/reaksi_transfusi/";

                // jika form.ruangan_id ada, tambahkan param
                const url = this.form.ruangan_id ? `${baseURL}?ruangan_id=${this.form.ruangan_id}` : baseURL;

                console.log("fetch url:", url);

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                        authorization: "kikensbatara " + localStorage.token
                    }
                });

                const json = await res.json();
                console.log("getData json:", json);

                if (json.status) {
                    this.list_permintaan = json.permintaan || [];
                    this.table_data = json.reaksi || [];
                    if (this.list_permintaan.length && !this.form.permintaan_id) {
                        this.form.permintaan_id = this.list_permintaan[0].id;
                    }
                } else {
                    this.list_permintaan = [];
                    this.table_data = [];
                }
            } catch (err) {
                console.error("getData error:", err);
                this.list_permintaan = [];
                this.table_data = [];
            }
        },

        addData() {
            console.log('DEBUG addData payload:', this.form);
            this.btn_add = true;

            fetch(this.$store.state.url.REAKSI_TRANSFUSI + "addData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(this.form)
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success || res_data.status) {
                        this.$q.notify({
                            type: "positive",
                            message: res_data.message || "Laporan Reaksi Transfusi berhasil ditambahkan"
                        });

                        this.mdl_add = false;
                        this.resetForm();
                        this.getData();  // refresh tabel
                    } else {
                        this.$q.notify({
                            type: "negative",
                            message: res_data.message || "Gagal menambah laporan reaksi transfusi"
                        });
                    }
                })
                .catch(err => {
                    console.error("Error addData:", err);
                    this.$q.notify({
                        type: "negative",
                        message: "Terjadi kesalahan saat menyimpan data"
                    });
                })
                .finally(() => {
                    this.btn_add = false;
                });
        },

        resetForm() {
            this.form = {
                permintaan_id: null,

                jam_transfusi: "",
                jenis_reaksi: "",
                jam_terjadi: "",
                jam_dilaporkan: "",
                petugas_pelapor: "",
                tindakan: "",

                // jika Anda menambahkan ruangan_id saat mounted
                ruangan_id: this.form?.ruangan_id || null,
                rumah_sakit_id: this.form?.rumah_sakit_id || null
            };
        },

        getView() {
            const query = new URLSearchParams({
                page: this.page_first,
                limit: this.page_limit,
                cari_value: this.cari_value || ''
            }).toString();

            fetch(this.$store.state.url.REAKSI_TRANSFUSI + "view?" + query, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    console.log('getView response:', res_data);

                    if (res_data.success) {
                        this.list_data = res_data.data || [];
                        this.total_data = res_data.total_data || 0;
                        this.page_last = res_data.total_pages || 1;
                        this.jml_data = this.list_data.length;

                        if (this.page_first > this.page_last) {
                            this.page_first = this.page_last || 1;
                        }
                    } else {
                        this.$q.notify({
                            type: 'negative',
                            message: res_data.message || 'Gagal memuat data reaksi transfusi'
                        });
                    }
                })
                .catch(err => {
                    console.error('Error fetching reaksi transfusi:', err);
                    this.$q.notify({
                        type: 'negative',
                        message: 'Terjadi kesalahan saat memuat data reaksi transfusi'
                    });
                });
        },

        getKomponen() {
            fetch(this.$store.state.url.KOMPONEN + "view", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({})
            })
                .then(res => res.json())
                .then(res_data => {
                    this.list_komponen = res_data.data || []
                })
                .catch(err => console.error("Error getKomponen:", err))
        },



        // addData() {
        //     this.btn_add = true

        //     fetch(this.$store.state.url.TRANSAKSI + "addData", {
        //         method: "POST",
        //         headers: {
        //             "content-type": "application/json",
        //             authorization: "kikensbatara " + localStorage.token
        //         },
        //         body: JSON.stringify(this.form)
        //     })
        //         .then(res => res.json())
        //         .then(res_data => {
        //             if (res_data.success) {
        //                 this.$q.notify({ type: "positive", message: res_data.message || "Transaksi berhasil ditambahkan" })
        //                 this.mdl_add = false
        //                 this.resetForm()
        //                 this.getView()
        //             } else {
        //                 this.$q.notify({ type: "negative", message: res_data.message || "Gagal menambah transaksi" })
        //             }
        //         })
        //         .catch(err => {
        //             console.error("Error addData:", err)
        //             this.$q.notify({ type: "negative", message: "Gagal menambah transaksi darah" })
        //         })
        //         .finally(() => {
        //             this.btn_add = false
        //         })
        // },

        // resetForm() {
        //     this.form = {
        //         golongan_darah: '',
        //         rhesus: '',
        //         komponen_id: null,
        //         jumlah: 0,
        //         tipe_transaksi: '',
        //         keterangan: ''
        //     }
        // },

        // 🔹 Buka modal edit dan isi data
        openEdit(data) {
            this.form_edit = {
                id_transaksi: data.id_transaksi,
                golongan_darah: data.golongan_darah,
                rhesus: data.rhesus,
                komponen_id: data.komponen_id,
                jumlah: data.jumlah,
                tipe_transaksi: data.tipe_transaksi,
                keterangan: data.keterangan
            };
            this.mdl_edit = true;
        },

        // 🔹 Kirim perubahan ke backend
        editData() {
            this.btn_edit = true;

            fetch(this.$store.state.url.TRANSAKSI + "editData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(this.form_edit)
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.$q.notify({
                            type: "positive",
                            message: res_data.message || "Transaksi darah berhasil diperbarui"
                        });
                        this.mdl_edit = false;
                        this.getView();
                    } else {
                        this.$q.notify({
                            type: "negative",
                            message: res_data.message || "Gagal memperbarui transaksi"
                        });
                    }
                })
                .catch(err => {
                    console.error("Error editData:", err);
                    this.$q.notify({
                        type: "negative",
                        message: "Terjadi kesalahan saat memperbarui data"
                    });
                })
                .finally(() => {
                    this.btn_edit = false;
                });
        },

        // buka modal hapus
        openDelete(data) {
            this.hapus_target = data;
            this.mdl_hapus = true;
        },

        // konfirmasi hapus (panggil backend)
        confirmDelete() {
            if (!this.hapus_target || !this.hapus_target.id_transaksi) {
                this.$q.notify({ type: 'negative', message: 'Tidak ada transaksi yang dipilih' });
                return;
            }

            this.btn_hapus = true;

            fetch(this.$store.state.url.TRANSAKSI + "delete/" + this.hapus_target.id_transaksi, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.$q.notify({ type: 'positive', message: res_data.message || 'Transaksi berhasil dihapus' });
                        this.mdl_hapus = false;
                        this.hapus_target = null;
                        // reload current page (tetap di halaman sama)
                        this.getView();
                    } else {
                        this.$q.notify({ type: 'negative', message: res_data.message || 'Gagal menghapus transaksi' });
                    }
                })
                .catch(err => {
                    console.error('Error delete transaksi:', err);
                    this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat menghapus transaksi' });
                })
                .finally(() => {
                    this.btn_hapus = false;
                });
        },



        indexing(idx) {
            return ((this.page_first - 1) * this.page_limit) + idx
        },

        formatTanggal(dt) {
            if (!dt) return '-'
            const d = new Date(dt)
            if (isNaN(d)) return dt
            return d.toLocaleString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },

        cari_data() {
            this.page_first = 1
            this.getView()
        },

        // 🔹 Terapkan filter
        applyFilter() {
            this.page_first = 1;
            this.getView();
        },
    },

    mounted() {
        try {
            const get_profile = JSON.parse(localStorage.profile || '{}')
            if (get_profile && get_profile.profile) {
                this.tipe = Number(get_profile.profile.stokdarah_konut)
                this.user = get_profile
                // jika admin ruangan otomatis isi rumah_sakit_id / ruangan_id jika tersedia di profile
                if (get_profile.profile.ruangan_id) {
                    this.form.ruangan_id = Number(get_profile.profile.ruangan_id)
                }
                if (get_profile.profile.rumah_sakit_id) {
                    this.form.rumah_sakit_id = Number(get_profile.profile.rumah_sakit_id)
                }
            }
        } catch (e) {
            console.warn('Gagal parse localStorage.profile', e)
        }
        this.getData();
        this.getKomponen();
        this.getView();
    }
}
</script>

<style scoped>
.tbl_responsive {
    overflow: auto;
}

.h_table_head {
    background: #333;
}

.h_table_body td {
    padding: 10px 8px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
}

.text-right {
    text-align: right;
}

.text-center {
    text-align: center;
}
</style>