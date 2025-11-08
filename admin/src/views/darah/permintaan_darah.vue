<template>
    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <!-- ================= HEADER ================= -->
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Permintaan Darah</div>
                    </div>
                    <div class="col-12 col-md-2"></div>
                    <div class="col-12 col-md-4">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true"
                                class="bg-white" style="width:90%" />
                            <!-- Tombol tambah hanya untuk tipe = 3 (Admin Ruangan) -->
                            <q-btn v-if="tipe === 3" glossy class="main1x" @click="mdl_add = true" dense flat icon="add"
                                style="width:10%">
                                <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                                    Tambah Permintaan
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

            <div class="col-12 col-md-4">
                <span class="h_lable">Golongan Darah</span>
                <q-select v-model="filter.golongan_darah" :options="['A', 'B', 'O', 'AB']" outlined dense
                    class="bg-white" @input="applyFilter" />
            </div>

            <div class="col-12 col-md-4">
                <span class="h_lable">Komponen</span>
                <q-select v-model="filter.komponen_id" :options="list_komponen" option-label="nama_komponen"
                    option-value="id" emit-value map-options outlined dense class="bg-white" @input="applyFilter" />
            </div>

            <div class="col-12 col-md-4">
                <span class="h_lable">Status</span>
                <q-select v-model="filter.status" :options="statusOptions" outlined dense class="bg-white"
                    @input="applyFilter" />
            </div>

        </div>

        <hr class="hrpagin2" />

        <!-- ================= TABLE ================= -->
        <div class="tbl_responsive">
            <table width="100%">
                <thead class="h_table_head main2x text-white">
                    <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="18%">Nama Pasien</th>
                        <th width="6%">Gol.Darah</th>
                        <th width="6%" class="text-center">Rhesus</th>
                        <th width="20%">Komponen</th>
                        <th width="6%" class="text-center">Jumlah</th>
                        <th width="12%">Tgl Permintaan</th>
                        <th width="15%">Status</th>
                        <th width="12%">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>
                        <td>{{ data.nama_pasien }}</td>
                        <td class="text-center">{{ data.golongan_darah }}</td>
                        <td class="text-center">{{ data.rhesus }}</td>
                        <td>{{ data.nama_komponen || '-' }}</td>
                        <td class="text-center">{{ data.jumlah_kantong }}</td>
                        <td>{{ formatTanggal(data.tanggal_permintaan) }}</td>
                        <td>
                            <div>
                                <strong>{{ statusText(data.status, data.status_keterangan) }}</strong>
                                <div v-if="data.status === 4 && data.status_keterangan" class="text-caption">
                                    {{ data.status_keterangan }}
                                </div>
                            </div>
                        </td>
                        <td class="text-center q-gutter-sm">
                            <!-- untuk sekarang hanya lihat detail; aksi lanjutan (edit/verif) nanti -->
                            <q-btn dense round color="primary" icon="visibility" @click="openLihat(data)">
                                <q-tooltip content-class="bg-blue-7">Lihat Detail</q-tooltip>
                            </q-btn>
                        </td>
                    </tr>

                    <tr v-if="list_data.length === 0">
                        <td colspan="9" class="text-center text-grey">
                            Belum ada data permintaan.
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

        <!-- ===================== MODAL ADD ===================== -->
        <q-dialog v-model="mdl_add" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Tambah Permintaan Darah</div>
                </q-card-section>

                <form @submit.prevent="addData">
                    <q-card-section class="q-pt-none">
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Nama Dokter</span>
                                <q-input v-model="form.nama_dokter" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Ruangan</span>
                                <q-select v-model="form.ruangan_id" :options="list_ruangan" option-value="id"
                                    option-label="nama_ruangan" emit-value map-options outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                        </div>

                        <span class="h_lable">Nama Pasien</span>
                        <q-input v-model="form.nama_pasien" outlined square :dense="true" class="bg-white margin_btn"
                            required />


                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Jenis Kelamin</span>
                                <q-select v-model="form.jenis_kelamin"
                                    :options="[{ label: 'Laki-laki', value: 'L' }, { label: 'Perempuan', value: 'P' }]"
                                    option-value="value" option-label="label" emit-value map-options outlined square
                                    :dense="true" class="bg-white margin_btn" required />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Nomor RM</span>
                                <q-input v-model="form.nomor_rm" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Tanggal Lahir</span>
                                <q-input v-model="form.tanggal_lahir" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                        </div>

                        <span class="h_lable">Alamat</span>
                        <q-input v-model="form.alamat" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Nama Wali</span>
                                <q-input v-model="form.nama_wali" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Kadar HB (g/dL)</span>
                                <q-input v-model.number="form.kadar_hb" type="number" step="0.1" outlined square
                                    :dense="true" class="bg-white margin_btn" />
                            </div>
                        </div>

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Golongan Darah</span>
                                <q-select v-model="form.golongan_darah" :options="['A', 'B', 'O', 'AB']" outlined square
                                    :dense="true" class="bg-white margin_btn" required />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Rhesus</span>
                                <q-select v-model="form.rhesus" :options="['+', '-']" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Komponen</span>
                                <q-select v-model="form.komponen_id" :options="list_komponen" option-value="id"
                                    option-label="nama_komponen" emit-value map-options outlined dense
                                    class="bg-white margin_btn" required />
                            </div>
                        </div>

                        <span class="h_lable">Jumlah (Kantong)</span>
                        <q-input v-model.number="form.jumlah_kantong" type="number" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Permintaan</span>
                                <q-input v-model="form.tanggal_permintaan" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Diperlukan</span>
                                <q-input v-model="form.tanggal_diperlukan" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                        </div>

                        <span class="h_lable">Diagnosis Klinis</span>
                        <q-input v-model="form.diagnosis_klinis" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <span class="h_lable">Alasan Transfusi</span>
                        <q-input v-model="form.alasan_transfusi" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_add" color="primary" type="submit" label="Simpan" />
                        <q-btn label="Batal" color="negative" v-close-popup @click="resetForm" />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>

        <!-- ===================== MODAL LIHAT DETAIL ===================== -->
        <q-dialog v-model="mdl_lihat" persistent>
            <q-card class="mdl-md">
                <q-card-section class="bg-orange text-white">
                    <div class="text-h6 h_modalhead">Detail Permintaan Darah</div>
                </q-card-section>

                <q-card-section>
                    <div v-if="lihat_target">
                        <div><strong>Nama Pasien:</strong> {{ lihat_target.nama_pasien }}</div>
                        <div><strong>Dokter:</strong> {{ lihat_target.nama_dokter }}</div>
                        <div><strong>Komponen:</strong> {{ lihat_target.nama_komponen }}</div>
                        <div><strong>Jumlah:</strong> {{ lihat_target.jumlah_kantong }}</div>
                        <div><strong>Tanggal Permintaan:</strong> {{ formatTanggal(lihat_target.tanggal_permintaan) }}
                        </div>
                        <div><strong>Status:</strong> {{ statusText(lihat_target.status, lihat_target.status_keterangan)
                            }}</div>
                        <div v-if="lihat_target.status_keterangan"><strong>Keterangan:</strong> {{
                                lihat_target.status_keterangan }}</div>
                        <div class="q-mt-md"><strong>Diagnosis:</strong><br> {{ lihat_target.diagnosis_klinis }}</div>
                        <div class="q-mt-md"><strong>Alasan Transfusi:</strong><br> {{ lihat_target.alasan_transfusi }}
                        </div>
                    </div>
                </q-card-section>

                <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    <!-- Tombol Diperiksa & Ditolak hanya tampil ketika request masih DIAJUKAN (status==1)
         dan user bukan Admin Ruangan (tipe !== 3). Ubah kondisi jika role-mapping berbeda. -->
                    <div v-if="lihat_target && Number(lihat_target.status) === 1 && tipe !== 3"
                        class="row items-center q-gutter-sm">
                        <q-btn :loading="btn_periksa" color="primary" label="Diperiksa" dense
                            @click="openPeriksaFor(lihat_target)" />
                        <q-btn :loading="btn_reject" color="negative" label="Ditolak" dense
                            @click="openReject(lihat_target)" />
                    </div>

                    <q-btn label="Tutup" color="negative" v-close-popup @click="lihat_target = null" />
                </q-card-actions>

            </q-card>
        </q-dialog>


        <!-- MODAL PERIKSA (UPD) -->
        <q-dialog v-model="mdl_periksa" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Form Pemeriksaan UPD</div>
                </q-card-section>

                <form @submit.prevent="submitPeriksa">
                    <q-card-section class="q-pt-none">
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Petugas Pemeriksa</span>
                                <q-input v-model="periksa_form.petugas_pemeriksa" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Pemeriksaan</span>
                                <q-input v-model="periksa_form.tanggal_pemeriksaan" type="datetime-local" outlined
                                    square :dense="true" class="bg-white margin_btn" required />
                            </div>
                        </div>

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Golongan Darah Hasil</span>
                                <q-select v-model="periksa_form.golongan_darah_hasil" :options="['A', 'B', 'O', 'AB']"
                                    outlined dense class="bg-white" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Rhesus Hasil</span>
                                <q-select v-model="periksa_form.rhesus_hasil" :options="['+', '-']" outlined dense
                                    class="bg-white" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Jumlah Diberikan (kantong)</span>
                                <q-input v-model.number="periksa_form.jumlah_darah_diberikan" type="number" outlined
                                    dense class="bg-white" />
                            </div>
                        </div>

                        <span class="h_lable">Nomor Kantong</span>
                        <q-input v-model="periksa_form.nomor_kantong" outlined dense class="bg-white" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Petugas Pengeluar</span>
                                <q-input v-model="periksa_form.petugas_pengeluar" outlined dense class="bg-white" />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Penerima Darah</span>
                                <q-input v-model="periksa_form.penerima_darah" outlined dense class="bg-white" />
                            </div>
                        </div>

                        <span class="h_lable">Catatan Tambahan</span>
                        <q-input v-model="periksa_form.catatan_tambahan" type="textarea" outlined dense
                            class="bg-white" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Crossmatch 1</span>
                                <q-select v-model="periksa_form.crossmatch_1" :options="['Cocok', 'Tidak', 'Emergency']"
                                    outlined dense class="bg-white" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Crossmatch 2</span>
                                <q-select v-model="periksa_form.crossmatch_2" :options="['Cocok', 'Tidak', 'Emergency']"
                                    outlined dense class="bg-white" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Crossmatch 3</span>
                                <q-select v-model="periksa_form.crossmatch_3" :options="['Cocok', 'Tidak', 'Emergency']"
                                    outlined dense class="bg-white" />
                            </div>
                        </div>

                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_periksa" color="primary" type="submit" label="Simpan & Tandai Diperiksa" />
                        <q-btn label="Batal" color="negative" v-close-popup @click="mdl_periksa = false" />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>

        <!-- MODAL REJECT -->
        <q-dialog v-model="mdl_reject" persistent>
            <q-card class="mdl-sm">
                <q-card-section class="q-pt-none text-center orageGrad">
                    <form @submit.prevent="submitReject">
                        <br>
                        <div class="text-h6">Alasan Penolakan</div>
                        <q-input v-model="reject_reason" type="textarea" outlined square :dense="true"
                            class="bg-white q-mt-md" required />
                        <q-card-actions align="center" class="q-mt-md">
                            <q-btn label="Batal" size="sm" color="secondary" v-close-popup
                                @click="mdl_reject = false" />
                            &nbsp;
                            <q-btn :loading="btn_reject" type="submit" label="Kirim Penolakan" size="sm"
                                color="negative" />
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
            tipe: 0, // dari profile.stokdarah_konut
            user: null,

            // form tambah permintaan (admin ruangan)
            form: {
                rumah_sakit_id: 1,
                ruangan_id: null,
                nama_dokter: '',
                tanggal_permintaan: '',
                tanggal_diperlukan: '',
                nama_pasien: '',
                nomor_rm: '',
                tanggal_lahir: '',
                alamat: '',
                nama_wali: '',
                jenis_kelamin: '',
                golongan_darah: '',
                rhesus: '',
                komponen_id: null,
                jumlah_kantong: 1,
                diagnosis_klinis: '',
                alasan_transfusi: '',
                kadar_hb: null,
                status: 1, // default 1 = diajukan
                status_keterangan: 'Menunggu Diperiksa oleh Admin UPD'
            },

            list_data: [],
            list_komponen: [],
            list_ruangan: [],

            page_first: 1,
            page_last: 0,
            page_limit: 10,
            jml_data: 0,
            total_data: 0,
            cari_value: '',

            mdl_add: false,
            btn_add: false,

            mdl_lihat: false,
            lihat_target: null,

            filter: {
                komponen_id: '',
                golongan_darah: '',
                status: ''
            },

            statusOptions: [
                { label: 'Semua', value: '' },
                { label: 'Diajukan', value: 1 },
                { label: 'Diperiksa', value: 2 },
                { label: 'Disetujui', value: 3 },
                { label: 'Ditolak', value: 4 }
            ],
            mdl_periksa: false,
            mdl_reject: false,
            btn_periksa: false,
            btn_reject: false,
            periksa_form: {
                id: null,
                petugas_pemeriksa: '',
                tanggal_pemeriksaan: '', // ISO datetime or date string
                golongan_darah_hasil: '',
                rhesus_hasil: '',
                catatan_tambahan: '',
                crossmatch_1: '',
                crossmatch_2: '',
                crossmatch_3: '',
                jumlah_darah_diberikan: null,
                nomor_kantong: '',
                petugas_pengeluar: '',
                penerima_darah: ''
            },
            reject_reason: ''
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
                status: this.filter.status || ''
            }).toString()

            // sesuaikan key URL di store: gunakan PERMINTAAN
            const URL = this.$store.state.url.PERMINTAAN || (this.$store.state.url.BASE || '') + "permintaan_darah/";

            fetch(URL + "view?" + query, {
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
                        if (this.page_first > this.page_last) this.page_first = this.page_last || 1
                    } else {
                        this.$q.notify({ type: 'negative', message: res_data.message || 'Gagal memuat data permintaan darah' })
                    }
                })
                .catch(err => {
                    console.error('Error fetching permintaan:', err)
                    this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memuat data permintaan darah' })
                })
        },

        getKomponen() {
            const URL = this.$store.state.url.KOMPONEN || (this.$store.state.url.BASE || '') + "komponen_darah/";
            fetch(URL + "view", {
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

        getRuangan() {
            // ganti key URL sesuai store kamu; saya asumsikan ada this.$store.state.url.TENAGA_MEDIS
            const URL = this.$store.state.url.REGIS_MEDIS || (this.$store.state.url.BASE || '') + "getview/";
            fetch(URL + "getview", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({})
            })
                .then(res => res.json())
                .then(res_data => {
                    // server diharapkan mengembalikan array objek tenaga_medis dengan properti id dan nama_ruangan
                    this.list_ruangan = res_data.data || []
                })
                .catch(err => console.error("Error getRuangan:", err))
        },


        addData() {
            this.btn_add = true

            const URL = this.$store.state.url.PERMINTAAN || (this.$store.state.url.BASE || '') + "permintaan_darah/";

            fetch(URL + "addData", {
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
                        this.$q.notify({ type: "positive", message: res_data.message || "Permintaan berhasil ditambahkan" })
                        this.mdl_add = false
                        this.resetForm()
                        this.getView()
                    } else {
                        this.$q.notify({ type: "negative", message: res_data.message || "Gagal menambah permintaan" })
                    }
                })
                .catch(err => {
                    console.error("Error addData:", err)
                    this.$q.notify({ type: "negative", message: "Gagal menambah permintaan darah" })
                })
                .finally(() => {
                    this.btn_add = false
                })
        },

        resetForm() {
            this.form = {
                rumah_sakit_id: 1,
                ruangan_id: null,
                nama_dokter: '',
                tanggal_permintaan: '',
                tanggal_diperlukan: '',
                nama_pasien: '',
                nomor_rm: '',
                tanggal_lahir: '',
                alamat: '',
                nama_wali: '',
                jenis_kelamin: '',
                golongan_darah: '',
                rhesus: '',
                komponen_id: null,
                jumlah_kantong: 1,
                diagnosis_klinis: '',
                alasan_transfusi: '',
                kadar_hb: null,
                status: 1,
                status_keterangan: 'Menunggu Diperiksa oleh Admin UPD'
            }
        },


        openLihat(data) {
            this.lihat_target = data
            this.mdl_lihat = true
        },

        // kirim update status generic
        updateStatusRequest(payload) {
            const URL = this.$store.state.url.PERMINTAAN || (this.$store.state.url.BASE || '') + "permintaan_darah/";
            return fetch(URL + "updateStatus", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
        },

        // tombol 'Diperiksa' -> buka modal pemeriksaan dan isi periksa_form dari lihat_target
        openPeriksaFor(row) {
            // prefill periksa_form dengan beberapa data jika ada
            this.periksa_form = {
                id: row.id,
                petugas_pemeriksa: '',
                tanggal_pemeriksaan: new Date().toISOString().slice(0, 16), // format yyyy-mm-ddThh:mm for input datetime-local
                golongan_darah_hasil: row.golongan_darah || '',
                rhesus_hasil: row.rhesus || '',
                catatan_tambahan: '',
                crossmatch_1: '',
                crossmatch_2: '',
                crossmatch_3: '',
                jumlah_darah_diberikan: null,
                nomor_kantong: '',
                petugas_pengeluar: '',
                penerima_darah: ''
            };
            this.mdl_periksa = true;
        },

        // simpan hasil pemeriksaan -> status = 2 (Diperiksa)
        submitPeriksa() {
            if (!this.periksa_form || !this.periksa_form.id) {
                this.$q.notify({ type: 'negative', message: 'Data pemeriksaan tidak lengkap' });
                return;
            }
            this.btn_periksa = true;
            const payload = Object.assign({}, this.periksa_form, { status: 2 });
            // optional: if you want custom status_keterangan, include here (server will add default if missing)
            this.updateStatusRequest(payload)
                .then(res => {
                    if (res && res.success) {
                        this.$q.notify({ type: 'positive', message: res.message || 'Permintaan ditandai Diperiksa' });
                        this.mdl_periksa = false;
                        this.lihat_target = null;
                        this.getView();
                    } else {
                        this.$q.notify({ type: 'negative', message: res.message || 'Gagal update status' });
                    }
                })
                .catch(err => {
                    console.error('Error submitPeriksa:', err);
                    this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat mengirim data' });
                })
                .finally(() => this.btn_periksa = false);
        },

        // tombol 'Ditolak' -> buka modal isian alasan
        openReject(row) {
            this.reject_reason = '';
            this.lihat_target = row;
            this.mdl_reject = true;
        },

        // kirim penolakan -> status = 4
        submitReject() {
            if (!this.lihat_target || !this.lihat_target.id) {
                this.$q.notify({ type: 'negative', message: 'Tidak ada permintaan yang dipilih' });
                return;
            }
            if (!this.reject_reason || !String(this.reject_reason).trim()) {
                this.$q.notify({ type: 'negative', message: 'Alasan penolakan wajib diisi' });
                return;
            }
            this.btn_reject = true;
            const payload = {
                id: this.lihat_target.id,
                status: 4,
                status_keterangan: this.reject_reason
            };
            this.updateStatusRequest(payload)
                .then(res => {
                    if (res && res.success) {
                        this.$q.notify({ type: 'positive', message: res.message || 'Permintaan berhasil ditolak' });
                        this.mdl_reject = false;
                        this.lihat_target = null;
                        this.getView();
                    } else {
                        this.$q.notify({ type: 'negative', message: res.message || 'Gagal menolak permintaan' });
                    }
                })
                .catch(err => {
                    console.error('Error submitReject:', err);
                    this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat mengirim penolakan' });
                })
                .finally(() => this.btn_reject = false);
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

        applyFilter() {
            this.page_first = 1
            this.getView()
        },

        statusText(code, keterangan) {
            // code mungkin string atau number
            const c = Number(code)
            if (c === 1) return 'Menunggu Diperiksa oleh Admin UPD'
            if (c === 2) return 'Permintaan Sedang diperiksa'
            if (c === 3) return 'Permintaan Darah sudah berhasil'
            if (c === 4) return keterangan || 'Ditolak'
            return '-'
        }
    },

    mounted() {
        // ambil profile dari localStorage (sesuai contoh kamu)
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

        this.getKomponen()
        this.getView()
        this.getRuangan()
        this.form.rumah_sakit_id = 1;
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
