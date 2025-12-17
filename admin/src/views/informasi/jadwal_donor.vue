<template>
    <div class="about " style="padding:15px">
        <q-card bordered class="my-card">
            <q-card-section class="main2 text-white">
                <div class="row items-center q-col-gutter-md">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Jadwal Donor</div>
                        <div class="text-h8">Informasi Pindara</div>
                    </div>

                    <!-- Cari + Tombol Add -->
                    <div class="col-12 col-md-6">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square dense
                                class="bg-white col q-mr-sm" placeholder="Cari lokasi / keterangan..." />
                            <q-btn glossy class="col-auto" color="green" @click="mdl_add = true" dense icon="add">
                                <q-tooltip content-class="bg-green-7" content-style="font-size: 13px">
                                    Tambah Jadwal Donor
                                </q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>

            </q-card-section>

        </q-card>

        <hr class="hrpagin2">

        <div class="tbl_responsive">
            <table width="100%">
                <tr class="h_table_head main1 text-white ">
                    <th width="5%" class="text-center">No</th>
                    <th width="25%">Nama Kegiatan</th>
                    <th width="15%">Tanggal</th>
                    <th width="20%">Lokasi</th>
                    <th width="10%">Jam</th>
                    <th width="10%">Poster</th>
                    <th width="15%" class="text-center">Act</th>
                </tr>

                <tr class="h_table_body" v-for="(data, index) in list_data" :key="data.id">
                    <td class="text-center">{{ indexing(index + 1) }}.</td>

                    <td>
                        <div class="text-bold">{{ data.nama_kegiatan }}</div>
                        <div class="q-mt-sm">
                            <q-btn dense small color="positive" @click="openPeserta(data)" class="row items-center">
                                <q-icon name="people" class="q-mr-xs" />
                                <span style="font-size:13px">
                                    {{ participantsCount[data.id] != null ? participantsCount[data.id] + ' peserta' :
                                'Peserta' }}
                                </span>
                            </q-btn>

                        </div>
                    </td>
                    <td>
                        <div class="text-bold">{{ UMUM.tglConvert(data.tanggal_mulai) }} - {{
                                UMUM.tglConvert(data.tanggal_selesai) }}</div>
                        <div style="font-size:12px;">
                            <span>
                                <q-badge :color="statusColor(data.status)">
                                    {{ statusLabel(data.status) }}
                                </q-badge>
                            </span>

                        </div>
                    </td>

                    <td>
                        <div class="text-bold">{{ data.lokasi }}</div>
                        <div style="font-size:12px;">
                            <span class="text-blue">{{ data.map_link ? 'Map tersedia' : 'Map: -' }}</span>

                        </div>
                    </td>

                    <td class="text-center">{{ data.jam || '-' }}</td>

                    <td class="text-center">
                        <img v-if="data.file_name" :src="file_path + data.file_name" alt="poster"
                            style="max-width: 80px; border-radius: 6px; cursor: pointer;"
                            @click="openImage(file_path + data.file_name)" />
                        <q-icon v-else name="image_not_supported" size="sm" color="grey" />
                    </td>

                    <td class="text-center q-gutter-sm">
                        <q-btn dense round color="warning" icon="edit" @click="openEdit(data)">
                            <q-tooltip content-class="bg-amber-7">Edit</q-tooltip>
                        </q-btn>
                        <q-btn dense round color="negative" icon="delete" @click="openDelete(data)">
                            <q-tooltip content-class="bg-red-7">Hapus</q-tooltip>
                        </q-btn>
                        <q-btn dense round color="primary" icon="visibility" @click="openLihat(data)">
                            <q-tooltip content-class="bg-blue-7">Lihat</q-tooltip>
                        </q-btn>
                    </td>
                </tr>

            </table>
        </div>

        <hr class="hrpagin">
        <br>
        <div class="flex flex-center">
            <q-pagination v-model="page_first" :max="page_last" :max-pages="4" color="grey-6" :direction-links="true"
                :boundary-links="true" icon-first="skip_previous" icon-last="skip_next" icon-prev="fast_rewind"
                icon-next="fast_forward" @input="getView" />
        </div>

        <!-- MODAL ADD -->
        <q-dialog v-model="mdl_add" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Tambah Jadwal Donor</div>
                </q-card-section>

                <form @submit.prevent="addData()">
                    <q-card-section class="q-pt-none">
                        <hr class="hrpagin2">

                        <span class="h_lable">Nama Kegiatan</span>
                        <q-input v-model="form.nama_kegiatan" outlined square dense class="bg-white margin_btn" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Mulai</span>
                                <q-input v-model="form.tanggal_mulai" type="date" outlined square dense
                                    class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Selesai</span>
                                <q-input v-model="form.tanggal_selesai" type="date" outlined square dense
                                    class="bg-white margin_btn" />
                            </div>
                        </div>


                        <span class="h_lable">Jam Mulai - Selesai</span>
                        <q-input v-model="form.jam" placeholder="08:00 - 24:00" outlined square dense
                            class="bg-white margin_btn" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Lokasi</span>
                                <q-input v-model="form.lokasi" outlined square dense class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Map Link (opsional)</span>
                                <q-input v-model="form.map_link" outlined square dense class="bg-white margin_btn" />
                            </div>
                        </div>


                        <span class="h_lable">Keterangan (opsional)</span>
                        <q-input v-model="form.keterangan" type="textarea" outlined square dense
                            class="bg-white margin_btn" />

                        <span class="h_lable">Kuota Pendonor</span>
                        <q-input v-model="form.jumlah_terdaftar" type="number" outlined square dense required
                            class="bg-white margin_btn" />

                        <span class="h_lable">Poster (opsional)</span>
                        <q-file v-model="form.file_name" label="Pilih Poster" outlined square dense
                            class="bg-white margin_btn" />

                        <hr class="hrpagin2">
                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_add" color="primary" type="submit" label="Simpan" />
                        <q-btn label="Batal" color="negative" v-close-popup />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>

        <!-- MODAL EDIT -->
        <q-dialog v-model="mdl_edit" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Edit Jadwal Donor</div>
                </q-card-section>

                <form @submit.prevent="updateData()">
                    <q-card-section class="q-pt-none">
                        <hr class="hrpagin2">

                        <span class="h_lable">Status</span>
                        <q-select v-model="form.status" :options="statusOptions" option-label="label"
                            option-value="value" outlined dense class="bg-white margin_btn" />

                        <span class="h_lable">Nama Kegiatan</span>
                        <q-input v-model="form.nama_kegiatan" outlined square dense class="bg-white margin_btn" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Mulai</span>
                                <q-input v-model="form.tanggal_mulai" type="date" outlined square dense
                                    class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Selesai</span>
                                <q-input v-model="form.tanggal_selesai" type="date" outlined square dense
                                    class="bg-white margin_btn" />
                            </div>
                        </div>

                        <span class="h_lable">Jam Mulai - Selesai</span>
                        <q-input v-model="form.jam" placeholder="08:00 - 24:00" outlined square dense
                            class="bg-white margin_btn" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Lokasi</span>
                                <q-input v-model="form.lokasi" outlined square dense class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Map Link (opsional)</span>
                                <q-input v-model="form.map_link" outlined square dense class="bg-white margin_btn" />
                            </div>
                        </div>

                        <span class="h_lable">Keterangan (opsional)</span>
                        <q-input v-model="form.keterangan" type="textarea" outlined square dense
                            class="bg-white margin_btn" />

                        <span class="h_lable">Jumlah Terdaftar (opsional)</span>
                        <q-input v-model="form.jumlah_terdaftar" type="number" outlined square dense
                            class="bg-white margin_btn" />



                        <span class="h_lable">Poster Baru (opsional)</span>
                        <q-file v-model="fileBaru" label="Pilih Poster Baru" outlined square dense
                            class="bg-white margin_btn" />

                        <!-- preview menggunakan file_name -->
                        <div v-if="form.file_name && !fileBaru" class="q-mt-sm">
                            <q-img :src="file_path + form.file_name" style="max-width: 150px; border-radius: 6px;" />
                            <div class="text-caption text-grey">Poster lama</div>
                        </div>

                        <hr class="hrpagin2">
                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_edit" color="primary" type="submit" label="Update" />
                        <q-btn label="Batal" color="negative" v-close-popup />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>

        <q-dialog v-model="mdl_lihat" persistent>
            <q-card class="mdl-lg q-pa-none" style="max-width: 900px; border-radius: 16px; overflow: hidden;">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Detail Jadwal Donor</div>
                </q-card-section>

                <q-card-section class="q-pa-lg scroll" style="max-height: 70vh; overflow-y: auto;">
                    <div class="text-h5 q-mb-md">{{ form.lokasi }}</div>

                    <div class="text-grey-7 q-mb-md" style="font-size: 14px;">
                        <q-icon name="event" size="16px" class="q-mr-xs" />
                        <span class="q-mr-md">Tanggal: <span class="text-blue">{{ UMUM.tglConvert(form.tanggal_mulai)
                                }}</span></span>
                        <q-icon name="schedule" size="16px" class="q-mr-xs" />
                        <span>{{ form.jam }}</span>
                        <div style="margin-top:6px;">
                            <q-badge :color="statusColor(form.status)" class="q-mt-sm">{{ statusLabel(form.status)
                                }}</q-badge>
                        </div>
                    </div>

                    <div class="q-mb-md">
                        <div class="text-subtitle2 text-bold">Keterangan</div>
                        <div class="text-body2 text-grey-8">{{ form.keterangan || '-' }}</div>
                    </div>

                    <div v-if="form.map_link" class="q-mb-md">
                        <div class="text-subtitle2 text-bold">Map Link</div>
                        <div class="text-body2 q-mt-sm"><a :href="form.map_link" target="_blank">{{ form.map_link }}</a>
                        </div>
                    </div>

                    <div v-if="form.file_name" class="q-mb-md">
                        <div class="text-subtitle2 text-bold">Poster</div>
                        <q-img :src="file_path + form.file_name" style="max-width: 100%; border-radius: 6px;" />
                    </div>


                    <div class="q-mb-md">
                        <div class="text-subtitle2 text-bold">Jumlah Terdaftar</div>
                        <div class="text-body2 text-grey-8">{{ form.jumlah_terdaftar != null ? form.jumlah_terdaftar :
                                '-' }}</div>
                    </div>
                </q-card-section>

                <q-separator />
                <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    <q-btn label="Tutup" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- MODAL HAPUS -->
        <q-dialog v-model="mdl_delete" persistent>
            <q-card class="mdl-sm ">
                <q-card-section class="q-pt-none text-center orageGrad">
                    <form @submit.prevent="removeData">
                        <br>
                        <img src="img/alert.png" alt="" width="75"> <br>
                        <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI??</span>
                        <input type="submit" style="position: absolute; left: -9999px" />
                        <br><br>
                        <q-btn label="Batal" size="sm" color="negative" v-close-popup />
                        &nbsp;
                        <q-btn type="submit" label="Hapus" size="sm" color="primary" v-close-popup />
                    </form>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- MODAL IMG -->
        <q-dialog v-model="mdl_image">
            <q-card class="bg-purple mdl-lg">
                <q-card-section class="text-center">
                    <q-img :src="selectedImage" style="max-width: 90vw; max-height: 90vh; border-radius: 10px;"
                        fit="contain" />
                </q-card-section>
                <q-card-actions align="center">
                    <q-btn flat label="Tutup" color="white" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>




        <!-- MODAL PESERTA -->
        <q-dialog v-model="mdl_peserta">
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Daftar Peserta - {{ currentJadwal.nama_kegiatan || '-' }}</div>
                </q-card-section>

                <q-card-section class="q-pa-lg scroll" style="max-height: 70vh; overflow-y: auto;">
                    <!-- Tabel peserta -->
                    <div class="tbl_responsive q-mb-md">
                        <table width="100%">
                            <tr class="h_table_head main1 text-white ">
                                <th class="text-center" width="5%">No</th>
                                <th>Nama</th>
                                <th>Jk</th>
                                <th>Golongan</th>
                                <th>Rhesus</th>
                                <th>HP</th>
                                <th class="text-center">Aksi</th>
                            </tr>

                            <tr v-for="(p, i) in participants" :key="p.id" class="h_table_body">
                                <td class="text-center">{{ i + 1 }}</td>
                                <td>{{ p.nama_lengkap }}</td>
                                <td>{{ p.jenis_kelamin }}</td>
                                <td>{{ p.golongan_darah }}</td>
                                <td class="text-center">{{ p.rhesus }}</td>
                                <td>{{ p.no_hp }}</td>
                                <td class="text-center">
                                    <q-btn dense round color="negative" icon="delete" @click="removePeserta(p.id)">
                                        <q-tooltip>Hapus</q-tooltip>
                                    </q-btn>
                                </td>
                            </tr>

                            <tr v-if="participants.length === 0">
                                <td colspan="7" class="text-center text-grey">Belum ada peserta</td>
                            </tr>
                        </table>
                    </div>

                    <q-separator />

                    <!-- Form tambah peserta: hanya pilih dari pendonor_darah -->
                    <div class="q-mt-md">
                        <div class="text-subtitle2 text-bold">Tambah Peserta (Pilih dari daftar pendonor)</div>

                        <div class="row q-col-gutter-md q-mt-sm">
                            <div class="col-12 col-md-6">
                                <!-- <q-select v-model="selectedPendonor" :options="availableOptions" option-value="id"
                                    option-label="label" outlined dense class="bg-white margin_btn" use-input fill-input
                                    input-debounce="300" placeholder="Ketik nama pendonor..." @filter="onFilter"
                                    @input="onSelectPendonor"
                                    no-options-label="Tidak ada pendonor yang cocok atau belum terdaftar" /> -->
                                <q-select v-model="selectedPendonor" :options="availableOptions" option-label="label"
                                    outlined dense class="bg-white margin_btn" use-input input-debounce="300"
                                    placeholder="Ketik nama pendonor..." @filter="onFilter" @input="onSelectPendonor"
                                    no-options-label="Tidak ada pendonor yang cocok atau belum terdaftar" />

                            </div>

                            <div class="col-12 col-md-6">
                                <q-btn :loading="btn_add_peserta" color="positive" label="Tambah Peserta"
                                    @click="addPeserta()" />
                                <q-btn flat label="Reset" @click="resetPesertaForm()" />
                            </div>
                        </div>
                    </div>
                </q-card-section>

                <q-separator />
                <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    <q-btn label="Tutup" color="negative" v-close-popup @click="mdl_peserta = false" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script>
