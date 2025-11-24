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
                        <th width="5%">Gol.Darah</th>
                        <th width="5%" class="text-center">Rhesus</th>
                        <th width="20%">Komponen</th>
                        <th width="5%" class="text-center">Jumlah Kantong</th>
                        <th width="10%" class="text-center">Tipe</th>
                        <th width="15%">Tanggal</th>
                        <th width="15%">Keterangan</th>
                        <th width="10%">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, index) in list_data" :key="data.id_transaksi + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>
                        <td class="text-center">{{ data.golongan_darah }}</td>
                        <td class="text-center">{{ data.rhesus }}</td>
                        <td>{{ data.nama_komponen }}</td>
                        <td class="text-center">{{ data.jumlah }}</td>
                        <td class="text-center">
                            <q-badge :color="data.tipe_transaksi === 'masuk' ? 'green' : 'red'">
                                {{ data.tipe_transaksi.toUpperCase() }}
                            </q-badge>
                        </td>
                        <td>{{ formatTanggal(data.tanggal) }}</td>
                        <td>{{ data.keterangan || '-' }}</td>
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
                            Belum ada data transaksi.
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
                        <span class="h_lable">Pilih Permintaan (Nama Pasien)</span>
                        <q-select v-model="form.permintaan_id" outlined square :dense="true" class="bg-white margin_btn"
                            :options="list_permintaan" option-value="id" option-label="nama_pasien" emit-value
                            map-options required />

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
export default {
    data() {
        return {
            form: {
                golongan_darah: '',
                rhesus: '',
                komponen_id: null,
                jumlah: 0,
                tipe_transaksi: '',
                keterangan: ''
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

        getView() {
            const query = new URLSearchParams({
                page: this.page_first,
                limit: this.page_limit,
                cari_value: this.cari_value || '',
                komponen_id: this.filter.komponen_id || '',
                golongan_darah: this.filter.golongan_darah || '',
                tipe_transaksi: this.filter.tipe_transaksi || ''
            }).toString()

            fetch(this.$store.state.url.TRANSAKSI + "view?" + query, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.list_data = res_data.data || []
                        this.total_data = res_data.total_data || 0
                        this.page_last = res_data.total_pages || 1
                        this.jml_data = this.list_data.length
                        // jaga-jaga kalau page_current > page_last setelah filter/cari
                        if (this.page_first > this.page_last) this.page_first = this.page_last || 1
                    } else {
                        this.$q.notify({ type: 'negative', message: res_data.message || 'Gagal memuat data transaksi darah' })

                    }
                })
                .catch(err => {
                    console.error('Error fetching transaksi:', err)
                    this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memuat data transaksi' })
                })
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



        addData() {
            this.btn_add = true

            fetch(this.$store.state.url.TRANSAKSI + "addData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(this.form)
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.$q.notify({ type: "positive", message: res_data.message || "Transaksi berhasil ditambahkan" })
                        this.mdl_add = false
                        this.resetForm()
                        this.getView()
                    } else {
                        this.$q.notify({ type: "negative", message: res_data.message || "Gagal menambah transaksi" })
                    }
                })
                .catch(err => {
                    console.error("Error addData:", err)
                    this.$q.notify({ type: "negative", message: "Gagal menambah transaksi darah" })
                })
                .finally(() => {
                    this.btn_add = false
                })
        },

        resetForm() {
            this.form = {
                golongan_darah: '',
                rhesus: '',
                komponen_id: null,
                jumlah: 0,
                tipe_transaksi: '',
                keterangan: ''
            }
        },

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
        this.getKomponen()
        this.getView()
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