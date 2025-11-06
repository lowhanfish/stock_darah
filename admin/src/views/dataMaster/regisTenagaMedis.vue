<template>
   <div class="about" style="padding:15px">
      <q-card bordered class="my-card">
         <q-card-section class="main2 text-white">
            <div class="row">
               <div class="col-12 col-md-6">
                  <div class="text-h6 h_titleHead">Registrasi Tenaga Medis (Ruangan)</div>
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
                        <th width="20%">Nama Ruangan</th>
                        <th width="15%">Nama Penanggung Jawab</th>
                        <th width="10%">username</th>
                        <th width="10%">Aksi</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>

                        <td>{{ data.nama_ruangan }}</td>
                        <td>{{ data.nama_pj }}</td>
                        <td>{{ data.username }}</td>
                        <td class="text-center">
                           <q-item-section>
                              <div class="text-white q-gutter-xs text-center">
                                 <q-btn size="12px" dense glossy round icon="settings" class="main1x">
                                    <q-menu>
                                       <q-list dense style="min-width: 100px">
                                          <q-item clickable v-close-popup @click="mdl_lihat = true, selectData(data)">
                                             <q-item-section>Lihat Detail</q-item-section>
                                          </q-item>
                                          <q-separator />
                                          <q-item clickable v-close-popup
                                             @click="mdl_password = true, selectData(data)">
                                             <q-item-section>Edit Password</q-item-section>
                                          </q-item>
                                          <q-separator />
                                          <q-item clickable v-close-popup @click="editModal(data)">
                                             <q-item-section>Edit</q-item-section>
                                          </q-item>
                                          <q-separator />
                                          <q-item clickable v-close-popup @click="mdl_hapus = true, selectData(data)">
                                             <q-item-section>Hapus</q-item-section>
                                          </q-item>
                                          <q-separator />
                                       </q-list>
                                    </q-menu>
                                 </q-btn>
                              </div>
                           </q-item-section>
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

      <!-- ===================== MODAL ADD (Registrasi Ruangan) ===================== -->
      <q-dialog v-model="mdl_add" persistent>
         <q-card class="mdl-md">
            <q-card-section class="main2 text-white">
               <div class="text-h6 h_modalhead">Registrasi Ruangan</div>
            </q-card-section>

            <form @submit.prevent="addData()">
               <q-card-section class="q-pt-none">
                  <hr class="hrpagin2" />

                  <span class="h_lable">Nama Ruangan</span>
                  <q-input v-model="form.nama_ruangan" outlined square required :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Nama PJ (Penanggung Jawab Ruangan)</span>
                  <q-input v-model="form.nama_pj" outlined square required :dense="true" class="bg-white margin_btn" />

                  <hr class="hrpagin2" />

                  <span class="h_lable">Username</span>
                  <q-input v-model="dataku.username" outlined square required :dense="true"
                     class="bg-white margin_btn" />

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Password</span>
                        <q-input type="password" v-model="dataku.password" outlined square required :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                     <div class="col-6">
                        <span class="h_lable">Confirm Password</span>
                        <q-input type="password" v-model="dataku.confirmPassword" outlined square required :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                  </div>

                  <hr class="hrpagin2" />
               </q-card-section>

               <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                  <q-btn :loading="btn_add" color="primary" type="submit" label="Simpan" />
                  <q-btn label="Batal" color="negative" v-close-popup @click="resetForm()" />
               </q-card-actions>
            </form>
         </q-card>
      </q-dialog>
      <!-- ===================== END MODAL ADD ===================== -->


      <!-- MODAL EDIT RUANGAN -->
      <q-dialog v-model="mdl_edit" persistent>
         <q-card class="mdl-md">
            <q-card-section class="bg-orange text-white">
               <div class="text-h6 h_modalhead">Edit Ruangan</div>
            </q-card-section>

            <form @submit.prevent="editData">
               <q-card-section class="q-pt-none">
                  <hr class="hrpagin2" />

                  <span class="h_lable">Nama Ruangan</span>
                  <q-input v-model="form.nama_ruangan" outlined square required :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Nama PJ (Penanggung Jawab Ruangan)</span>
                  <q-input v-model="form.nama_pj" outlined square required :dense="true" class="bg-white margin_btn" />

                  <hr class="hrpagin2" />

                  <span class="h_lable">Username</span>
                  <q-input v-model="dataku.username" outlined square :dense="true" class="bg-white margin_btn" />

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Password (kosongkan jika tidak ingin ganti)</span>
                        <q-input type="password" v-model="dataku.password" outlined square :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                     <div class="col-6">
                        <span class="h_lable">Confirm Password</span>
                        <q-input type="password" v-model="dataku.confirmPassword" outlined square :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                  </div>

                  <div v-if="errorMessage" class="q-mt-md bg-red text-white q-pa-sm">
                     {{ errorMessage }}
                  </div>
               </q-card-section>

               <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                  <q-btn :loading="btn_edit" color="warning" type="submit" label="Update" />
                  <q-btn label="Batal" color="negative" v-close-popup @click="resetForm()" />
               </q-card-actions>
            </form>
         </q-card>
      </q-dialog>
      <!-- END MODAL EDIT RUANGAN -->


      <q-dialog v-model="mdl_lihat" persistent>
         <q-card class="mdl-md detail-modal" style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); border-radius: 12px;">
            <q-card-section class="bg-green text-white q-pa-lg" style="border-radius: 12px 12px 0 0;">
               <div class="text-h6 h_modalhead flex items-center q-gutter-sm">
                  <q-icon name="medical_services" size="24px" />
                  <span>Detail Tenaga Medis</span>
               </div>
            </q-card-section>

            <q-card-section class="q-pa-xl">
               <div class="row q-col-gutter-lg">
                  <!-- Kolom Kiri: Data Pribadi & Profesi -->
                  <div class="col-12 col-md-6">
                     <div class="text-h6 text-grey-8 q-mb-md q-pa-sm bg-grey-2 rounded"
                        style="border-left: 4px solid #4caf50;">
                        Data Profesi
                     </div>
                     <div class="q-gutter-y-md">
                        <!-- Nama Lengkap -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="person" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Nama Lengkap</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.nama_lengkap || '-' }}
                              </div>
                           </div>
                        </div>

                        <!-- NIP -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="badge" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">NIP</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.nip || '-' }}</div>
                           </div>
                        </div>

                        <!-- Nomor SIP (Surat Izin Praktik) -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="assignment_ind" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Nomor SIP (Surat Izin
                                 Praktik)</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.nomor_induk_profesi ||
                        '-' }}</div>
                           </div>
                        </div>

                        <!-- Jabatan Fungsional -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="work" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Jabatan Fungsional</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.jabatan_fungsional ||
                        '-' }}</div>
                           </div>
                        </div>

                        <!-- No STR -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="verified_user" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">No STR</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.no_str || '-' }}</div>
                           </div>
                        </div>

                        <!-- Masa Berlaku STR -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="event" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Masa Berlaku STR</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{
                        UMUM.tglConvert(lihatData.masa_berlaku_str) || '-' }}</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <!-- Kolom Kanan: Kontak & Lokasi -->
                  <div class="col-12 col-md-6">
                     <div class="text-h6 text-grey-8 q-mb-md q-pa-sm bg-grey-2 rounded"
                        style="border-left: 4px solid #4caf50;">
                        Data Kontak
                     </div>
                     <div class="q-gutter-y-md">
                        <!-- Email -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="email" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Email Aktif</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.email || '-' }}</div>
                           </div>
                        </div>

                        <!-- No HP -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="phone" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">No HP Aktif</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.no_hp || '-' }}</div>
                           </div>
                        </div>

                        <!-- Tempat Kerja -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="business" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Tempat Kerja</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.tempat_kerja || '-' }}
                              </div>
                           </div>
                        </div>

                        <!-- Alamat Praktik -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="location_on" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Alamat Praktik</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.alamat_praktik || '-' }}
                              </div>
                           </div>
                        </div>

                        <!-- Username -->
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="account_circle" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Username</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.username || '-' }}</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <!-- Banner File STR (Full Width di Bawah) -->
                  <div class="col-12 q-mt-xl">
                     <q-separator class="q-mb-md" />
                     <q-banner v-if="lihatData.file_str" dense rounded class="bg-green-1 text-primary"
                        style="border-left: 4px solid #4caf50; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
                        <template v-slot:avatar>
                           <q-icon name="picture_as_pdf" size="20px" color="positive" />
                        </template>
                        <div>
                           <span class="text-weight-bold text-body2">Dokumen File STR Tersedia</span>
                           <div class="text-caption q-mt-xs">Klik tombol di samping untuk membuka dokumen PDF di tab
                              baru.</div>
                        </div>
                        <template v-slot:action>
                           <q-btn color="primary" label="Lihat Dokumen" @click="openFileSTR()" flat dense unelevated
                              size="sm" />
                        </template>
                     </q-banner>
                     <div v-else class="text-center q-pa-lg bg-grey-1 rounded" style="border-left: 4px solid #9e9e9e;">
                        <q-icon name="picture_as_pdf_off" size="32px" color="grey-5" />
                        <div class="text-h6 text-grey-6 q-mt-sm">Tidak Ada File STR</div>
                        <div class="text-caption text-grey-7">Dokumen belum diunggah.</div>
                     </div>
                  </div>
               </div>
            </q-card-section>

            <q-card-actions align="right" class="bg-grey-2 text-grey-8 q-pa-lg" style="border-radius: 0 0 12px 12px;">
               <q-btn label="Tutup" color="negative" v-close-popup unelevated size="md" />
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
            nama_ruangan: '',
            nama_pj: ''
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
            // Validasi sisi-klien
            if (!this.form.nama_ruangan || !this.form.nama_pj || !this.dataku.username || !this.dataku.password || !this.dataku.confirmPassword) {
               this.$q.notify({ type: 'negative', message: 'Semua field wajib diisi!' });
               return;
            }

            if (this.dataku.password !== this.dataku.confirmPassword) {
               this.$q.notify({ type: 'negative', message: 'Password dan konfirmasi tidak sama!' });
               return;
            }

            if (this.dataku.password.length < 6) {
               this.$q.notify({ type: 'negative', message: 'Password minimal 6 karakter!' });
               return;
            }

            if (this.dataku.username.length < 4) {
               this.$q.notify({ type: 'negative', message: 'Username minimal 4 karakter!' });
               return;
            }

            this.btn_add = true;

            // Payload sebagai JSON (bukan FormData)
            const payload = {
               nama_ruangan: this.form.nama_ruangan,
               nama_pj: this.form.nama_pj,
               username: this.dataku.username,
               password: this.dataku.password
            };

            // NOTE: ganti "addTenagaMedis" ke "addRuangan" jika backend Anda pakai nama route itu
            const response = await fetch(this.$store.state.url.REGIS_MEDIS + "addTenagaMedis", {
               method: 'POST',
               headers: {
                  "Content-Type": "application/json",
                  authorization: "kikensbatara " + localStorage.token
               },
               body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok && result.success) {
               this.$q.notify({ type: 'positive', message: result.message || 'Registrasi berhasil!' });
               this.resetForm();
               this.mdl_add = false;
               this.getView();
               this.$emit('data-added');
            } else {
               throw new Error(result.message || 'Gagal registrasi');
            }
         } catch (error) {
            console.error('Error adding data:', error);
            this.$q.notify({ type: 'negative', message: error.message || 'Gagal menambah data!' });
         } finally {
            this.btn_add = false;
         }
      },

      resetForm() {
         this.form = {
            id: null,
            nama_ruangan: '',
            nama_pj: ''
         };
         this.dataku = {
            username: '',
            password: '',
            confirmPassword: ''
         };
         this.errorMessage = '';
      },

      async editData() {
  this.errorMessage = '';
  this.btn_edit = true;

  try {
    // Validasi wajib
    if (!this.form.nama_ruangan || !this.form.nama_pj) {
      throw new Error('Nama Ruangan dan Nama PJ wajib diisi!');
    }

    // Jika username diisi, minimal 4 karakter
    if (this.dataku.username && this.dataku.username.length < 4) {
      throw new Error('Username minimal 4 karakter!');
    }

    // Jika user mengisi password, lakukan validasi password & konfirmasi
    let wantChangePassword = false;
    if (this.dataku.password || this.dataku.confirmPassword) {
      wantChangePassword = true;
      if (this.dataku.password.length < 6) {
        throw new Error('Password minimal 6 karakter!');
      }
      if (this.dataku.password !== this.dataku.confirmPassword) {
        throw new Error('Password dan konfirmasi tidak sama!');
      }
    }

    // Siapkan payload JSON
    const payload = {
      id: this.form.id || '',
      // users_id perlu diset dari editModal ketika dipanggil
      users_id: this.dataku.users_id || '',
      nama_ruangan: this.form.nama_ruangan,
      nama_pj: this.form.nama_pj,
      username: this.dataku.username || ''
    };

    if (wantChangePassword) {
      payload.password = this.dataku.password;
    }

    // NOTE: ganti "EditTenagaMedis" ke "EditRuangan" jika backend Anda pakai nama route itu
    const response = await fetch(this.$store.state.url.REGIS_MEDIS + "EditTenagaMedis", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        authorization: "kikensbatara " + localStorage.token
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      this.$q.notify({ type: 'positive', message: result.message || 'Data berhasil diupdate!' });
      this.mdl_edit = false;
      this.resetForm();
      this.getView();
    } else {
      throw new Error(result.message || 'Gagal mengupdate data!');
    }
  } catch (err) {
    console.error('Error editData:', err);
    this.errorMessage = err.message || 'Terjadi kesalahan saat update';
    this.$q.notify({ type: 'negative', message: this.errorMessage });
  } finally {
    this.btn_edit = false;
  }
},
      editModal(data) {
         this.form = {
            id: data.id || null,
            nama_ruangan: data.nama_ruangan || '',
            nama_pj: data.nama_pj || ''
         };

         this.dataku = {
            users_id: data.users_id || null,
            username: data.username || '',
            password: '',
            confirmPassword: ''
         };

         this.errorMessage = '';
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
               this.mdl_password = false;
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
   }
}
</script>