import UMUM from "../../library/umum.js";

export default {
    data() {
        return {
            list_data: [],
            form: {
                nama_kegiatan: '',
                tanggal_mulai: '',
                tanggal_selesai: '',
                jam: '',
                lokasi: '',
                map_link: '',
                keterangan: '',
                file_name: null,
                jumlah_terdaftar: null,
                status: 1 // default aktif
            },
            fileBaru: null,
            UMUM: UMUM,
            btn_add: false,
            btn_edit: false,
            mdl_add: false,
            mdl_edit: false,
            mdl_delete: false,
            mdl_lihat: false,
            mdl_image: false,
            mdl_peserta: false,
            selectedImage: null,
            cari_value: "",
            page_first: 1,
            page_last: 1,
            page_limit: 9,
            total: 0,
            tipe: null,
            file_path: this.$store.state.url.URL_APP + "uploads/",
            statusOptions: [
                { label: '1 - Aktif', value: 1 },
                { label: '2 - Selesai', value: 2 },
                { label: '3 - Dibatalkan', value: 3 }
            ],
            currentJadwal: {},
            participants: [],
            participantsCount: {},
            pendonorDarahOptions: [],
            selectedPendonor: null,
            btn_add_peserta: false,
            searchInput: '',
        }
    },


    computed: {
        availableOptions() {
            // buat set id peserta (string) untuk perbandingan
            const partIds = new Set(
                (this.participants || [])
                    .map(p => String(p.pendonor_id ?? p.id ?? p.user_id ?? p.id_pendonor ?? ''))
                    .filter(Boolean)
            );

            // normalisasi pendonorDarahOptions -> pastikan id sebagai string dan ada label
            const normalized = (this.pendonorDarahOptions || []).map(opt => {
                return {
                    ...opt,
                    id: String(opt.id),
                    label: (opt.label || `${opt.nama_lengkap || opt.nama || '-'} / ${opt.golongan_darah || ''} ${opt.rhesus ? opt.rhesus : ''} / ${opt.no_hp || '-'}`).trim()
                };
            });

            // hilangkan yang sudah terdaftar
            let available = normalized.filter(o => !partIds.has(String(o.id)));

            // hapus duplikat berdasarkan id (keamanan)
            available = available.filter((item, idx, arr) => arr.findIndex(x => x.id === item.id) === idx);

            // support searchInput seperti sebelumnya
            const input = String(this.searchInput || '').toLowerCase().trim();
            if (!input) {
                return available.slice(0, 8);
            }
            return available.filter(opt => (opt.label || '').toLowerCase().includes(input));
        }
    },

    methods: {

        statusLabel(val) {
            if (val == 1) return 'Aktif'
            if (val == 2) return 'Selesai'
            if (val == 3) return 'Dibatalkan'
            return '-'
        },

        statusColor(val) {
            if (val == 1) return 'positive'
            if (val == 2) return 'warning'
            if (val == 3) return 'negative'
            return 'grey'
        },

        openEdit(data) {
            this.form = {
                id: data.id || null,
                nama_kegiatan: data.nama_kegiatan || '',
                tanggal_mulai: data.tanggal_mulai || '',
                tanggal_selesai: data.tanggal_selesai || '',
                jam: data.jam || '',
                lokasi: data.lokasi || '',
                map_link: data.map_link || '',
                keterangan: data.keterangan || '',
                file_name: data.file_name || null,
                jumlah_terdaftar: data.jumlah_terdaftar ?? null,
                status: data.status != null ? data.status : 1
            }
            this.fileBaru = null
            this.mdl_edit = true
        },


        openDelete(data) {
            this.form = { id: data.id }
            this.mdl_delete = true
        },

        openLihat(data) {
            this.form = {
                id: data.id || null,
                nama_kegiatan: data.nama_kegiatan || '',
                tanggal_mulai: data.tanggal_mulai || '',
                tanggal_selesai: data.tanggal_selesai || '',
                jam: data.jam || '',
                lokasi: data.lokasi || '',
                map_link: data.map_link || '',
                keterangan: data.keterangan || '',
                file_name: data.file_name || null,
                jumlah_terdaftar: data.jumlah_terdaftar ?? null,
                status: data.status != null ? Number(data.status) : 1
            }
            this.mdl_lihat = true
        },

        openImage(src) {
            this.selectedImage = src
            this.mdl_image = true
        },

        resetForm() {
            this.form = {
                id: null,
                nama_kegiatan: '',
                tanggal_mulai: '',
                tanggal_selesai: '',
                jam: '',
                lokasi: '',
                map_link: '',
                keterangan: '',
                file_name: null,
                jumlah_terdaftar: null,
                status: 1
            }
            this.fileBaru = null
        },

        async getView() {
            try {
                this.$store.commit("shoWLoading");

                const res = await fetch(this.$store.state.url.JADWAL_DONOR + "getview", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        authorization: "kikensbatara " + localStorage.token
                    },
                    body: JSON.stringify({
                        data_ke: this.page_first,
                        cari_value: this.cari_value,
                        page_limit: this.page_limit
                    })
                });

                const res_data = await res.json();

                this.list_data = res_data.data || [];
                this.total = res_data.total || 0;
                this.page_last = Math.ceil(this.total / this.page_limit) || 1;

                // update counts untuk semua jadwal yang ter-load (paralel)
                if (Array.isArray(this.list_data) && this.list_data.length) {
                    const promises = this.list_data.map(item => this.fetchParticipantsCount(item.id));
                    await Promise.all(promises);
                }

                this.$store.commit("hideLoading");
            } catch (err) {
                console.error("❌ Error getView Jadwal Donor:", err);
                this.$store.commit("hideLoading");
            }
        },

        addData() {
            this.btn_add = true;
            const formData = new FormData();

            formData.append("nama_kegiatan", this.form.nama_kegiatan);
            formData.append("tanggal_mulai", this.form.tanggal_mulai);
            formData.append("tanggal_selesai", this.form.tanggal_selesai);
            formData.append("jam", this.form.jam);
            formData.append("lokasi", this.form.lokasi);
            formData.append("map_link", this.form.map_link || '');
            formData.append("keterangan", this.form.keterangan || '');
            formData.append("jumlah_terdaftar", this.form.jumlah_terdaftar != null ? this.form.jumlah_terdaftar : '');
            // set status default = 1 (Aktif)
            formData.append("status", 1);

            // q-file v-model sudah di-bind ke form.file_name pada template Anda
            // jika user memilih file di add -> form.file_name akan menjadi File object
            if (this.form.file_name) {
                formData.append("file_name", this.form.file_name);
            }

            fetch(this.$store.state.url.JADWAL_DONOR + "addData", {
                method: "POST",
                headers: {
                    authorization: "kikensbatara " + localStorage.token
                },
                body: formData
            })
                .then(res => res.json())
                .then(res_data => {
                    this.btn_add = false;
                    if (res_data.success) {
                        this.$q.notify({ type: "positive", message: res_data.message || "Sukses menambah jadwal" })
                        this.getView();
                        this.mdl_add = false;
                        this.resetForm();
                    } else {
                        this.$q.notify({ type: "negative", message: res_data.message || "Gagal menambah jadwal" })
                    }
                })
                .catch(err => {
                    this.btn_add = false;
                    console.error("❌ Error addData Jadwal Donor:", err);
                    this.$q.notify({ type: "negative", message: "Terjadi kesalahan server" })
                })
        },

        async updateData() {
            try {
                this.btn_edit = true;
                const formData = new FormData();
                formData.append("id", this.form.id);
                formData.append("nama_kegiatan", this.form.nama_kegiatan);
                formData.append("tanggal_mulai", this.form.tanggal_mulai);
                formData.append("tanggal_selesai", this.form.tanggal_selesai);
                formData.append("jam", this.form.jam);
                formData.append("lokasi", this.form.lokasi);
                formData.append("map_link", this.form.map_link || '');
                formData.append("keterangan", this.form.keterangan || '');
                formData.append("jumlah_terdaftar", this.form.jumlah_terdaftar != null ? this.form.jumlah_terdaftar : '');
                formData.append(
                    "status",
                    typeof this.form.status === "object"
                        ? this.form.status.value
                        : this.form.status
                );


                if (this.fileBaru) {
                    // user upload file baru pada edit
                    formData.append("file_name", this.fileBaru);
                } else {
                    // tidak upload baru -> kirim nama file lama agar backend tahu tetap memakai file lama
                    formData.append("file_name", this.form.file_name || '');
                }

                const res = await fetch(this.$store.state.url.JADWAL_DONOR + "editData", {
                    method: "POST",
                    headers: {
                        authorization: "kikensbatara " + localStorage.token
                    },
                    body: formData
                });

                const result = await res.json();
                this.btn_edit = false;
                if (result.success) {
                    this.$q.notify({ type: "positive", message: result.message || "Sukses update jadwal" })
                    this.mdl_edit = false;
                    this.getView();
                } else {
                    this.$q.notify({ type: "negative", message: result.message || "Gagal update jadwal" })
                }
            } catch (err) {
                this.btn_edit = false;
                console.error("❌ Error updateData Jadwal Donor:", err);
                this.$q.notify({ type: "negative", message: "Gagal update data" })
            }
        },

        removeData() {
            fetch(this.$store.state.url.JADWAL_DONOR + "removeData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({ id: this.form.id })
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.$q.notify({ type: "positive", message: res_data.message || 'Sukses menghapus jadwal' })
                        this.getView()
                    } else {
                        this.$q.notify({ type: "negative", message: res_data.message || 'Data tidak ditemukan' })
                    }
                })
                .catch(err => {
                    console.error("❌ Error removeData Jadwal Donor:", err);
                    this.$q.notify({ type: "negative", message: 'Terjadi kesalahan server' })
                })
        },

        cari_data() {
            this.page_first = 1;
            this.getView();
        },

        indexing(index) {
            return ((this.page_first - 1) * this.page_limit) + index;
        },

        async openPeserta(jadwal) {
            this.currentJadwal = jadwal || {};
            this.mdl_peserta = true;
            this.participants = [];
            this.pendonorDarahOptions = [];
            this.selectedPendonor = null;
            this.btn_add_peserta = false;
            this.searchInput = '';

            try {
                this.$store.commit("shoWLoading");

                // 1) ambil peserta (pendonor yang sudah ditautkan ke jadwal) dari backend
                const res = await fetch(this.$store.state.url.JADWAL_DONOR + "getParticipants", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        authorization: "kikensbatara " + localStorage.token
                    },
                    body: JSON.stringify({ jadwal_id: this.currentJadwal.id })
                });
                const json = await res.json();
                this.participants = json.data || [];
                console.log('Participants updated:', this.participants);

                this.$set(this.participantsCount, this.currentJadwal.id, (this.participants || []).length);


                // 2) ambil seluruh pendonor dari tabel pendonor_darah untuk opsi select
                // GANTI endpoint di bawah jika nama endpoint Anda berbeda
                // contoh asumsi: this.$store.state.url.PENDONOR_DARAH + "list"
                const pendRes = await fetch(this.$store.state.url.REGIS_DONOR + "list", {
                    method: "GET",
                    headers: {
                        authorization: "kikensbatara " + localStorage.token
                    }
                });
                const pendJson = await pendRes.json();
                console.log('Raw backend data:', pendJson.data);
                // Cek duplikasi label
                const labels = pendJson.data.map(d => d.label);
                const uniqueLabels = [...new Set(labels)];
                if (labels.length !== uniqueLabels.length) {
                    console.warn('Duplikasi label dari backend:', labels.filter((l, i) => labels.indexOf(l) !== i));
                }


                console.log('pendonor list response:', pendJson);
                // pendJson.data diharapkan array objek: { id, nama, jenis_kelamin, golongan_darah, rhesus, no_hp }
                // Di dalam openPeserta(), ganti mapping ini:
                // this.pendonorDarahOptions = (pendJson.data || []).map(p => {
                //     const nama = p.nama_lengkap || '';  // <-- INI SALAH: p.nama_lengkap tidak ada
                //     const gol = p.golongan_darah || '';
                //     const rhesus = p.rhesus || '';
                //     const no_hp = p.no_hp || '';
                //     return {
                //         id: String(p.id),
                //         label: `${nama || '-'} — ${gol || '-'}${rhesus ? rhesus : ''} — ${no_hp || '-'}`,
                //         raw: p
                //     };
                // });
                // MENJADI: Gunakan data langsung dari backend (sudah ada label dan raw)
                // this.pendonorDarahOptions = pendJson.data || [];
                this.pendonorDarahOptions = (pendJson.data || []).map(p => {
                    return {
                        ...p,
                        id: String(p.id), // wajib string agar konsisten
                        label: p.label ? String(p.label) : `${p.nama_lengkap || p.nama || '-'} — ${p.golongan_darah || '-'} ${p.rhesus ? p.rhesus : ''} — ${p.no_hp || '-'}`.trim()
                    };
                });

                this.$store.commit("hideLoading");
            } catch (err) {
                console.error("❌ Error openPeserta:", err);
                this.$store.commit("hideLoading");
                this.$q.notify({ type: "negative", message: "Gagal memuat peserta / daftar pendonor" });
            }
        },

        onSelectPendonor(val) {
            console.log('selectedPendonor (objek penuh):', val);
            this.selectedPendonor = val;  // val adalah objek penuh

        },


        resetPesertaForm() {
            this.selectedPendonor = null;
            this.searchInput = '';
            this.btn_add_peserta = false;
        },

        async addPeserta() {
            if (!this.currentJadwal.id) {
                this.$q.notify({ type: "negative", message: "Data jadwal tidak ditemukan" });
                return;
            }
            if (!this.selectedPendonor) {
                this.$q.notify({ type: "negative", message: "Pilih pendonor dari daftar terlebih dahulu" });
                return;
            }

            this.btn_add_peserta = true;
            try {
                const body = {
                    jadwal_id: this.currentJadwal.id,
                    pendonor_id: this.selectedPendonor ? this.selectedPendonor.id : null  // Akses id dari objek
                };

                const res = await fetch(this.$store.state.url.JADWAL_DONOR + "addParticipant", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        authorization: "kikensbatara " + localStorage.token
                    },
                    body: JSON.stringify(body)
                });

                const json = await res.json();
                this.btn_add_peserta = false;

                if (json.success) {
                    this.$q.notify({ type: "positive", message: json.message || "Peserta berhasil ditambahkan" });
                    await this.openPeserta(this.currentJadwal);
                    this.selectedPendonor = null;  // Reset
                } else {
                    this.$q.notify({ type: "negative", message: json.message || "Gagal menambahkan peserta" });
                }
            } catch (err) {
                this.btn_add_peserta = false;
                console.error("❌ Error addPeserta:", err);
                this.$q.notify({ type: "negative", message: "Terjadi kesalahan server" });
            }
        },

        removePeserta(pesertaId) {
            if (!pesertaId) {
                this.$q.notify({ type: 'negative', message: 'ID peserta tidak ditemukan' });
                return;
            }

            const ok = window.confirm('Apakah Anda yakin ingin menghapus peserta ini?');
            if (!ok) return;

            fetch(this.$store.state.url.JADWAL_DONOR + "removeParticipant", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({ id: pesertaId })
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.$q.notify({ type: "positive", message: res_data.message || 'Peserta berhasil dihapus' });
                        this.openPeserta(this.currentJadwal);
                    } else {
                        this.$q.notify({ type: "negative", message: res_data.message || 'Peserta tidak ditemukan' });
                    }
                })
                .catch(err => {
                    console.error("❌ Error removePeserta:", err);
                    this.$q.notify({ type: "negative", message: 'Terjadi kesalahan server' });
                });
        },
        onFilter(val, updateFn) {
            this.searchInput = val;  // Track input
            updateFn();  // Update opsi
        },
        async fetchParticipantsCount(jadwalId) {
            if (!jadwalId) return;
            try {
                const res = await fetch(this.$store.state.url.JADWAL_DONOR + "getParticipants", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        authorization: "kikensbatara " + localStorage.token
                    },
                    body: JSON.stringify({ jadwal_id: jadwalId })
                });
                const json = await res.json();
                const count = Array.isArray(json.data) ? json.data.length : 0;
                // simpan ke map
                this.$set(this.participantsCount, jadwalId, count);
            } catch (err) {
                console.error("❌ Error fetchParticipantsCount:", err);
                this.$set(this.participantsCount, jadwalId, 0);
            }
        },


    },

    mounted() {
        this.getView();
    }
}
</script>