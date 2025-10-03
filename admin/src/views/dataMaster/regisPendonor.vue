<template>
   <div class="about" style="padding:15px">
      <q-card bordered class="my-card">
         <q-card-section class="main2 text-white">
            <div class="row">
               <div class="col-12 col-md-6">
                  <div class="text-h6 h_titleHead">Registrasi Pendonor</div>
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
                        <th width="15%">TTL</th>
                        <th width="15%">Golongan Darah</th>
                        <th width="10%">No HP</th>
                        <th width="10%">username</th>
                        <th width="25%">Aksi</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>

                        <td>{{ data.nama_lengkap }}</td>
                        <td>{{ UMUM.tglConvert(data.tanggal_lahir) }}</td>
                        <td>{{ data.golongan_darah }}</td>
                        <td>{{ data.no_hp }}</td>
                        <td>{{ data.username }}</td>
                        <td class="text-center">
                           <q-btn-group>
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
               <div class="text-h6 h_modalhead">Tambah Pendonor</div>
            </q-card-section>

            <form @submit.prevent="addData()">

               <q-card-section class="q-pt-none">

                  <hr class="hrpagin2">

                  <span class="h_lable">Nama Lengkap</span>
                  <q-input v-model="form.nama_lengkap" outlined square required :dense="true"
                     class="bg-white margin_btn" />

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Tanggal Lahir</span>
                        <q-input v-model="form.tanggal_lahir" type="date" outlined required square :dense="true"
                           class="bg-white margin_btn" />
                     </div>

                     <div class="col-6">
                        <span class="h_lable">Jenis Kelamin</span>
                        <q-select v-model="form.jenis_kelamin" :options="[
                        { label: 'Laki-laki', value: 'L' },
                        { label: 'Perempuan', value: 'P' }
                     ]" outlined emit-value map-options required square :dense="true" class="bg-white margin_btn" />
                     </div>
                  </div>

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Email</span>
                        <q-input v-model="form.email" type="email" outlined square :dense="true"
                           class="bg-white margin_btn" />
                     </div>

                     <div class="col-6">
                        <span class="h_lable">No HP</span>
                        <q-input v-model="form.no_hp" type="tel" outlined square :dense="true"
                           class="bg-white margin_btn" />

                     </div>
                  </div>
                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Golongan Darah</span>
                        <q-select v-model="form.golongan_darah" :options="[
                        { label: 'A', value: 'A' },
                        { label: 'B', value: 'B' },
                        { label: 'AB', value: 'AB' },
                        { label: 'O', value: 'O' }
                     ]" outlined required square emit-value map-options :dense="true" class="bg-white margin_btn" />
                     </div>

                     <div class="col-6">
                        <span class="h_lable">Rhesus *Kosongkan jika tidak tau</span>
                        <q-select v-model="form.rhesus" :options="[
                        { label: '+', value: '+' },
                        { label: '-', value: '-' }
                     ]" outlined square emit-value map-options :dense="true" class="bg-white margin_btn" />

                     </div>
                  </div>



                  <div class="row q-col-gutter-md margin_btn">
                     <div class="col-4">
                        <span class="h_lable">Kabupaten (Optional)</span>
                        <q-select v-model="form.kabupaten_id" :options="kabupatenOptions" outlined square dense
                           emit-value map-options />

                     </div>

                     <div class="col-4">
                        <span class="h_lable">Kecamatan (Optional)</span>
                        <q-select v-model="form.kecamatan_id" :options="kecamatanOptions" outlined square dense
                           emit-value map-options :disable="!form.kabupaten_id" />

                     </div>
                     <div class="col-4">
                        <span class="h_lable">Desa/Kelurahan (Optional)</span>
                        <q-select v-model="form.des_kel_id" :options="deskelOptions" outlined square dense emit-value
                           map-options :disable="!form.kecamatan_id" />
                     </div>
                  </div>


                  <span class="h_lable">Alamat (Optional)</span>
                  <q-input v-model="form.alamat" type="textarea" outlined square :dense="true"
                     class="bg-white margin_btn" />


                  <span class="h_lable">Riwayat Penyakit (Optional)</span>
                  <q-input v-model="form.riwayat_penyakit" type="textarea" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Terakhir Donor (Optional)</span>
                  <q-input v-model="form.terakhir_donor" type="date" outlined square :dense="true"
                     class="bg-white margin_btn" />



                  <span class="h_lable">Foto Profil (Optional)</span>
                  <q-file v-model="form.foto_profil" label="Pilih Foto" accept="image/*" outlined square dense
                     class="bg-white margin_btn" />

                  <span class="h_lable">Dokumen Pendukung (Optional)</span>
                  <q-file v-model="form.dokumen_pendukung" label="Pilih Dokumen" accept=".pdf,application/pdf" outlined
                     square dense class="bg-white margin_btn" />

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

      <!-- ===================== MODAL EDIT ===================== -->
      <q-dialog v-model="mdl_edit" persistent>
         <q-card class="mdl-md">
            <q-card-section class="bg-orange text-white">
               <div class="text-h6 h_modalhead">Edit Pendonor</div>
            </q-card-section>

            <form @submit.prevent="updateData()">

               <q-card-section class="q-pt-none">

                  <hr class="hrpagin2">

                  <span class="h_lable">Nama Lengkap</span>
                  <q-input v-model="form.nama_lengkap" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Tanggal Lahir</span>
                        <q-input v-model="form.tanggal_lahir" type="date" outlined square :dense="true"
                           class="bg-white margin_btn" />
                     </div>

                     <div class="col-6">
                        <span class="h_lable">Jenis Kelamin</span>
                        <q-select v-model="form.jenis_kelamin" :options="[
                        { label: 'Laki-laki', value: 'L' },
                        { label: 'Perempuan', value: 'P' }
                     ]" outlined square :dense="true" class="bg-white margin_btn" />
                     </div>
                  </div>

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Email</span>
                        <q-input v-model="form.email" type="email" outlined square :dense="true"
                           class="bg-white margin_btn" />
                     </div>

                     <div class="col-6">
                        <span class="h_lable">No HP</span>
                        <q-input v-model="form.no_hp" type="tel" outlined square :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                  </div>

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Golongan Darah</span>
                        <q-select v-model="form.golongan_darah" :options="[
                        { label: 'A', value: 'A' },
                        { label: 'B', value: 'B' },
                        { label: 'AB', value: 'AB' },
                        { label: 'O', value: 'O' }
                     ]" outlined square :dense="true" class="bg-white margin_btn" />
                     </div>

                     <div class="col-6">
                        <span class="h_lable">Rhesus *Kosongkan jika tidak tau</span>
                        <q-select v-model="form.rhesus" :options="[
                        { label: '+', value: '+' },
                        { label: '-', value: '-' }
                     ]" outlined square :dense="true" class="bg-white margin_btn" />
                     </div>
                  </div>

                  <div class="row q-col-gutter-md">
                     <div class="col-4">
                        <span class="h_lable">Kabupaten (Optional)</span>
                        <q-select v-model="form.kabupaten_id" :options="kabupatenOptions" outlined square :dense="true"
                           class="bg-white margin_btn" emit-value map-options />
                     </div>

                     <div class="col-4">
                        <span class="h_lable">Kecamatan (Optional)</span>
                        <q-select v-model="form.kecamatan_id" :options="kecamatanOptions" outlined square :dense="true"
                           class="bg-white margin_btn" emit-value map-options />
                     </div>

                     <div class="col-4">
                        <span class="h_lable">Desa/Kelurahan (Optional)</span>
                        <q-select v-model="form.des_kel_id" :options="deskelOptions" outlined square :dense="true"
                           class="bg-white margin_btn" emit-value map-options />
                     </div>
                  </div>

                  <span class="h_lable">Alamat (Optional)</span>
                  <q-input v-model="form.alamat" type="textarea" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Riwayat Penyakit (Optional)</span>
                  <q-input v-model="form.riwayat_penyakit" type="textarea" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Terakhir Donor (Optional)</span>
                  <q-input v-model="form.terakhir_donor" type="date" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Foto Profil (Optional)</span>
                  <q-file v-model="form.foto_profil" label="Pilih Foto" accept="image/*" outlined square dense
                     class="bg-white margin_btn" :clearable="true" />
                  <div v-if="form.foto_profil_url" class="q-mb-md">
                     <img :src="form.foto_profil_url" alt="Foto Profil" style="max-width: 150px; max-height: 150px;" />
                  </div>

                  <span class="h_lable">Dokumen Pendukung (Optional)</span>
                  <q-file v-model="form.dokumen_pendukung" label="Pilih Dokumen" accept=".pdf,application/pdf" outlined
                     square dense class="bg-white margin_btn" :clearable="true" />
                  <div v-if="form.dokumen_pendukung_url" class="q-mb-md">
                     <a :href="form.dokumen_pendukung_url" target="_blank" rel="noopener">Lihat Dokumen Saat Ini</a>
                  </div>
                  <hr class="hrpagin2">

                  <span class="h_lable">Username</span>
                  <q-input v-model="dataku.username" outlined square :dense="true" class="bg-white margin_btn"
                     placeholder="Masukkan username baru jika ingin ubah" />

                  <!-- Opsional: Tambahkan tombol/link untuk buka modal password (saran saya) -->
                  <!-- <div class="q-mt-md text-center">
                     <q-btn flat color="blue" @click="mdl_password = true; selectDataForPassword()"
                        label="Ubah Password" size="sm">
                        <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                           Klik untuk mengubah password pengguna ini
                        </q-tooltip>
                     </q-btn>
                  </div> -->

                  <hr class="hrpagin2">

               </q-card-section>

               <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                  <q-btn :loading="btn_edit" color="warning" type="submit" label="Update" />
                  <q-btn label="Batal" color="negative" v-close-popup />
               </q-card-actions>
            </form>
         </q-card>
      </q-dialog>


      <!-- ================================================= MODAL PASSWORD ================================================ -->
      <!-- ===================== MODAL EDIT PASSWORD ===================== -->
