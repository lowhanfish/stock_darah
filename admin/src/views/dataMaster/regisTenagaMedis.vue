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
                        <th width="15%">Email</th>
                        <th width="10%">No HP</th>
                        <th width="10%">username</th>
                        <th width="10%">Aksi</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>

                        <td>{{ data.nama_lengkap }}</td>
                        <td>{{ data.no_str }}</td>
                        <td>{{ data.jabatan_fungsional }}</td>
                        <td>{{ data.email }}</td>
                        <td>{{ data.phone }}</td>
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
                  <q-input v-model="form.phone" type="number" outlined square :dense="true"
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

      <!-- ================= MODAL EDIT ================= -->
      <q-dialog v-model="mdl_edit" persistent>
         <q-card class="mdl-md">
            <q-card-section class="bg-orange">
               <div class="text-h6 h_modalhead">Edit Data Perusahaan</div>
            </q-card-section>

            <form @submit.prevent="editData">
               <q-card-section>

                  <!-- ===== Data Perusahaan ===== -->
                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable ">Nama</span>
                     <q-input v-model="form.nama" outlined square :dense="true" class="bg-white margin_btn" />
                  </div>

                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable">Bidang Usaha</span>
                     <select v-model="form.bidang_usaha_id" class="bg-white">
                        <option value="" disabled>Pilih Bidang Usaha</option>
                        <option v-for="item in list_bidang" :key="item.id" :value="item.id">
                           {{ item.uraian }}
                        </option>
                     </select>
                  </div>

                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable ">No Hp</span>
                     <q-input v-model="form.hp" outlined square :dense="true" class="bg-white margin_btn" />
                  </div>

                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable ">Alamat</span>
                     <q-input v-model="form.alamat" outlined square :dense="true" class="bg-white margin_btn" />
                  </div>

                  <!-- ===== Separator ===== -->
                  <hr class="hrpagin2 q-my-md">

                  <!-- ===== Data PIC ===== -->
                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable ">Nama PIC</span>
                     <q-input v-model="form.pic_nama" outlined square :dense="true" class="bg-white margin_btn" />
                  </div>

                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable ">Jabatan PIC</span>
                     <q-input v-model="form.pic_jabatan" outlined square :dense="true" class="bg-white margin_btn" />
                  </div>

                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable ">Email PIC</span>
                     <q-input v-model="form.pic_email" type="email" outlined square :dense="true"
                        class="bg-white margin_btn" />
                  </div>

                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable ">No HP PIC</span>
                     <q-input v-model="form.pic_hp" type="tel" outlined square :dense="true"
                        class="bg-white margin_btn" />
                  </div>

               </q-card-section>

               <q-card-actions align="right" class="bg-grey-4 mdl-footer">
                  <q-btn label="Simpan" type="submit" color="primary" :loading="btn_edit" />
                  <q-btn label="Batal" color="negative" v-close-popup />
               </q-card-actions>
            </form>
         </q-card>
      </q-dialog>


      <!-- ================= MODAL Lihat PIC ================= -->
      <q-dialog v-model="mdl_pic" persistent>
         <q-card class="q-pa-md" style="max-width: 480px; border-radius: 18px; overflow: hidden;">
            <q-card-section class="text-center text-white"
               style="background: linear-gradient(135deg, #1976D2, #42A5F5);">
               <q-avatar size="100px" class="q-mb-sm shadow-2" style="border: 3px solid white;">
                  <img v-if="pic_data?.foto" :src="pic_data.foto" alt="Foto PIC" />
                  <q-icon v-else name="person" size="80px" color="white" />
               </q-avatar>
               <div class="text-h6">{{ pic_data?.nama }}</div>
               <div class="text-subtitle2">{{ pic_data?.jabatan }}</div>
            </q-card-section>
            <q-card-section class="bg-grey-2">
               <q-card flat bordered class="q-pa-sm row items-center">
                  <q-icon name="email" size="22px" class="q-mr-sm text-primary" />
                  <span>{{ pic_data?.email || '-' }}</span>
               </q-card>
               <q-card flat bordered class="q-pa-sm row items-center">
                  <q-icon name="phone" size="22px" class="q-mr-sm text-green" />
                  <span>{{ pic_data?.hp || '-' }}</span>
               </q-card>
               <q-card flat bordered class="q-pa-sm row items-center">
                  <q-icon name="badge" size="22px" class="q-mr-sm text-indigo" />
                  <span>Username: {{ pic_data?.username }}</span>
               </q-card>
            </q-card-section>
            <q-card-actions align="right" class="bg-grey-3">
               <q-btn label="Tutup" flat color="negative" v-close-popup />
            </q-card-actions>
         </q-card>
      </q-dialog>
      <!-- ================= MODAL Lihat PIC ================= -->

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
export default {
   data() {
      return {


         form: {
            nama_lengkap: 'das',
            nip: '123',
            nomor_induk_profesi: '123',
            jabatan_fungsional: 'asd',
            no_str: 'asd',
            masa_berlaku_str: '',
            file_str: null,
            email: 'asd@gmail.com',
            phone: '231',
            tempat_kerja: 'asd',
            alamat_praktik: 'adsad',
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
      }
   },
   methods: {

      getView() {
         const body = {
            page_limit: this.page_limit,
            data_ke: (this.page_first - 1) * this.page_limit,
            cari_value: this.cari_value,
         };

         fetch(this.$store.state.url.REGIS + "getview", {
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
            formData.append('phone', this.form.phone);
            formData.append('tempat_kerja', this.form.tempat_kerja);
            formData.append('alamat_praktik', this.form.alamat_praktik);

            // Append data akun
            formData.append('username', this.dataku.username);
            formData.append('password', this.dataku.password);

            // Append file jika ada
            if (this.form.file_str) {
               formData.append('file_str', this.form.file_str);
            }

            const response = await fetch(this.$store.state.url.REGIS + "addTenagaMedis", {
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
            phone: '',
            tempat_kerja: '',
            alamat_praktik: '',
         };

         this.dataku = {
            username: '',
            password: '',
            confirmPassword: ''
         };
      },
      editData() {
         this.btn_edit = true;
         fetch("/api/perusahaan/edit", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(this.form)
         })
            .then(() => {
               this.btn_edit = false;
               this.mdl_edit = false;
               this.getView();
            });
      },

      selectData(data) {
         this.dataku = {
            users_id: data.users_id,
            password: '',
            confirmPassword: ''
         };
         this.errorMessage = '';

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
            id: data.id // id perusahaan
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
            const res = await fetch(this.$store.state.url.DATA_MITRA + "editPassword", {
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

      editData() {
         this.btn_edit = true;
         fetch(this.$store.state.url.DATA_MITRA + "EditMitra", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify({
               users_id: this.form.users_id,
               perusahaan_id: this.form.id,
               password: this.form.password || "", // optional
               nama: this.form.pic_nama,
               jabatan: this.form.pic_jabatan,
               pic_email: this.form.pic_email,
               pic_hp: this.form.pic_hp,
               perusahaan_nama: this.form.nama,
               bidang_usaha_id: this.form.bidang_usaha_id,
               perusahaan_email: this.form.email,
               perusahaan_hp: this.form.hp,
               alamat: this.form.alamat
            })
         })
            .then(res => res.json())
            .then(res_data => {
               this.btn_edit = false;
               if (res_data.success) {
                  this.mdl_edit = false;
                  this.getView();
                  this.$q.notify({ type: 'positive', message: res_data.message });
               } else {
                  this.$q.notify({ type: 'negative', message: res_data.error || 'Gagal update' });
               }
            })
            .catch(err => {
               this.btn_edit = false;
               this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan' });
            });
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

      hapusData() {
         this.btn_hapus = true;
         fetch(this.$store.state.url.DATA_MITRA + "hapusmitra", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               authorization: "kikensbatara " + localStorage.token
            },
            body: JSON.stringify({
               users_id: this.form.users_id,      // harus ada
               perusahaan_id: this.form.id
            })
         })
            .then(res => res.json())
            .then(res_data => {
               this.btn_hapus = false;
               if (res_data.success) {
                  this.mdl_hapus = false;
                  this.getView(); // refresh tabel
                  this.$q.notify({ type: 'positive', message: res_data.message });
               } else {
                  this.$q.notify({ type: 'negative', message: res_data.error || 'Gagal hapus' });
               }
            })
            .catch(err => {
               this.btn_hapus = false;
               this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan' });
            });
      },

      cari_data() { this.page_first = 1; this.getView(); }
   },
   mounted() {
      this.getView();
   }
}
</script>
