<template>
    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Komponen Darah</div>
                        <div class="text-h8 h_titleHead">Master Data</div>
                    </div>
                    <div class="col-12 col-md-2"></div>
                    <div class="col-12 col-md-4">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true"
                                class="bg-white" style="width:90%" />
                            <q-btn glossy class="main4" @click="mdl_add = true" dense flat icon="add"
                                style="width:10%">
                                <q-tooltip content-class="green-4" content-style="font-size: 13px">
                                    Click untuk menambah data
                                </q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>
            </q-card-section>

            <q-separator dark inset />

            <q-card-section>
                <hr class="hrpagin2">
                <div class="tbl_responsive">
                    <table width="100%">
                        <thead class="h_table_head main2x text-white">
                            <tr>
                                <th width="5%" class="text-center">No</th>
                                <th width="85%">Nama Komponen</th>
                                <th width="10%" class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="h_table_body" v-for="(data, index) in list_data" :key="data.id + '-' + index">
                                <td class="text-center">{{ index + 1 }}.</td>
                                <td>{{ data.nama_komponen }}</td>
                                <td class="text-center q-gutter-sm">
                                    <q-btn dense round color="warning" icon="edit" @click="selectData(data), mdl_edit = true">
                                        <q-tooltip content-class="bg-amber-7">Edit Data</q-tooltip>
                                    </q-btn>
                                    <q-btn dense round color="negative" icon="delete" @click="mdl_hapus = true, selectData(data)">
                                        <q-tooltip content-class="bg-red-7">Hapus Data</q-tooltip>
                                    </q-btn>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <!-- Paginasi dihapus -->
            </q-card-section>
        </q-card>

        <!-- ===================== MODAL ADD ===================== -->
        <q-dialog v-model="mdl_add" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Tambah Komponen Darah</div>
                </q-card-section>

                <form @submit.prevent="addData()">
                    <q-card-section class="q-pt-none">
                        <br>
                        <div class="row">
                            <div class="col-12 col-md-12 frame_cari">
                                <span class="h_lable">Nama Komponen</span>
                                <q-input v-model="form.nama_komponen" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                        </div>
                    </q-card-section>

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
                    <div class="text-h6 h_modalhead">Edit Komponen Darah</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <br>
                    <div class="row">
                        <div class="col-12 col-md-12 frame_cari">
                            <span class="h_lable">Nama Komponen</span>
                            <q-input v-model="form.nama_komponen" outlined square :dense="true"
                                class="bg-white margin_btn" required />
                        </div>
                    </div>
                </q-card-section>

                <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    <q-btn :loading="btn_edit" color="primary" @click="editData()" label="Simpan" />
                    <q-btn label="Batal" color="negative" v-close-popup />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- ===================== MODAL HAPUS ===================== -->
        <q-dialog v-model="mdl_hapus" persistent>
            <q-card class="mdl-sm">
                <q-card-section class="q-pt-none text-center orageGrad">
                    <form @submit.prevent="removeData()">
                        <br>
                        <img src="img/alert.png" alt="" width="75"> <br>
                        <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI??</span>
                        <br>
                        <br>
                        <q-card-actions align="center">
                            <q-btn label="Batal" size="sm" color="negative" v-close-popup />
                            &nbsp;
                            <q-btn :loading="btn_hapus" type="submit" label="Hapus" size="sm" color="primary"
                                v-close-popup />
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
                id: '',
                nama_komponen: '',
            },
            list_data: [],
            cari_value: "",
            mdl_add: false,
            mdl_edit: false,
            mdl_hapus: false,
            btn_add: false,
            btn_edit: false,
            btn_hapus: false,
        }
    },
    methods: {
        getView: function () {
            this.$store.commit("shoWLoading");
            fetch(this.$store.state.url.KOMPONEN + "view", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({
                    cari_value: this.cari_value,
                })
            })
                .then(res => res.json())
                .then(res_data => {
                    this.list_data = res_data.data;
                    this.$store.commit("hideLoading");
                    console.log(res_data);
                });
        },
        addData: function () {
            this.btn_add = true;
            fetch(this.$store.state.url.KOMPONEN + "addData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(this.form)
            }).then(res_data => {
                this.btn_add = false;
                this.Notify('Sukses Menambah Data', 'primary', 'check_circle_outline');
                this.getView();
                this.mdl_add = false;
                this.resetForm();
            });
        },
        editData: function () {
            this.btn_edit = true;
            fetch(this.$store.state.url.KOMPONEN + "editData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(this.form)
            }).then(res_data => {
                this.btn_edit = false;
                this.Notify('Sukses Merubah Data', 'warning', 'check_circle_outline');
                this.getView();
                this.mdl_edit = false;
                this.resetForm();
            });
        },
        removeData: function () {
            this.btn_hapus = true;
            fetch(this.$store.state.url.KOMPONEN + "removeData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({ id: this.form.id })
            }).then(res_data => {
                this.btn_hapus = false;
                this.Notify('Sukses Menghapus Data', 'negative', 'check_circle_outline');
                this.getView();
                this.mdl_hapus = false;
                this.resetForm();
            });
        },
        selectData: function (data) {
            this.form.id = data.id;
            this.form.nama_komponen = data.nama_komponen;
        },
        resetForm: function () {
            this.form.id = '';
            this.form.nama_komponen = '';
        },
        Notify: function (message, positive, icon) {
            this.$q.notify({
                message: message,
                color: positive,
                icon: icon,
                position: 'top',
                timeout: 500,
            })
        },
        cari_data: function () {
            this.getView();
        },
    },
    mounted() {
        this.getView();
    },
}
</script>