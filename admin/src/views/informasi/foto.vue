<template>
    <div class="about " style="padding:15px">
        <q-card bordered class="my-card">
            <q-card-section class="main2 text-white">
                <div class="row items-center q-col-gutter-md">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Foto Kegiatan</div>
                    </div>

                    <!-- Cari + Tombol Add -->
                    <div class="col-12 col-md-6">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square dense
                                class="bg-white col q-mr-sm" placeholder="Cari..." />
                            <q-btn glossy class="col-auto" color="green" @click="mdl_add = true" dense icon="add">
                                <q-tooltip content-class="bg-green-7" content-style="font-size: 13px">
                                    Tambah Foto kegiatan
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
                    <th width="15%">Foto</th>
                    <th width="50%">Nama Kegiatan</th>
                    <th width="15%">Tanggal</th>
                    <th width="15%" class="text-center">Act</th>
                </tr>

                <tr class="h_table_body" v-for="(data, index) in list_data" :key="data.id">
                    <td class="text-center">{{ indexing(index + 1) }}.</td>

                    <td class="text-center">
                        <img v-if="data.file_name" :src="file_path + data.file_name" alt="poster"
                            style="max-width: 80px; border-radius: 6px; cursor: pointer;"
                            @click="openImage(file_path + data.file_name)" />
                        <q-icon v-else name="image_not_supported" size="sm" color="grey" />
                    </td>

                    <td>
                        <div class="text-bold">{{ data.nama_kegiatan }}</div>
                    </td>
                    <td>
                        <!-- <div class="text-bold">{{ UMUM.tglConvert(data.created_at) }}</div> -->
                        <div class="text-bold">tes</div>
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
                    <div class="text-h6 h_modalhead">Tambah Foto Kegiatan</div>
                </q-card-section>

                <form @submit.prevent="addData()">
                    <q-card-section class="q-pt-none">
                        <hr class="hrpagin2">

                        <span class="h_lable">Nama Kegiatan</span>
                        <q-input v-model="form.nama_kegiatan" outlined square dense class="bg-white margin_btn" />
                    
                        <span class="h_lable">Foto Kegiatan</span>
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
                    <div class="text-h6 h_modalhead">Edit Foto</div>
                </q-card-section>

                <form @submit.prevent="updateData()">
                    <q-card-section class="q-pt-none">
                        <hr class="hrpagin2">

                        <span class="h_lable">Nama Kegiatan</span>
                        <q-input v-model="form.nama_kegiatan" outlined square dense class="bg-white margin_btn" />
                    
                        <span class="h_lable">Foto Kegiatan</span>
                        <q-file v-model="form.file_name" label="Pilih Poster" outlined square dense
                            class="bg-white margin_btn" />

                        <!-- preview menggunakan file_name -->
                        <div v-if="form.file_name && !fileBaru" class="q-mt-sm">
                            <q-img :src="file_path + form.file_name" style="max-width: 150px; border-radius: 6px;" />
                            <div class="text-caption text-grey">Foto lama</div>
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
                file_name: null,
            },
            UMUM: UMUM,
            btn_add: false,
            btn_edit: false,
            mdl_add: false,
            mdl_edit: false,
            mdl_delete: false,
            mdl_image: false,
            selectedImage: null,
            cari_value: "",
            page_first: 1,
            page_last: 1,
            page_limit: 9,
            total: 0,
            tipe: null,
            file_path: this.$store.state.url.URL_APP + "uploads/",
        }
    },

    methods: {

       
        openEdit(data) {
            this.form = {
                id: data.id || null,
                nama_kegiatan: data.nama_kegiatan || '',
                file_name: data.file_name || null,
            }
            this.fileBaru = null
            this.mdl_edit = true
        },


        openDelete(data) {
            this.form = { id: data.id }
            this.mdl_delete = true
        },

        openImage(src) {
            this.selectedImage = src
            this.mdl_image = true
        },

        resetForm() {
            this.form = {
                id: null,
                nama_kegiatan: '',
                file_name: null,
            }
            this.fileBaru = null
        },

        async getView() {
            try {
                this.$store.commit("shoWLoading");

                const res = await fetch(this.$store.state.url.FOTO + "getview", {
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
                this.$store.commit("hideLoading");
            } catch (err) {
                console.error("❌ Error getView foto Donor:", err);
                this.$store.commit("hideLoading");
            }
        },

        addData() {
            this.btn_add = true;
            const formData = new FormData();

            formData.append("nama_kegiatan", this.form.nama_kegiatan);
            if (this.form.file_name) {
                formData.append("file_name", this.form.file_name);
            }

            fetch(this.$store.state.url.FOTO + "addData", {
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
                        this.$q.notify({ type: "positive", message: res_data.message || "Sukses menambah foto" })
                        this.getView();
                        this.mdl_add = false;
                        this.resetForm();
                    } else {
                        this.$q.notify({ type: "negative", message: res_data.message || "Gagal menambah foto" })
                    }
                })
                .catch(err => {
                    this.btn_add = false;
                    console.error("❌ Error addData Foto:", err);
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

                const res = await fetch(this.$store.state.url.FOTO + "editData", {
                    method: "POST",
                    headers: {
                        authorization: "kikensbatara " + localStorage.token
                    },
                    body: formData
                });

                const result = await res.json();
                this.btn_edit = false;
                if (result.success) {
                    this.$q.notify({ type: "positive", message: result.message || "Sukses update foto" })
                    this.mdl_edit = false;
                    this.getView();
                } else {
                    this.$q.notify({ type: "negative", message: result.message || "Gagal update foto" })
                }
            } catch (err) {
                this.btn_edit = false;
                console.error("❌ Error updateData foto Donor:", err);
                this.$q.notify({ type: "negative", message: "Gagal update data" })
            }
        },

        removeData() {
            fetch(this.$store.state.url.FOTO + "removeData", {
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
                        this.$q.notify({ type: "positive", message: res_data.message || 'Sukses menghapus foto' })
                        this.getView()
                    } else {
                        this.$q.notify({ type: "negative", message: res_data.message || 'Data tidak ditemukan' })
                    }
                })
                .catch(err => {
                    console.error("❌ Error removeData foto Donor:", err);
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
    },

    mounted() {
        this.getView();
    }
}
</script>