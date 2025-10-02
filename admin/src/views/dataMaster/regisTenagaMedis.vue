<template>
   <div class="about" style="padding:15px">
      <q-card bordered class="my-card">
         <q-card-section class="main2 text-white">
            <div class="row">
               <div class="col-12 col-md-6">
                  <div class="text-h6 h_titleHead">Registrasi Tenaga Medis</div>
                  <!-- <div class="text-subtitle2">Program/Kegiatan</div> -->
               </div>
               <div class="col-12 col-md-2"></div>
               <div class="col-12 col-md-4">
                  <div class="row">
                     <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true" class="bg-white"
                        style="width:90%" />
                     <q-btn glossy class="main1x" @click="mdl_add = true" dense flat icon="add" style="width:10%">
                        <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                           Click untuk menambah data
                        </q-tooltip>
                     </q-btn>
                  </div>

               </div>
            </div>
         </q-card-section>

         <q-separator dark inset />

         <q-card-section>
            <!-- <hr class="hrpagin2"> -->


            <hr class="hrpagin2">
            <div class="tbl_responsive">
               <table width="100%">
                  <thead class="h_table_head main2x text-white">
                     <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="20%">Nama Lengkap</th>
                        <th width="15%">No STR</th>
                        <th width="15%">Jabatan</th>
                        <th width="10%">No HP</th>
                        <th width="10%">username</th>
                        <th width="25%">Aksi</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>

                        <td>{{ data.nama_lengkap }}</td>
                        <td>{{ data.no_str }}</td>
                        <td>{{ data.jabatan_fungsional }}</td>
                        <td>{{ data.no_hp }}</td>
                        <td>{{ data.username }}</td>
                        <td class="text-center">
                           <q-btn-group>
                              <q-btn @click="mdl_lihat = true, selectData(data)" glossy color="green" icon="search"
                                 class="tbl_btn">
                                 <q-tooltip content-class="bg-green-9" content-style="font-size: 13px">
                                    Click untuk melihat detil pengguna ini
                                 </q-tooltip>
                              </q-btn>
                              <q-btn @click="mdl_password = true, selectData(data)" glossy color="blue" icon="vpn_key"
                                 class="tbl_btn">
                                 <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                                    Click untuk mengubah password pengguna ini
                                 </q-tooltip>
                              </q-btn>
                              <q-btn @click="editModal(data)" glossy color="orange" icon="create" class="tbl_btn">
                                 <q-tooltip content-class="bg-orange-9" content-style="font-size: 13px">
                                    Click untuk mengubah data ini
                                 </q-tooltip>
                              </q-btn>
                              <q-btn @click="mdl_hapus = true, selectData(data)" glossy color="negative"
                                 icon="delete_forever" class="tbl_btn">
                                 <q-tooltip content-class="bg-red" content-style="font-size: 13px">
                                    Click untuk menghapus data ini
                                 </q-tooltip>
                              </q-btn>
                           </q-btn-group>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>

            <div class="flex flex-center q-mt-md">
               <q-pagination v-model="page_first" :max="page_last" @update:model-value="getView()" color="grey-6"
                  :max-pages="4" :direction-links="true" :boundary-links="true" />
            </div>
         </q-card-section>
      </q-card>

      <!-- ===================== MODAL ADD ===================== -->
      <q-dialog v-model="mdl_add" persistent>
         <q-card class="mdl-md">
            <q-card-section class="main2 text-white">
               <div class="text-h6 h_modalhead">Tambah Tenaga Medis</div>
            </q-card-section>

            <form @submit.prevent="addData()">

               <q-card-section class="q-pt-none">

                  <hr class="hrpagin2">

                  <span class="h_lable">Nama Lengkap</span>
                  <q-input v-model="form.nama_lengkap" outlined square required :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">NIP</span>
                  <q-input v-model="form.nip" type="number" outlined required square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Nomor Induk Profesi</span>
                  <q-input v-model="form.nomor_induk_profesi" type="number" outlined required square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Jabatan Fungsional</span>
                  <q-input v-model="form.jabatan_fungsional" outlined required square :dense="true"
                     class="bg-white margin_btn" />


                  <div class="row q-col-gutter-md">

                     <div class="col-6">

                        <span class="h_lable">No STR</span>
                        <q-input v-model="form.no_str" outlined required square :dense="true"
                           class="bg-white margin_btn" />
                     </div>

                     <div class="col-6">
                        <span class="h_lable">Masa Berlaku STR</span>
                        <q-input v-model="form.masa_berlaku_str" type="date" outlined required square :dense="true"
                           class="bg-white margin_btn" />
                     </div>

                     <div class="col-12">
                        <span class="h_lable">FILE STR</span>
                        <q-file v-model="form.file_str" label="Pilih PDF" accept=".pdf,application/pdf" outlined square
                           dense required class="bg-white margin_btn" :rules="[
                        val => !!val || 'Foto kegiatan wajib diisi'
                     ]" />
                     </div>
                  </div>

                  <span class="h_lable ">Email Aktif</span>
                  <q-input v-model="form.email" type="email" outlined square :dense="true"
                     class="bg-white margin_btn" />
                  <span class="h_lable ">No HP Aktif</span>
                  <q-input v-model="form.no_hp" type="number" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable ">Tempat Kerja</span>
                  <q-input v-model="form.tempat_kerja" outlined square :dense="true" class="bg-white margin_btn" />
                  <span class="h_lable ">Alamat</span>
                  <q-input v-model="form.alamat_praktik" type="textarea" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <hr class="hrpagin2">

                  <span class="h_lable ">Username</span>
                  <q-input v-model="dataku.username" outlined square :dense="true" class="bg-white margin_btn" />


                  <span class="h_lable ">Password</span>
                  <q-input type="password" v-model="dataku.password" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable ">Confirm Password</span>
                  <q-input type="password" v-model="dataku.confirmPassword" outlined square :dense="true"
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
      <!-- ===================== MODAL ADD ===================== -->

      <!-- ================= MODAL EDIT TENAGA MEDIS ================= -->
      <q-dialog v-model="mdl_edit" persistent>
         <q-card class="mdl-md">
            <q-card-section class="bg-orange">
               <div class="text-h6 h_modalhead">Edit Data Tenaga Medis</div>
            </q-card-section>

            <form @submit.prevent="editData">
               <q-card-section>

                  <span class="h_lable">Nama Lengkap</span>
                  <q-input v-model="form.nama_lengkap" outlined square required :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">NIP</span>
                  <q-input v-model="form.nip" type="number" outlined required square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Nomor Induk Profesi</span>
                  <q-input v-model="form.nomor_induk_profesi" type="number" outlined required square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Jabatan Fungsional</span>
                  <q-input v-model="form.jabatan_fungsional" outlined required square :dense="true"
                     class="bg-white margin_btn" />

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">No STR</span>
                        <q-input v-model="form.no_str" outlined required square :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                     <div class="col-6">
                        <span class="h_lable">Masa Berlaku STR</span>
                        <q-input v-model="form.masa_berlaku_str" type="date" outlined required square :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                     <div class="col-12">
                        <span class="h_lable">FILE STR (biarkan kosong jika tidak ingin ganti)</span>
                        <q-file v-model="form.file_str" label="Pilih PDF" accept=".pdf,application/pdf" outlined square
                           dense class="bg-white margin_btn" />
                     </div>
                  </div>

                  <span class="h_lable">Email Aktif</span>
                  <q-input v-model="form.email" type="email" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">No HP Aktif</span>
                  <q-input v-model="form.no_hp" type="number" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Tempat Kerja</span>
                  <q-input v-model="form.tempat_kerja" outlined square :dense="true" class="bg-white margin_btn" />

                  <span class="h_lable">Alamat Praktik</span>
                  <q-input v-model="form.alamat_praktik" type="textarea" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <hr class="hrpagin2" />

                  <span class="h_lable">Username</span>
                  <q-input v-model="dataku.username" outlined square :dense="true" class="bg-white margin_btn" />

               </q-card-section>

               <q-card-actions align="right" class="bg-grey-4 mdl-footer">
                  <q-btn label="Simpan" type="submit" color="primary" :loading="btn_edit" />
                  <q-btn label="Batal" color="negative" v-close-popup />
               </q-card-actions>
            </form>
         </q-card>
      </q-dialog>


      <q-dialog v-model="mdl_lihat" persistent>
         <q-card class="mdl-md"> <q-card-section class="bg-green text-white">
               <div class="text-h6 h_modalhead">Detail Tenaga Medis</div>
            </q-card-section>

            <q-card-section>
               <div class="row q-col-gutter-md">

                  <div class="col-12 col-md-6">
                     <div class="q-gutter-y-sm">
                        <div class="text-caption text-grey-7">Nama Lengkap</div>
                        <div class="text-subtitle1">{{ lihatData.nama_lengkap }}</div>

                        <div class="text-caption text-grey-7">NIP</div>
                        <div class="text-subtitle1">{{ lihatData.nip }}</div>

                        <div class="text-caption text-grey-7">Nomor Induk Profesi</div>
                        <div class="text-subtitle1">{{ lihatData.nomor_induk_profesi }}</div>

                        <div class="text-caption text-grey-7">Jabatan Fungsional</div>
                        <div class="text-subtitle1">{{ lihatData.jabatan_fungsional }}</div>

                        <div class="text-caption text-grey-7">No STR</div>
                        <div class="text-subtitle1">{{ lihatData.no_str }}</div>

                        <div class="text-caption text-grey-7">Masa Berlaku STR</div>
                        <div class="text-subtitle1">{{ UMUM.tglConvert(lihatData.masa_berlaku_str) }}</div>
                     </div>
                  </div>

                  <div class="col-12 col-md-6">
                     <div class="q-gutter-y-sm">
                        <div class="text-caption text-grey-7">Email</div>
                        <div class="text-subtitle1">{{ lihatData.email }}</div>

                        <div class="text-caption text-grey-7">No HP</div>
                        <div class="text-subtitle1">{{ lihatData.no_hp }}</div>

                        <div class="text-caption text-grey-7">Tempat Kerja</div>
                        <div class="text-subtitle1">{{ lihatData.tempat_kerja }}</div>

                        <div class="text-caption text-grey-7">Alamat Praktik</div>
                        <div class="text-subtitle1">{{ lihatData.alamat_praktik }}</div>

                        <div class="text-caption text-grey-7">Username</div>
                        <div class="text-subtitle1">{{ lihatData.username }}</div>
                     </div>
                  </div>

                  <div class="col-12 q-pt-lg">
                     <q-banner v-if="lihatData.file_str" dense rounded class="bg-green-1 text-primary">
                        <template v-slot:avatar>
                           <q-icon name="picture_as_pdf" color="positive" />
                        </template>

                        <span class="text-weight-bold">Dokumen File STR Tersedia</span>
                        <span class="text-caption block">Klik tombol di samping untuk melihat dokumen.</span>

                        <template v-slot:action>
                           <q-btn color="primary" label="Lihat Dokumen" @click="openFileSTR()" flat dense />
                        </template>
                     </q-banner>
                  </div>
               </div>
            </q-card-section>

            <q-card-actions align="right" class="bg-grey-2 mdl-footer q-pa-md">
               <q-btn label="Tutup" color="negative" v-close-popup />
            </q-card-actions>
         </q-card>
      </q-dialog>

      <!-- ================================================= MODAL PASSWORD ================================================ -->
      <q-dialog v-model="mdl_password" persistent>
         <q-card class="mdl-md">
            <q-card-section class="bg-blue">
               <div class="text-h6 h_modalhead text-center">Edit Password</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
               <br>
               <div class="row">

                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable ">Password</span>
                     <q-input v-model="dataku.password" type="password" outlined square :dense="true"
                        class="bg-white margin_btn" />
                  </div>

                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable ">Confirm Password</span>
                     <q-input v-model="dataku.confirmPassword" type="password" outlined square :dense="true"
                        class="bg-white margin_btn" />
                  </div>

                  <div class="col-12 col-md-12 frame_cari">
                     <div class="bg-red text-center" v-if="errorMessage" style="padding:2%">
                        <span style="color:white">{{ errorMessage }}</span>
                     </div>
                  </div>

               </div>

            </q-card-section>

            <q-card-actions class="bg-grey-4 mdl-footer" align="right">

               <q-btn color="primary" @click="editDataPassword()" label="Simpan" />
               <q-btn label="Batal" color="negative" v-close-popup />

            </q-card-actions>
         </q-card>
      </q-dialog>
      <!-- ================================================= MODAL PASSWORD ================================================ -->
      <!-- ================================================ MODAL HAPUS ================================================ -->
      <q-dialog v-model="mdl_hapus" persistent>
         <q-card class="mdl-sm ">
            <q-card-section class="q-pt-none text-center orageGrad">
               <form @submit.prevent="hapusData">
                  <br>
                  <img src="img/alert.png" alt="" width="75"> <br>
                  <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI??</span>
                  <input type="submit" style="position: absolute; left: -9999px" />
                  <br>
                  <br>

                  <q-btn label="Batal" size="sm" color="negative" v-close-popup />
                  &nbsp;
                  <q-btn type="submit" label="Hapus" size="sm" color="primary" v-close-popup />

               </form>
            </q-card-section>
         </q-card>
      </q-dialog>
      <!-- ================================================ MODAL HAPUS ================================================ -->


   </div>