<q-dialog v-model="mdl_password" persistent>
   <q-card class="mdl-md">
      <q-card-section class="main2 text-white">
         <div class="text-h6 h_modalhead">Ubah Password Pendonor</div>
      </q-card-section>

      <form @submit.prevent="editDataPassword()">

         <q-card-section class="q-pt-none">

            <hr class="hrpagin2">

            <span class="h_lable">Password Baru</span>
            <q-input v-model="dataku.password" :type="isPwd ? 'password' : 'text'" outlined square :dense="true"
               class="bg-white margin_btn" placeholder="Minimal 6 karakter" :loading="btn_password" />
            <q-toggle v-model="isPwd" icon="visibility" class="q-pt-none" />

            <span class="h_lable">Konfirmasi Password</span>
            <q-input v-model="dataku.confirmPassword" :type="isPwd2 ? 'password' : 'text'" outlined square :dense="true"
               class="bg-white margin_btn" placeholder="Ulangi password baru" />
            <q-toggle v-model="isPwd2" icon="visibility" class="q-pt-none" />

            <hr class="hrpagin2">

         </q-card-section>

         <q-card-actions class="bg-grey-4 mdl-footer" align="right">
            <q-btn :loading="btn_password" color="primary" type="submit" label="Ubah Password" />
            <q-btn label="Batal" color="negative" v-close-popup @click="resetPasswordForm" />
         </q-card-actions>
      </form>
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
            tanggal_lahir: '',
            jenis_kelamin: '',
            golongan_darah: '',
            rhesus: '',
            kabupaten_id: null,
            kecamatan_id: null,
            des_kel_id: null,
            alamat: '',
            email: '',
            no_hp: '',
            riwayat_penyakit: null,
            terakhir_donor: null,
            foto_profil: null,
            dokumen_pendukung: null,
            foto_profil_url: '',
            dokumen_pendukung_url: '',
            stokdarah_konut: 4,
            bersedia_dipublikasikan: true,
         },
         kabupatenOptions: [],
         kecamatanOptions: [],
         deskelOptions: [],

         mdl_add: false,
         mdl_edit: false,
         mdl_hapus: false,
         btn_add: false,
         btn_edit: false,

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
      }
   },
   computed: {
      file_path() {
         return this.$store.state.url.URL_APP + "uploads/";
      }
   },
   watch: {
      'form.kabupaten_id'(newVal) {
         this.form.kecamatan_id = null;
         this.form.des_kel_id = null;
         this.kecamatanOptions = [];
         this.deskelOptions = [];
         if (newVal) {
            this.loadKecamatan(newVal);
         }
      },
      'form.kecamatan_id'(newVal) {
         this.form.des_kel_id = null;
         this.deskelOptions = [];
         if (newVal) {
            this.loadDeskel(newVal);
         }
      }
   },
   methods: {
      loadKabupaten() {
         fetch(this.$store.state.url.REGIS_DONOR + "kabupaten")
            .then(res => res.json())
            .then(res => {
               if (res.success) {
                  this.kabupatenOptions = res.data.map(item => ({
                     label: item.label,
                     value: item.id
                  }));
               } else {
                  this.$q.notify({ type: 'negative', message: 'Gagal memuat data kabupaten' });
               }
            })
            .catch(() => {
               this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memuat kabupaten' });
            });
      },
      loadKecamatan(kabupatenId) {
         fetch(`${this.$store.state.url.REGIS_DONOR}kecamatan?kabupaten_id=${kabupatenId}`)
            .then(res => res.json())
            .then(res => {
               if (res.success) {
                  this.kecamatanOptions = res.data.map(item => ({
                     label: item.label,
                     value: item.id
                  }));
               } else {
                  this.$q.notify({ type: 'negative', message: 'Gagal memuat data kecamatan' });
               }
            })
            .catch(() => {
               this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memuat kecamatan' });
            });
      },
      loadDeskel(kecamatanId) {
         fetch(`${this.$store.state.url.REGIS_DONOR}deskel?kecamatan_id=${kecamatanId}`)
            .then(res => res.json())
            .then(res => {
               if (res.success) {
                  this.deskelOptions = res.data.map(item => ({
                     label: item.label,
                     value: item.id
                  }));
               } else {
                  this.$q.notify({ type: 'negative', message: 'Gagal memuat data desa/kelurahan' });
               }
            })
            .catch(() => {
               this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memuat desa/kelurahan' });
            });
      },


      getView() {
         const body = {
            page_limit: this.page_limit,
            data_ke: (this.page_first - 1) * this.page_limit,
            cari_value: this.cari_value,
         };

         fetch(this.$store.state.url.REGIS_DONOR + "getview", {
            method: "POST",
            headers: {
               "content-type": "application/json",
               authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify(body)
         })
            .then(res => res.json())
            .then(res_data => {
               if (res_data.success) {
                  this.list_data = res_data.data;
                  this.jml_data = res_data.jml_data;
                  this.total_data = res_data.total_data;
                  this.page_last = Math.ceil(this.total_data / this.page_limit);
               } else {
                  this.$q.notify({ type: "negative", message: res_data.message || "Gagal mengambil data" });
               }
            })
            .catch(err => {
               console.error("Error fetching data:", err);
               this.$q.notify({ type: "negative", message: "Gagal mengambil data pendonor" });
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
            if (!this.dataku.username) {
               this.$q.notify({
                  type: 'negative',
                  message: 'Username wajib diisi!'
               });
               return;
            }

            this.btn_add = true;

            const formData = new FormData();

   
            formData.append('nama_lengkap', this.form.nama_lengkap);
            formData.append('tanggal_lahir', this.form.tanggal_lahir);
            formData.append('jenis_kelamin', this.form.jenis_kelamin);
            formData.append('golongan_darah', this.form.golongan_darah);
            formData.append('rhesus', this.form.rhesus || '');
            formData.append('kabupaten_id', this.form.kabupaten_id || '');
            formData.append('kecamatan_id', this.form.kecamatan_id || '');
            formData.append('des_kel_id', this.form.des_kel_id || '');
            formData.append('alamat', this.form.alamat || '');
            formData.append('email', this.form.email || '');
            formData.append('no_hp', this.form.no_hp || '');
            formData.append('riwayat_penyakit', this.form.riwayat_penyakit || '');
            formData.append('terakhir_donor', this.form.terakhir_donor || '');
            formData.append('stokdarah_konut', this.form.stokdarah_konut || 4);
            formData.append('bersedia_dipublikasikan', 1); 


            formData.append('username', this.dataku.username);
            formData.append('password', this.dataku.password);

            // Append file
            if (this.form.foto_profil && this.form.foto_profil instanceof File) {
               formData.append('foto_profil', this.form.foto_profil);
            }
            if (this.form.dokumen_pendukung && this.form.dokumen_pendukung instanceof File) {
               formData.append('dokumen_pendukung', this.form.dokumen_pendukung);
            }

            const response = await fetch(this.$store.state.url.REGIS_DONOR + "addData", {
               method: 'POST',
               headers: {
                  authorization: "kikensbatara " + localStorage.token
               },
               body: formData
            });

            const result = await response.json();

            if (response.ok && result.success) {
               this.$q.notify({
                  type: 'positive',
                  message: result.message || 'Data pendonor berhasil ditambahkan!'
               });

               this.resetForm();
               this.mdl_add = false;
               this.getView();
            } else {
               throw new Error(result.message || 'Terjadi kesalahan saat menambah data');
            }
         } catch (error) {
            console.error('Error adding data:', error);
            this.$q.notify({
               type: 'negative',
               message: error.message || 'Gagal menambah data pendonor!'
            });
         } finally {
            this.btn_add = false;
         }
      },



     
      // Hapus editModal lama jika ada duplikasi, ganti dengan ini
      editModal(data) {
         console.log('Debug: Data dari backend (cek nama file):', data.foto_profil, data.dokumen_pendukung);  // Debug: Cek apakah string ada

         // Buat objek form baru (jangan spread { ...data } agar tidak salin string ke file field)
         this.form = {
            id: data.id,
            users_id: data.users_id || null,
            nama_lengkap: data.nama_lengkap || '',
            tanggal_lahir: data.tanggal_lahir || '',
            jenis_kelamin: data.jenis_kelamin || '',
            email: data.email || '',
            no_hp: data.no_hp || '',
            golongan_darah: data.golongan_darah || '',
            rhesus: data.rhesus || '',
            kabupaten_id: data.kabupaten_id || null,
            kecamatan_id: data.kecamatan_id || null,
            des_kel_id: data.des_kel_id || null,
            alamat: data.alamat || '',
            riwayat_penyakit: data.riwayat_penyakit || null,
            terakhir_donor: data.terakhir_donor || null,

            
            foto_profil: null, 
            dokumen_pendukung: null, 

            foto_profil_url: data.foto_profil ? (this.file_path + data.foto_profil) : '',
            dokumen_pendukung_url: data.dokumen_pendukung ? (this.file_path + data.dokumen_pendukung) : '',

            stokdarah_konut: data.stokdarah_konut || 4,
            bersedia_dipublikasikan: data.bersedia_dipublikasikan || true,
         };

       
         this.dataku.username = data.username || '';

         if (this.form.kabupaten_id) {
            this.loadKecamatan(this.form.kabupaten_id);
            if (this.form.kecamatan_id) {
               this.loadDeskel(this.form.kecamatan_id);
            }
         }

         this.dataku.password = '';
         this.dataku.confirmPassword = '';

         this.mdl_edit = true; 
      },

      async updateData() {
         this.btn_edit = true;
         try {
   
            if (!this.form.nama_lengkap || !this.form.tanggal_lahir || !this.form.jenis_kelamin || !this.form.golongan_darah) {
               throw new Error('Field wajib (Nama, TTL, Jenis Kelamin, Golongan Darah) harus diisi!');
            }

            if (this.dataku.username && this.dataku.username.length < 3) {
               throw new Error('Username minimal 3 karakter jika diubah!');
            }

            const normalizedTerakhirDonor = this.normalizeDate(this.form.terakhir_donor);
const normalizedTanggalLahir = this.normalizeDate(this.form.tanggal_lahir);


            const payload = {
               id: this.form.id,
               users_id: this.form.users_id,
               nama_lengkap: this.form.nama_lengkap,
               tanggal_lahir: normalizedTanggalLahir,
               jenis_kelamin: this.form.jenis_kelamin,
               email: this.form.email || '',
               no_hp: this.form.no_hp || '',
               golongan_darah: this.form.golongan_darah,
               rhesus: this.form.rhesus || '',
               kabupaten_id: this.form.kabupaten_id || null,
               kecamatan_id: this.form.kecamatan_id || null,
               des_kel_id: this.form.des_kel_id || null,
               alamat: this.form.alamat || '',
               riwayat_penyakit: this.form.riwayat_penyakit || '',
               terakhir_donor: normalizedTerakhirDonor,
               stokdarah_konut: this.form.stokdarah_konut || 4,
               bersedia_dipublikasikan: this.form.bersedia_dipublikasikan ? 1 : 0,
               username: this.dataku.username || '',
            };

            const hasNewFile = (this.form.foto_profil && this.form.foto_profil instanceof File) ||
               (this.form.dokumen_pendukung && this.form.dokumen_pendukung instanceof File);

            let response, result;

            if (hasNewFile) {
               const formData = new FormData();
               for (const key in payload) {
                  formData.append(key, payload[key] || '');
               }
               // Append files jika ada
               if (this.form.foto_profil && this.form.foto_profil instanceof File) {
                  formData.append('foto_profil', this.form.foto_profil);
               }
               if (this.form.dokumen_pendukung && this.form.dokumen_pendukung instanceof File) {
                  formData.append('dokumen_pendukung', this.form.dokumen_pendukung);
               }

               response = await fetch(this.$store.state.url.REGIS_DONOR + "editData", { 
                  method: "POST",
                  headers: {
                     authorization: "kikensbatara " + localStorage.token
                  },
                  body: formData
               });
               result = await response.json();
            } else {
               response = await fetch(this.$store.state.url.REGIS_DONOR + "editData", { 
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
               this.$q.notify({
                  type: "positive",
                  message: result.message || "Data pendonor berhasil diupdate"
               });
              
               this.mdl_edit = false;
               this.getView(); 
               this.resetForm();  
            } else {
               throw new Error(result.message || "Gagal mengupdate data pendonor");
            }
         } catch (error) {
            console.error("Error update data pendonor:", error);
            this.$q.notify({
               type: "negative",
               message: error.message || "Terjadi kesalahan saat update data pendonor"
            });
         } finally {
            this.btn_edit = false;
         }
      },

      resetForm() {
         this.form = {
            id: null,
            users_id: null,
            nama_lengkap: '',
            tanggal_lahir: '',
            jenis_kelamin: '',
            golongan_darah: '',
            rhesus: '',
            kabupaten_id: null,
            kecamatan_id: null,
            des_kel_id: null,
            alamat: '',
            email: '',
            no_hp: '',
            riwayat_penyakit: '',
            terakhir_donor: '',
            foto_profil: null,
            dokumen_pendukung: null,
            foto_profil_url: '',
            dokumen_pendukung_url: '',
            stokdarah_konut: 4,
            bersedia_dipublikasikan: true,
         };
         this.dataku = {
            username: '',
            password: '',
            confirmPassword: ''
         };
         this.kecamatanOptions = [];
         this.deskelOptions = [];
         this.errorMessage = '';
      },


      async hapusData() {
         this.btn_hapus = true;
         try {
            const response = await fetch(this.$store.state.url.REGIS + "removeTenagaMedis", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  authorization: "kikensbatara " + localStorage.token
               },
               body: JSON.stringify({
                  id: this.form.id,        
                  users_id: this.form.users_id 
               })
            });

            const res_data = await response.json();
            this.btn_hapus = false;

            if (response.ok && res_data.success) {
               this.mdl_hapus = false;
               this.getView();
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
            const res = await fetch(this.$store.state.url.REGIS + "editPassword", {
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
               this.mdl_password = false;
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

         if (!this.dataku.password || !this.dataku.confirmPassword) {
            this.errorMessage = "Password dan Confirm Password wajib diisi!";
            return;
         }

         if (this.dataku.password !== this.dataku.confirmPassword) {
            this.errorMessage = "Password dan Confirm Password tidak sama!";
            return;
         }

         try {
            const res = await fetch(this.$store.state.url.REGIS + "editPasswordTenagaMedis", {
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
               this.mdl_password = false; 
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

      normalizeDate(dateStr) {
         if (!dateStr || dateStr === '') return '';
         if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
         if (dateStr.includes('T')) return dateStr.split('T')[0];
         return ''; 
      },

      cari_data() { this.page_first = 1; this.getView(); }
   },
   mounted() {
      this.getView();
      this.loadKabupaten();
   }
}
</script>
