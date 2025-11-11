<template>
   <div class="about" style="padding:15px">
      <q-card bordered class="my-card">
         <q-card-section class="main2 text-white">
            <div class="row">
               <div class="col-12 col-md-6">
                  <div class="text-h6 h_titleHead">Registrasi Admin BDRS</div>
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
            <hr class="hrpagin2" />
            <div class="tbl_responsive">
               <table width="100%">
                  <thead class="h_table_head main2x text-white">
                     <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="20%">Nama Lengkap</th>
                        <th width="15%">NIK</th>
                        <!-- <th width="15%">No STR</th>
                        <th width="15%">Masa Berlaku STR</th> -->
                        <th width="15%">Jabatan Fungsional</th>
                        <th width="10%">No HP</th>
                        <th width="10%">Email</th>
                        <th width="10%">Aksi</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>
                        <td>{{ data.nama_lengkap }}</td>
                        <td>{{ data.nik }}</td>
                        <!-- <td>{{ data.no_str }}</td>
                        <td>{{ UMUM.tglConvert(data.masa_berlaku_str) }}</td> -->
                        <td>{{ data.jabatan_fungsional }}</td>
                        <td>{{ data.no_hp }}</td>
                        <td>{{ data.email || '-' }}</td>
                        <td class="text-center">
                           <q-item-section>
                              <div class="text-white q-gutter-xs text-center">
                                 <q-btn size="12px" dense glossy round icon="settings" class="main1x">
                                    <q-menu>
                                       <q-list dense style="min-width: 100px">
                                          <q-item clickable v-close-popup @click="mdl_lihat = true; selectData(data)">
                                             <q-item-section>Lihat Detail</q-item-section>
                                          </q-item>
                                          <q-separator />
                                          <q-item clickable v-close-popup
                                             @click="mdl_password = true; selectData(data)">
                                             <q-item-section>Edit Password</q-item-section>
                                          </q-item>
                                          <q-separator />
                                          <q-item clickable v-close-popup @click="editModal(data)">
                                             <q-item-section>Edit</q-item-section>
                                          </q-item>
                                          <q-separator />
                                          <q-item clickable v-close-popup @click="mdl_hapus = true; selectData(data)">
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

      <!-- MODAL ADD -->
      <q-dialog v-model="mdl_add" persistent>
         <q-card class="mdl-md">
            <q-card-section class="main2 text-white">
               <div class="text-h6 h_modalhead">Tambah Admin BDRS</div>
            </q-card-section>

            <form @submit.prevent="addData()">
               <q-card-section class="q-pt-none">
                  <hr class="hrpagin2" />

                  <span class="h_lable">Nama Lengkap</span>
                  <q-input v-model="form.nama_lengkap" outlined square required :dense="true"
                     class="bg-white margin_btn" />


                  <span class="h_lable">NIK</span>
                  <q-input v-model="form.nik" outlined required square :dense="true" class="bg-white margin_btn" />

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
                  </div>

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">No HP</span>
                        <q-input v-model="form.no_hp" outlined required square :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                     <div class="col-6">
                        <span class="h_lable">Email</span>
                        <q-input v-model="form.email" type="email" outlined square :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                  </div>

                  <span class="h_lable">Jabatan Fungsional</span>
                  <q-input v-model="form.jabatan_fungsional" outlined required square :dense="true"
                     class="bg-white margin_btn" />

                  <div class="row q-col-gutter-md">
                     <div class="col-4">
                        <span class="h_lable">Foto Profil (jpg/png)</span>
                        <q-file v-model="form.foto_profil" label="Pilih Foto" accept="image/*" outlined square dense
                           required class="bg-white margin_btn" />
                     </div>
                     <div class="col-4">
                        <span class="h_lable">Surat Tugas (pdf)</span>
                        <q-file v-model="form.surat_tugas" label="Pilih PDF" accept=".pdf,application/pdf" outlined
                           square dense required class="bg-white margin_btn" />
                     </div>
                     <div class="col-4">
                        <span class="h_lable">File STR (pdf)</span>
                        <q-file v-model="form.file_str" label="Pilih PDF" accept=".pdf,application/pdf" outlined square
                           dense required class="bg-white margin_btn" />
                     </div>
                  </div>


                  <hr class="hrpagin2" />

                  <span class="h_lable">Username</span>
                  <q-input v-model="dataku.username" outlined square :dense="true" class="bg-white margin_btn" />

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Password</span>
                        <q-input type="password" v-model="dataku.password" outlined square :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                     <div class="col-6">
                        <span class="h_lable">Confirm Password</span>
                        <q-input type="password" v-model="dataku.confirmPassword" outlined square :dense="true"
                           class="bg-white margin_btn" />
                     </div>
                  </div>

                  <hr class="hrpagin2" />
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
            <q-card-section class="bg-orange text-white">
               <div class="text-h6 h_modalhead">Edit Data Admin BDRS</div>
            </q-card-section>

            <form @submit.prevent="editData">
               <q-card-section class="q-pt-none">
                  <hr class="hrpagin2" />

                  <span class="h_lable">Nama Lengkap</span>
                  <q-input v-model="form.nama_lengkap" outlined square :dense="true" class="bg-white margin_btn" />

                  <span class="h_lable">NIK</span>
                  <q-input v-model="form.nik" outlined square :dense="true" class="bg-white margin_btn" />

                  <span class="h_lable">No STR</span>
                  <q-input v-model="form.no_str" outlined square :dense="true" class="bg-white margin_btn" />

                  <span class="h_lable">Masa Berlaku STR</span>
                  <q-input v-model="form.masa_berlaku_str" type="date" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">Jabatan Fungsional</span>
                  <q-input v-model="form.jabatan_fungsional" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">No HP</span>
                  <q-input v-model="form.no_hp" outlined square :dense="true" class="bg-white margin_btn" />

                  <span class="h_lable">Email</span>
                  <q-input v-model="form.email" type="email" outlined square :dense="true"
                     class="bg-white margin_btn" />

                  <div class="row q-col-gutter-md">
                     <div class="col-6">
                        <span class="h_lable">Foto Profil (biarkan kosong jika tidak ingin ganti)</span>
                        <q-file v-model="form.foto_profil" label="Pilih Foto" accept="image/*" outlined square dense
                           class="bg-white margin_btn" :clearable="true" />
                        <div v-if="form.foto_profil_url" class="q-mb-md">
                           <img :src="form.foto_profil_url" alt="Foto Profil"
                              style="max-width: 100px; max-height: 100px;" />
                        </div>
                     </div>
                     <div class="col-6">
                        <span class="h_lable">Surat Tugas (biarkan kosong jika tidak ingin ganti)</span>
                        <q-file v-model="form.surat_tugas" label="Pilih PDF" accept=".pdf,application/pdf" outlined
                           square dense class="bg-white margin_btn" :clearable="true" />
                        <div v-if="form.surat_tugas_url" class="q-mb-md">
                           <a :href="form.surat_tugas_url" target="_blank" rel="noopener">Lihat Surat Tugas Saat Ini</a>
                        </div>
                     </div>
                  </div>

                  <span class="h_lable">File STR (biarkan kosong jika tidak ingin ganti)</span>
                  <q-file v-model="form.file_str" label="Pilih PDF" accept=".pdf,application/pdf" outlined square dense
                     class="bg-white margin_btn" :clearable="true" />
                  <div v-if="form.file_str_url" class="q-mb-md">
                     <a :href="form.file_str_url" target="_blank" rel="noopener">Lihat File STR Saat Ini</a>
                  </div>

                  <hr class="hrpagin2" />

                  <span class="h_lable">Username</span>
                  <q-input v-model="dataku.username" outlined square :dense="true" class="bg-white margin_btn"
                     placeholder="Masukkan username baru jika ingin ubah" />

                  <hr class="hrpagin2" />
               </q-card-section>

               <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                  <q-btn :loading="btn_edit" color="warning" type="submit" label="Update" />
                  <q-btn label="Batal" color="negative" v-close-popup />
               </q-card-actions>
            </form>
         </q-card>
      </q-dialog>

      <!-- MODAL LIHAT DETAIL -->
      <q-dialog v-model="mdl_lihat" persistent>
         <q-card class="mdl-md detail-modal" style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); border-radius: 12px;">
            <q-card-section class="bg-green text-white q-pa-lg" style="border-radius: 12px 12px 0 0;">
               <div class="text-h6 h_modalhead flex items-center q-gutter-sm">
                  <q-icon name="admin_panel_settings" size="24px" />
                  <span>Detail Admin BDRS</span>
               </div>
            </q-card-section>

            <q-card-section class="q-pa-xl">
               <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-6">
                     <div class="text-h6 text-grey-8 q-mb-md q-pa-sm bg-grey-2 rounded"
                        style="border-left: 4px solid #4caf50;">
                        Data Pribadi
                     </div>
                     <div class="q-gutter-y-md">
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="person" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Nama Lengkap</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.nama_lengkap || '-' }}
                              </div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="badge" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">NIK</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.nik || '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="verified_user" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">No STR</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.no_str || '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="event" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Masa Berlaku STR</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{
                        UMUM.tglConvert(lihatData.masa_berlaku_str) || '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="work" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Jabatan Fungsional</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.jabatan_fungsional ||
                        '-' }}</div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div class="col-12 col-md-6">
                     <div class="text-h6 text-grey-8 q-mb-md q-pa-sm bg-grey-2 rounded"
                        style="border-left: 4px solid #4caf50;">
                        Data Kontak & Dokumen
                     </div>
                     <div class="q-gutter-y-md">
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="phone" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">No HP</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.no_hp || '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="email" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Email</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.email || '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="image" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Foto Profil</div>
                              <div v-if="lihatData.foto_profil" class="text-body1 text-weight-bold text-grey-9">
                                 <img :src="file_path + lihatData.foto_profil" alt="Foto Profil"
                                    style="max-width: 100px; max-height: 100px;" />
                              </div>
                              <div v-else class="text-body1 text-grey-6">-</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="assignment" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Surat Tugas</div>
                              <div v-if="lihatData.surat_tugas" class="text-body1 text-weight-bold text-grey-9">
                                 <a :href="file_path + lihatData.surat_tugas" target="_blank" rel="noopener">Lihat Surat
                                    Tugas</a>
                              </div>
                              <div v-else class="text-body1 text-grey-6">-</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="picture_as_pdf" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">File STR</div>
                              <div v-if="lihatData.file_str" class="text-body1 text-weight-bold text-grey-9">
                                 <a :href="file_path + lihatData.file_str" target="_blank" rel="noopener">Lihat File
                                    STR</a>
                              </div>
                              <div v-else class="text-body1 text-grey-6">-</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="account_circle" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Username</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.username || '-' }}</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </q-card-section>

            <q-card-actions align="right" class="bg-grey-2 text-grey-8 q-pa-lg" style="border-radius: 0 0 12px 12px;">
               <q-btn label="Tutup" color="negative" v-close-popup unelevated size="md" />
            </q-card-actions>
         </q-card>
      </q-dialog>

      <!-- MODAL PASSWORD -->
      <q-dialog v-model="mdl_password" persistent>
         <q-card class="mdl-md">
            <q-card-section class="bg-blue">
               <div class="text-h6 h_modalhead text-center">Edit Password</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
               <br />
               <div class="row">
                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable">Password</span>
                     <q-input v-model="dataku.password" type="password" outlined square :dense="true"
                        class="bg-white margin_btn" />
                  </div>

                  <div class="col-12 col-md-12 frame_cari">
                     <span class="h_lable">Confirm Password</span>
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

      <!-- MODAL HAPUS -->
      <q-dialog v-model="mdl_hapus" persistent>
         <q-card class="mdl-sm">
            <q-card-section class="q-pt-none text-center orageGrad">
               <form @submit.prevent="hapusData">
                  <br />
                  <img src="img/alert.png" alt="" width="75" /> <br />
                  <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI??</span>
                  <input type="submit" style="position: absolute; left: -9999px" />
                  <br />
                  <br />

                  <q-btn label="Batal" size="sm" color="negative" v-close-popup />
                  &nbsp;
                  <q-btn type="submit" label="Hapus" size="sm" color="primary" v-close-popup />
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
         form: {
            id: null,
            users_id: null,
            nama_lengkap: '',
            nik: '',
            no_str: '',
            masa_berlaku_str: '',
            jabatan_fungsional: '',
            no_hp: '',
            email: '',
            foto_profil: null,
            foto_profil_url: '',
            surat_tugas: null,
            surat_tugas_url: '',
            file_str: null,
            file_str_url: '',
         },
         mdl_add: false,
         mdl_edit: false,
         mdl_hapus: false,
         btn_add: false,
         btn_edit: false,
         btn_hapus: false,
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
            users_id: null,
            username: '',
            password: '',
            confirmPassword: ''
         },
         errorMessage: '',
         mdl_lihat: false,
         lihatData: {
            id: null,
            users_id: null,
            nama_lengkap: '',
            nik: '',
            no_str: '',
            masa_berlaku_str: '',
            jabatan_fungsional: '',
            no_hp: '',
            email: '',
            foto_profil: '',
            surat_tugas: '',
            file_str: '',
            username: '',
         },
      };
   },
   methods: {
      getView() {
         const body = {
            page_limit: this.page_limit,
            data_ke: (this.page_first - 1) * this.page_limit,
            cari_value: this.cari_value,
         };

         fetch(this.$store.state.url.REGIS_ADMIN_BDRS + "getview", {
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
               this.$q.notify({ type: "negative", message: "Gagal mengambil data admin_bdrs" });
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
            formData.append('nik', this.form.nik);
            formData.append('no_str', this.form.no_str);
            formData.append('masa_berlaku_str', this.form.masa_berlaku_str);
            formData.append('jabatan_fungsional', this.form.jabatan_fungsional);
            formData.append('no_hp', this.form.no_hp);
            formData.append('email', this.form.email);

            if (this.form.foto_profil) {
               formData.append('foto_profil', this.form.foto_profil);
            }
            if (this.form.surat_tugas) {
               formData.append('surat_tugas', this.form.surat_tugas);
            }
            if (this.form.file_str) {
               formData.append('file_str', this.form.file_str);
            }

            formData.append('username', this.dataku.username);
            formData.append('password', this.dataku.password);

            const response = await fetch(this.$store.state.url.REGIS_ADMIN_BDRS + "addAdminBdrs", {
               method: 'POST',
               body: formData,
               // headers tidak perlu content-type karena FormData otomatis mengatur
               headers: {
                  authorization: "kikensbatara " + localStorage.token
               }
            });

            const result = await response.json();

            if (response.ok && result.success) {
               this.$q.notify({
                  type: 'positive',
                  message: result.message || 'Data admin_bdrs berhasil ditambahkan!'
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
               message: error.message || 'Gagal menambah data admin_bdrs!'
            });
         } finally {
            this.btn_add = false;
         }
      },

      resetForm() {
         this.form = {
            nama_lengkap: '',
            nik: '',
            no_str: '',
            masa_berlaku_str: '',
            jabatan_fungsional: '',
            no_hp: '',
            email: '',
            foto_profil: null,
            foto_profil_url: '',
            surat_tugas: null,
            surat_tugas_url: '',
            file_str: null,
            file_str_url: '',
         };
         this.dataku = {
            users_id: null,
            username: '',
            password: '',
            confirmPassword: ''
         };
      },

      async editData() {
         this.btn_edit = true;
         try {
            if (!this.form.nama_lengkap || !this.form.nik || !this.form.no_str || !this.form.masa_berlaku_str || !this.form.jabatan_fungsional) {
               throw new Error('Field wajib (Nama, NIK, No STR, Masa Berlaku STR, Jabatan) harus diisi!');
            }
            if (this.dataku.username && this.dataku.username.length < 6) {
               throw new Error('Username minimal 6 karakter jika diubah!');
            }

            const normalizedSTR = this.normalizeDate(this.form.masa_berlaku_str);

            const payload = {
               id: this.form.id,
               users_id: this.form.users_id,
               nama_lengkap: this.form.nama_lengkap,
               nik: this.form.nik,
               no_str: this.form.no_str,
               masa_berlaku_str: normalizedSTR,
               jabatan_fungsional: this.form.jabatan_fungsional,
               no_hp: this.form.no_hp,
               email: this.form.email,
               username: this.dataku.username || '',
            };

            const hasNewFoto = this.form.foto_profil && this.form.foto_profil instanceof File;
            const hasNewSurat = this.form.surat_tugas && this.form.surat_tugas instanceof File;
            const hasNewFileStr = this.form.file_str && this.form.file_str instanceof File;

            let response, result;

            if (hasNewFoto || hasNewSurat || hasNewFileStr) {
               const formData = new FormData();
               for (const key in payload) {
                  formData.append(key, payload[key] || '');
               }
               if (hasNewFoto) formData.append('foto_profil', this.form.foto_profil);
               if (hasNewSurat) formData.append('surat_tugas', this.form.surat_tugas);
               if (hasNewFileStr) formData.append('file_str', this.form.file_str);

               response = await fetch(this.$store.state.url.REGIS_ADMIN_BDRS + "editAdminBdrs", {
                  method: "POST",
                  headers: {
                     authorization: "kikensbatara " + localStorage.token
                  },
                  body: formData
               });
               result = await response.json();
            } else {
               response = await fetch(this.$store.state.url.REGIS_ADMIN_BDRS + "editAdminBdrs", {
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
            nik: data.nik || '',
            no_str: data.no_str || '',
            masa_berlaku_str: data.masa_berlaku_str || '',
            jabatan_fungsional: data.jabatan_fungsional || '',
            no_hp: data.no_hp || '',
            email: data.email || '',
            foto_profil: null,
            foto_profil_url: data.foto_profil ? (this.file_path + data.foto_profil) : '',
            surat_tugas: null,
            surat_tugas_url: data.surat_tugas ? (this.file_path + data.surat_tugas) : '',
            file_str: null,
            file_str_url: data.file_str ? (this.file_path + data.file_str) : '',
         };
         this.dataku.username = data.username || '';
         this.mdl_edit = true;
      },

      async hapusData() {
         this.btn_hapus = true;
         try {
            const response = await fetch(this.$store.state.url.REGIS_ADMIN_BDRS + "removeAdminBdrs", {
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
            const res = await fetch(this.$store.state.url.REGIS_ADMIN_BDRS + "editPasswordAdminBdrs", {
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

      indexing(idx) {
         return ((this.page_first - 1) * this.page_limit) + idx;
      },

      selectData(data) {
         this.dataku = {
            users_id: data.users_id,
            username: data.username || '',
            password: '',
            confirmPassword: ''
         };
         this.errorMessage = '';
         this.form = {
            id: data.id,
            users_id: data.users_id,
            nama_lengkap: data.nama_lengkap || '',
            nik: data.nik || '',
            no_str: data.no_str || '',
            masa_berlaku_str: data.masa_berlaku_str || '',
            jabatan_fungsional: data.jabatan_fungsional || '',
            no_hp: data.no_hp || '',
            email: data.email || '',
            foto_profil: null,
            foto_profil_url: data.foto_profil ? (this.file_path + data.foto_profil) : '',
            surat_tugas: null,
            surat_tugas_url: data.surat_tugas ? (this.file_path + data.surat_tugas) : '',
            file_str: null,
            file_str_url: data.file_str ? (this.file_path + data.file_str) : '',
         };
         this.lihatData = {
            id: data.id || null,
            users_id: data.users_id || null,
            nama_lengkap: data.nama_lengkap || '',
            nik: data.nik || '',
            no_str: data.no_str || '',
            masa_berlaku_str: data.masa_berlaku_str || '',
            jabatan_fungsional: data.jabatan_fungsional || '',
            no_hp: data.no_hp || '',
            email: data.email || '',
            foto_profil: data.foto_profil || '',
            surat_tugas: data.surat_tugas || '',
            file_str: data.file_str || '',
            username: data.username || '',
         };
      },

      normalizeDate(dateStr) {
         if (!dateStr || dateStr === '') return '';
         if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
         if (dateStr.includes('T')) return dateStr.split('T')[0];
         return '';
      },

      cari_data() {
         this.page_first = 1;
         this.getView();
      }
   },
   mounted() {
      this.getView();
   }
};
</script>