</template>


<script>
import UMUM from "../../library/umum.js";
export default {
   data() {
      return {
         UMUM: UMUM,


         form: {
            id: null,
            users_id: null,
            nama_lengkap: '',
            nip: '',
            nomor_induk_profesi: '',
            jabatan_fungsional: '',
            no_str: '',
            masa_berlaku_str: '',
            file_str: null,
            email: '',
            no_hp: '',
            tempat_kerja: '',
            alamat_praktik: '',
         },

         mdl_add: false,
         mdl_edit: false,
         mdl_hapus: false,
         btn_add: false,
         btn_edit: false,
         file_path: this.$store.state.url.URL_APP + "uploads/",

         list_data: [],
         jml_data: 0,
         total_data: 0,
         page_first: 1,
         page_last: 0,
         page_limit: 10,
         cari_value: '',



         mdl_password: false,
         dataku: {
            username: '',
            password: '',
            confirmPassword: ''
         },
         errorMessage: '',

         mdl_lihat: false,
         lihatData: {
            nama_lengkap: '',
            nip: '',
            nomor_induk_profesi: '',
            jabatan_fungsional: '',
            no_str: '',
            masa_berlaku_str: '',
            file_str: '',
            email: '',
            no_hp: '',
            tempat_kerja: '',
            alamat_praktik: '',
            username: '',
         },
      }
   },
   methods: {

      getView() {
         const body = {
            page_limit: this.page_limit,
            data_ke: (this.page_first - 1) * this.page_limit,
            cari_value: this.cari_value,
         };

         fetch(this.$store.state.url.REGIS_MEDIS + "getview", {
            method: "POST",
            headers: {
               "content-type": "application/json",
               authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify(body)
         })
            .then(res => res.json())
            .then(res_data => {
               this.list_data = res_data.data;
               this.jml_data = res_data.jml_data;
               this.total_data = res_data.total_data;
               this.page_last = Math.ceil(this.total_data / this.page_limit);
            })
            .catch(err => {
               console.error("Error fetching data:", err);
               this.$q.notify({ type: "negative", message: "Gagal mengambil data tenaga medis" });
            });
      },


      async addData() {
         try {
            if (this.dataku.password !== this.dataku.confirmPassword) {
               this.$q.notify({
                  type: 'negative',
                  message: 'Password dan konfirmasi password tidak sama!'
               });
               return;
            }
            if (this.dataku.password.length < 6) {
               this.$q.notify({
                  type: 'negative',
                  message: 'Password minimal 6 karakter!'
               });
               return;
            }

            this.btn_add = true;

            const formData = new FormData();

            formData.append('nama_lengkap', this.form.nama_lengkap);
            formData.append('nip', this.form.nip);
            formData.append('nomor_induk_profesi', this.form.nomor_induk_profesi);
            formData.append('jabatan_fungsional', this.form.jabatan_fungsional);
            formData.append('no_str', this.form.no_str);
            formData.append('masa_berlaku_str', this.form.masa_berlaku_str);
            formData.append('email', this.form.email);
            formData.append('no_hp', this.form.no_hp);
            formData.append('tempat_kerja', this.form.tempat_kerja);
            formData.append('alamat_praktik', this.form.alamat_praktik);

            // Append data akun
            formData.append('username', this.dataku.username);
            formData.append('password', this.dataku.password);

            // Append file jika ada
            if (this.form.file_str) {
               formData.append('file_str', this.form.file_str);
            }

            const response = await fetch(this.$store.state.url.REGIS_MEDIS + "addTenagaMedis", {
               method: 'POST',
               body: formData,
               //          headers: {
               //     "content-type": "application/json",
               //     authorization: "kikensbatara " + localStorage.token
               //   },

            });

            const result = await response.json();

            if (response.ok && result.success) {
               this.$q.notify({
                  type: 'positive',
                  message: result.message || 'Data tenaga medis berhasil ditambahkan!'
               });

               this.resetForm();
               this.mdl_add = false;
               this.getView();
               this.$emit('data-added');

            } else {
               throw new Error(result.message || 'Terjadi kesalahan saat menambah data');
            }

         } catch (error) {
            console.error('Error adding data:', error);
            this.$q.notify({
               type: 'negative',
               message: error.message || 'Gagal menambah data tenaga medis!'
            });
         } finally {
            // Reset loading state
            this.btn_add = false;
         }
      },

      resetForm() {
         this.form = {
            nama_lengkap: '',
            nip: '',
            nomor_induk_profesi: '',
            jabatan_fungsional: '',
            no_str: '',
            masa_berlaku_str: '',
            file_str: null,
            email: '',
            no_hp: '',
            tempat_kerja: '',
            alamat_praktik: '',
         };

         this.dataku = {
            username: '',
            password: '',
            confirmPassword: ''
         };
      },

      async editData() {
         this.btn_edit = true;
         try {
            // Siapkan data yang akan dikirim ke backend
            const payload = {
               id: this.form.id, // id tenaga medis
               users_id: this.form.users_id,
               nama_lengkap: this.form.nama_lengkap,
               nip: this.form.nip,
               nomor_induk_profesi: this.form.nomor_induk_profesi,
               jabatan_fungsional: this.form.jabatan_fungsional,
               no_str: this.form.no_str,
               masa_berlaku_str: this.form.masa_berlaku_str,
               email: this.form.email,
               no_hp: this.form.no_hp,
               tempat_kerja: this.form.tempat_kerja,
               alamat_praktik: this.form.alamat_praktik,
               username: this.dataku.username || '', // jika username bisa diedit
               // Jika ingin update password di sini, bisa ditambahkan
               // password: this.dataku.password || undefined,
            };

            // Jika ada file baru yang diupload, gunakan FormData
            let response, result;
            if (this.form.file_str && this.form.file_str instanceof File) {
               const formData = new FormData();
               for (const key in payload) {
                  formData.append(key, payload[key]);
               }
               formData.append('file_str', this.form.file_str);

               response = await fetch(this.$store.state.url.REGIS_MEDIS + "EditTenagaMedis", {
                  method: "POST",
                  headers: {
                     authorization: "kikensbatara " + localStorage.token
                  },
                  body: formData
               });
               result = await response.json();
            } else {
               // Jika tidak ada file baru, kirim JSON biasa
               response = await fetch(this.$store.state.url.REGIS_MEDIS + "EditTenagaMedis", {
                  method: "POST",
                  headers: {
                     "Content-Type": "application/json",
                     authorization: "kikensbatara " + localStorage.token
                  },
                  body: JSON.stringify(payload)
               });
               result = await response.json();
            }

            if (response.ok && result.success) {
               this.$q.notify({ type: "positive", message: result.message || "Data berhasil diupdate" });
               this.mdl_edit = false;
               this.getView();
            } else {
               throw new Error(result.message || "Gagal mengupdate data");
            }
         } catch (error) {
            console.error("Error edit data:", error);
            this.$q.notify({ type: "negative", message: error.message || "Terjadi kesalahan saat update data" });
         } finally {
            this.btn_edit = false;
         }
      },

      editModal(data) {
         this.form = {
            id: data.id,
            users_id: data.users_id,
            nama_lengkap: data.nama_lengkap || '',
            nip: data.nip || '',
            nomor_induk_profesi: data.nomor_induk_profesi || '',
            jabatan_fungsional: data.jabatan_fungsional || '',
            no_str: data.no_str || '',
            masa_berlaku_str: data.masa_berlaku_str || '',
            file_str: null, // reset file input, user harus upload ulang jika ingin ganti
            email: data.email || '',
            no_hp: data.no_hp || '',
            tempat_kerja: data.tempat_kerja || '',
            alamat_praktik: data.alamat_praktik || '',
         };
         this.dataku.username = data.username || '';
         this.mdl_edit = true;
      },

      async hapusData() {
         this.btn_hapus = true;
         try {
            const response = await fetch(this.$store.state.url.REGIS_MEDIS + "removeTenagaMedis", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  authorization: "kikensbatara " + localStorage.token
               },
               body: JSON.stringify({
                  id: this.form.id,           // id tenaga medis
                  users_id: this.form.users_id // id user terkait
               })
            });

            const res_data = await response.json();
            this.btn_hapus = false;

            if (response.ok && res_data.success) {
               this.mdl_hapus = false;
               this.getView(); // refresh data
               this.$q.notify({ type: 'positive', message: res_data.message || 'Data berhasil dihapus' });
            } else {
               this.$q.notify({ type: 'negative', message: res_data.message || 'Gagal menghapus data' });
            }
         } catch (error) {
            this.btn_hapus = false;
            this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat menghapus data' });
            console.error('Error hapus data:', error);
         }
      },

      async editDataPassword() {
         this.errorMessage = '';

         // Validasi input password
         if (!this.dataku.password || !this.dataku.confirmPassword) {
            this.errorMessage = "Password dan Confirm Password wajib diisi!";
            return;
         }

         if (this.dataku.password.length < 6) {
            this.errorMessage = "Password minimal 6 karakter!";
            return;
         }

         if (this.dataku.password !== this.dataku.confirmPassword) {
            this.errorMessage = "Password dan Confirm Password tidak sama!";
            return;
         }

         try {
            const res = await fetch(this.$store.state.url.REGIS_MEDIS + "editPassword", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  authorization: "kikensbatara " + localStorage.token
               },
               body: JSON.stringify({
                  users_id: this.dataku.users_id,
                  password: this.dataku.password
               })
            });

            const data = await res.json();

            if (res.ok && data.success) {
               this.$q.notify({ type: "positive", message: data.message || "Password berhasil diubah!" });
               this.mdl_password = false; // tutup modal
               // Reset password fields
               this.dataku.password = '';
               this.dataku.confirmPassword = '';
            } else {
               this.errorMessage = data.message || "Gagal mengubah password!";
            }
         } catch (error) {
            console.error(error);
            this.errorMessage = "Terjadi kesalahan saat mengubah password.";
         }
      },




      selectData(data) {
         this.dataku = {
            users_id: data.users_id,
            password: '',
            confirmPassword: ''
         };
         this.errorMessage = '';
         this.form = {
            ...data,
            users_id: data.users_id,
            id: data.id
         };
      },

      async editDataPassword() {
         this.errorMessage = '';

         // validasi password
         if (!this.dataku.password || !this.dataku.confirmPassword) {
            this.errorMessage = "Password dan Confirm Password wajib diisi!";
            return;
         }

         if (this.dataku.password !== this.dataku.confirmPassword) {
            this.errorMessage = "Password dan Confirm Password tidak sama!";
            return;
         }

         try {
            const res = await fetch(this.$store.state.url.REGIS_MEDIS + "editPasswordTenagaMedis", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  authorization: "kikensbatara " + localStorage.token
               },
               body: JSON.stringify({
                  users_id: this.dataku.users_id,
                  password: this.dataku.password
               })
            });

            const data = await res.json();

            if (data.success) {
               this.$q.notify({ type: "positive", message: "Password berhasil diubah!" });
               this.mdl_password = false; // tutup modal
            } else {
               this.errorMessage = data.message || "Gagal mengubah password!";
            }
         } catch (error) {
            console.error(error);
            this.errorMessage = "Terjadi kesalahan saat mengubah password.";
         }
      },


      indexing(idx) {
         return ((this.page_first - 1) * this.page_limit) + idx;
      },
      editModal(data) {
         this.form = {
            ...data,
            pic_nama: data.nama_pic || '',
            pic_jabatan: data.jabatan || '',
            pic_email: data.email_pic || '',
            pic_hp: data.hp_pic || ''
         };
         this.mdl_edit = true;
      },

      selectData(data) {
         this.lihatData = {
            nama_lengkap: data.nama_lengkap || '',
            nip: data.nip || '',
            nomor_induk_profesi: data.nomor_induk_profesi || '',
            jabatan_fungsional: data.jabatan_fungsional || '',
            no_str: data.no_str || '',
            masa_berlaku_str: data.masa_berlaku_str || '',
            file_str: data.file_str || '',
            email: data.email || '',
            no_hp: data.no_hp || '',
            tempat_kerja: data.tempat_kerja || '',
            alamat_praktik: data.alamat_praktik || '',
            username: data.username || '',
            users_id: data.users_id || '',
            id: data.id || '',
         };
      },
      // Method untuk membuka file STR di tab baru
      openFileSTR() {
         if (this.lihatData.file_str) {
            const url = this.file_path + this.lihatData.file_str;
            window.open(url, '_blank');
         } else {
            this.$q.notify({ type: 'negative', message: 'File STR tidak tersedia' });
         }
      },



      cari_data() { this.page_first = 1; this.getView(); }
   },
   mounted() {
      this.getView();
   }
}
</script>
