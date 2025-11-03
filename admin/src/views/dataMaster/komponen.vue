<template>
    <div class="about" style="padding:15px">
       <q-card bordered class="my-card">
          <q-card-section class="main2 text-white">
             <div class="row">
                <div class="col-12 col-md-6">
                   <div class="text-h6 h_titleHead">Komponen Darah</div>
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
             <hr class="hrpagin2">
             <div class="tbl_responsive">
                <table width="100%">
                   <thead class="h_table_head main2x text-white">
                      <tr>
                         <th width="5%" class="text-center">No</th>
                         <th width="20%">Nama Komponen</th>
                         <th width="10%" class="text-center">Aksi</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                         <td class="text-center">{{ indexing(index + 1) }}</td>
                         <td>{{ data.nama_komponen }}</td>
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
 
       <!-- ===================== MODAL ADD ===================== -->
       <q-dialog v-model="mdl_add" persistent>
          <q-card class="mdl-md">
             <q-card-section class="main2 text-white">
                <div class="text-h6 h_modalhead">Tambah Masyarakat</div>
             </q-card-section>
 
             <form @submit.prevent="addData()">
 
                <q-card-section class="q-pt-none">
 
                   <hr class="hrpagin2">
 
                   <span class="h_lable">Nama Lengkap</span>
                   <q-input v-model="form.nama_lengkap" outlined square required :dense="true"
                      class="bg-white margin_btn" />
 
                   <span class="h_lable">NIK / Nomor Identitas (Opsional, disarankan)</span>
                   <q-input v-model="form.nik" outlined square :dense="true" class="bg-white margin_btn" />
 
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
                         <span class="h_lable">Email (Opsional, disarankan)</span>
                         <q-input v-model="form.email" type="email" outlined square :dense="true"
                            class="bg-white margin_btn" />
                      </div>
 
                      <div class="col-6">
                         <span class="h_lable">No HP (Wajib, verifikasi OTP disarankan)</span>
                         <q-input v-model="form.no_hp" type="tel" outlined square required :dense="true"
                            class="bg-white margin_btn" />
                      </div>
                   </div>
 
                   <div class="row q-col-gutter-md margin_btn">
                      <div class="col-4">
                         <span class="h_lable">Kabupaten (Opsional)</span>
                         <q-select v-model="form.kabupaten_id" :options="kabupatenOptions" outlined square dense
                            emit-value map-options />
                      </div>
 
                      <div class="col-4">
                         <span class="h_lable">Kecamatan (Opsional)</span>
                         <q-select v-model="form.kecamatan_id" :options="kecamatanOptions" outlined square dense
                            emit-value map-options :disable="!form.kabupaten_id" />
                      </div>
                      <div class="col-4">
                         <span class="h_lable">Desa/Kelurahan (Opsional)</span>
                         <q-select v-model="form.des_kel_id" :options="deskelOptions" outlined square dense emit-value
                            map-options :disable="!form.kecamatan_id" />
                      </div>
                   </div>
 
                   <span class="h_lable">Alamat (Opsional sesuai RS)</span>
                   <q-input v-model="form.alamat" type="textarea" outlined square :dense="true"
                      class="bg-white margin_btn" />
 
                   <span class="h_lable">Foto Profil (Opsional)</span>
                   <q-file v-model="form.foto_profil" label="Pilih Foto" accept="image/*" outlined square dense
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
 
       <!-- ===================== MODAL EDIT ===================== -->
       <q-dialog v-model="mdl_edit" persistent>
          <q-card class="mdl-md">
             <q-card-section class="bg-orange text-white">
                <div class="text-h6 h_modalhead">Edit Masyarakat</div>
             </q-card-section>
 
             <form @submit.prevent="updateData()">
 
                <q-card-section class="q-pt-none">
 
                   <hr class="hrpagin2">
 
                   <span class="h_lable">Nama Lengkap</span>
                   <q-input v-model="form.nama_lengkap" outlined square :dense="true" class="bg-white margin_btn"
                      required />
                   <span class="h_lable">NIK / Nomor Identitas (Opsional)</span>
                   <q-input v-model="form.nik" outlined square :dense="true" class="bg-white margin_btn" />
 
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
                      ]" outlined square :dense="true" class="bg-white margin_btn" required />
                      </div>
                   </div>
 
                   <div class="row q-col-gutter-md">
                      <div class="col-6">
                         <span class="h_lable">Email (Opsional)</span>
                         <q-input v-model="form.email" type="email" outlined square :dense="true"
                            class="bg-white margin_btn" />
                      </div>
 
                      <div class="col-6">
                         <span class="h_lable">No HP</span>
                         <q-input v-model="form.no_hp" type="tel" outlined square :dense="true"
                            class="bg-white margin_btn" required />
                      </div>
                   </div>
 
                   <div class="row q-col-gutter-md">
                      <div class="col-4">
                         <span class="h_lable">Kabupaten (Opsional)</span>
                         <q-select v-model="form.kabupaten_id" :options="kabupatenOptions" outlined square :dense="true"
                            class="bg-white margin_btn" emit-value map-options />
                      </div>
 
                      <div class="col-4">
                         <span class="h_lable">Kecamatan (Opsional)</span>
                         <q-select v-model="form.kecamatan_id" :options="kecamatanOptions" outlined square :dense="true"
                            class="bg-white margin_btn" emit-value map-options />
                      </div>
 
                      <div class="col-4">
                         <span class="h_lable">Desa/Kelurahan (Opsional)</span>
                         <q-select v-model="form.des_kel_id" :options="deskelOptions" outlined square :dense="true"
                            class="bg-white margin_btn" emit-value map-options />
                      </div>
                   </div>
 
                   <span class="h_lable">Alamat (Opsional)</span>
                   <q-input v-model="form.alamat" type="textarea" outlined square :dense="true"
                      class="bg-white margin_btn" />
 
                   <span class="h_lable">Foto Profil (Opsional)</span>
                   <q-file v-model="form.foto_profil" label="Pilih Foto" accept="image/*" outlined square dense
                      class="bg-white margin_btn" :clearable="true" />
                   <div v-if="form.foto_profil_url" class="q-mb-md">
                      <img :src="form.foto_profil_url" alt="Foto Profil" style="max-width: 150px; max-height: 150px;" />
                   </div>
 
                   <hr class="hrpagin2">
 
                   <span class="h_lable">Username</span>
                   <q-input v-model="dataku.username" outlined square :dense="true" class="bg-white margin_btn"
                      placeholder="Masukkan username baru jika ingin ubah" />
 
                   <hr class="hrpagin2">
 
                </q-card-section>
 
                <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                   <q-btn :loading="btn_edit" color="warning" type="submit" label="Update" />
                   <q-btn label="Batal" color="negative" v-close-popup />
                </q-card-actions>
             </form>
          </q-card>
       </q-dialog>
 
       <!-- ===================== MODAL EDIT PASSWORD ===================== -->
       <q-dialog v-model="mdl_password" persistent>
          <q-card class="mdl-md">
             <q-card-section class="bg-blue text-white">
                <div class="text-h6 h_modalhead">Ubah Password Masyarakat</div>
             </q-card-section>
 
             <form @submit.prevent="editDataPassword()">
 
                <q-card-section class="q-pt-none">
 
                   <hr class="hrpagin2">
 
                   <span class="h_lable">Password Baru</span>
                   <q-input v-model="dataku.password" :type="isPwd ? 'password' : 'text'" outlined square :dense="true"
                      class="bg-white margin_btn" placeholder="Minimal 6 karakter" :loading="btn_password" />
                   <q-toggle v-model="isPwd" icon="visibility" class="q-pt-none" />
                   <hr>
                   <span class="h_lable">Konfirmasi Password</span>
                   <q-input v-model="dataku.confirmPassword" :type="isPwd2 ? 'password' : 'text'" outlined square
                      :dense="true" class="bg-white margin_btn" placeholder="Ulangi password baru" />
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
 
       <!-- ===================== MODAL HAPUS ===================== -->
       <q-dialog v-model="mdl_hapus" persistent>
          <q-card class="mdl-sm">
             <q-card-section class="q-pt-none text-center orageGrad">
                <form @submit.prevent="hapusData">
                   <br>
                   <img src="img/alert.png" alt="" width="75"> <br>
                   <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI??</span>
                   <br>
                   <br>
 
                   <q-card-actions align="center">
                      <q-btn label="Batal" size="sm" color="negative" v-close-popup @click="resetHapusForm" />
                      &nbsp;
                      <q-btn :loading="btn_hapus" type="submit" label="Hapus" size="sm" color="primary" v-close-popup />
                   </q-card-actions>
                </form>
             </q-card-section>
          </q-card>
       </q-dialog>
 
       <!-- ===================== MODAL LIHAT DETAIL ===================== -->
       <q-dialog v-model="mdl_lihat" persistent>
          <q-card class="mdl-md detail-modal" style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); border-radius: 12px;">
             <q-card-section class="bg-green text-white q-pa-lg" style="border-radius: 12px 12px 0 0;">
                <div class="text-h6 h_modalhead flex items-center q-gutter-sm">
                   <q-icon name="person" size="24px" />
                   <span>Detail Masyarakat</span>
                </div>
             </q-card-section>
             <div class="col-12 text-center q-mb-xs">
                <div v-if="lihatData.foto_profil" class="q-pa-md">
                   <img :src="file_path + lihatData.foto_profil" alt="Foto Profil Masyarakat"
                      style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);"
                      @error="handleImageError" />
                   <div class="text-caption text-grey-6 q-mt-sm">Foto Profil</div>
                </div>
                <div v-else class="q-pa-md bg-grey-1 rounded"
                   style="width: 200px; height: 200px; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; border: 2px dashed grey-4;">
                   <q-icon name="account_circle_off" size="64px" color="grey-5" />
                   <div class="text-h6 text-grey-6 q-mt-sm">Tidak Ada Foto Profil</div>
                   <div class="text-caption text-grey-7 q-mt-xs">Foto belum diunggah</div>
                </div>
             </div>
 
 
             <q-card-section class="q-pa-md">
                <div class="row q-col-gutter-lg">
                   <div class="col-12 col-md-6">
                      <div class="text-h6 text-grey-8 q-mb-md q-pa-sm bg-grey-2 rounded"
                         style="border-left: 4px solid #4caf50;">
                         Data Pribadi
                      </div>
 
                      <div class="q-gutter-y-md">
                         <div class="row items-start q-gutter-sm detail-field">
                            <q-icon name="person" size="16px" color="green-6" class="q-mt-xs" />
                            <div class="col">
                               <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Nama Lengkap</div>
                               <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.nama_lengkap || '-' }}
                               </div>
                            </div>
                         </div>
 
                         <div class="row items-start q-gutter-sm detail-field">
                            <q-icon name="event" size="16px" color="green-6" class="q-mt-xs" />
                            <div class="col">
                               <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Tanggal Lahir</div>
                               <div class="text-body1 text-weight-bold text-grey-9">{{
                         UMUM.tglConvert(lihatData.tanggal_lahir) ||
                         '-' }}</div>
                            </div>
                         </div>
 
                         <div class="row items-start q-gutter-sm detail-field">
                            <q-icon name="wc" size="16px" color="green-6" class="q-mt-xs" />
                            <div class="col">
                               <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Jenis Kelamin</div>
                               <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.jenis_kelamin === 'L' ?
                         'Laki-laki' : lihatData.jenis_kelamin === 'P' ? 'Perempuan' : '-' }}</div>
                            </div>
                         </div>
 
                         <div class="row items-start q-gutter-sm detail-field" v-if="lihatData.nik">
                            <q-icon name="card_membership" size="16px" color="green-6" class="q-mt-xs" />
                            <div class="col">
                               <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">NIK / Nomor Identitas
                               </div>
                               <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.nik }}</div>
                            </div>
                         </div>
                      </div>
                   </div>
 
                   <div class="col-12 col-md-6">
                      <div class="text-h6 text-grey-8 q-mb-md q-pa-sm bg-grey-2 rounded"
                         style="border-left: 4px solid #4caf50;">
                         Data Kontak & Lokasi
                      </div>
                      <div class="q-gutter-y-md">
                         <div class="row items-start q-gutter-sm detail-field">
                            <q-icon name="email" size="16px" color="green-6" class="q-mt-xs" />
                            <div class="col">
                               <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Email</div>
                               <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.email || '-' }}</div>
                            </div>
                         </div>
 
                         <div class="row items-start q-gutter-sm detail-field">
                            <q-icon name="phone" size="16px" color="green-6" class="q-mt-xs" />
                            <div class="col">
                               <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">No HP</div>
                               <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.no_hp || '-' }}</div>
                            </div>
                         </div>
 
                         <div class="row items-start q-gutter-sm detail-field">
                            <q-icon name="location_on" size="16px" color="green-6" class="q-mt-xs" />
                            <div class="col">
                               <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Alamat Lengkap</div>
                               <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.alamat || '-' }}</div>
                            </div>
                         </div>
 
                         <div class="row items-start q-gutter-sm detail-field">
                            <q-icon name="map" size="16px" color="green-6" class="q-mt-xs" />
                            <div class="col">
                               <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Lokasi</div>
                               <div class="text-body1 text-weight-bold text-grey-9">
                                  {{ [lihatData.nama_kabupaten, lihatData.nama_kecamatan,
                      lihatData.nama_des_kel].filter(Boolean).join(', ') || '-' }}
                               </div>
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
    </div>
 
 </template>
 
 <script>
 import UMUM from "../../library/umum.js";
 export default {
    data() {
       return {
          UMUM: UMUM,
          isPwd: true,
          isPwd2: true,
          btn_password: false,
 
          form: {
             id: null,
             users_id: null,
             nama_lengkap: '',
             nik: '',
             tanggal_lahir: '',
             jenis_kelamin: '',
             kabupaten_id: null,
             kecamatan_id: null,
             des_kel_id: null,
             alamat: '',
             email: '',
             no_hp: '',
             foto_profil: null,
             foto_profil_url: '',
          },
          kabupatenOptions: [],
          kecamatanOptions: [],
          deskelOptions: [],
 
          mdl_add: false,
          mdl_edit: false,
          mdl_hapus: false,
          btn_add: false,
          btn_edit: false,
          btn_hapus: false,
 
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
             tanggal_lahir: '',
             jenis_kelamin: '',
             nik: '',
             email: '',
             no_hp: '',
             alamat: '',
             nama_kabupaten: '',
             nama_kecamatan: '',
             nama_des_kel: '',
             foto_profil: '',
             username: '',
             users_id: '',
             id: '',
          },
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
          fetch(this.$store.state.url.REGIS_MASYARAKAT + "kabupaten")
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
          fetch(`${this.$store.state.url.REGIS_MASYARAKAT}kecamatan?kabupaten_id=${kabupatenId}`)
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
          fetch(`${this.$store.state.url.REGIS_MASYARAKAT}deskel?kecamatan_id=${kecamatanId}`)
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
 
          fetch(this.$store.state.url.REGIS_MASYARAKAT + "getview", {
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
                this.$q.notify({ type: "negative", message: "Gagal mengambil data masyarakat" });
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
             if (!this.form.nama_lengkap || !this.form.tanggal_lahir || !this.form.jenis_kelamin || !this.form.no_hp) {
                this.$q.notify({
                   type: 'negative',
                   message: 'Field wajib (Nama, Tanggal Lahir, Jenis Kelamin, No HP) harus diisi!'
                });
                return;
             }
 
             this.btn_add = true;
 
             const formData = new FormData();
             formData.append('nama_lengkap', this.form.nama_lengkap);
             formData.append('nik', this.form.nik || '');
             formData.append('tanggal_lahir', this.form.tanggal_lahir);
             formData.append('jenis_kelamin', this.form.jenis_kelamin);
             formData.append('kabupaten_id', this.form.kabupaten_id || '');
             formData.append('kecamatan_id', this.form.kecamatan_id || '');
             formData.append('des_kel_id', this.form.des_kel_id || '');
             formData.append('alamat', this.form.alamat || '');
             formData.append('email', this.form.email || '');
             formData.append('no_hp', this.form.no_hp);
 
             formData.append('username', this.dataku.username);
             formData.append('password', this.dataku.password);
 
             // Append file
             if (this.form.foto_profil && this.form.foto_profil instanceof File) {
                formData.append('foto_profil', this.form.foto_profil);
             }
 
             const response = await fetch(this.$store.state.url.REGIS_MASYARAKAT + "addData", {
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
                   message: result.message || 'Data masyarakat berhasil ditambahkan!'
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
                message: error.message || 'Gagal menambah data masyarakat!'
             });
          } finally {
             this.btn_add = false;
          }
       },
 
       editModal(data) {
          this.form = {
             id: data.id,
             users_id: data.users_id || null,
             nama_lengkap: data.nama_lengkap || '',
             nik: data.nik || '',
             tanggal_lahir: data.tanggal_lahir || '',
             jenis_kelamin: data.jenis_kelamin || '',
             email: data.email || '',
             no_hp: data.no_hp || '',
             kabupaten_id: data.kabupaten_id || null,
             kecamatan_id: data.kecamatan_id || null,
             des_kel_id: data.des_kel_id || null,
             alamat: data.alamat || '',
             foto_profil: null,
             foto_profil_url: data.foto_profil ? (this.file_path + data.foto_profil) : '',
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
             if (!this.form.nama_lengkap || !this.form.tanggal_lahir || !this.form.jenis_kelamin || !this.form.no_hp) {
                throw new Error('Field wajib (Nama, TTL, Jenis Kelamin, No HP) harus diisi!');
             }
             if (this.dataku.username && this.dataku.username.length < 6) {
                throw new Error('Username minimal 6 karakter jika diubah!');
             }
             if (this.form.nik && this.form.nik.length < 16) {
                throw new Error('NIK harus berjumlah 16 angka!');
             }
             const normalizedTanggalLahir = this.normalizeDate(this.form.tanggal_lahir);
             const payload = {
                id: this.form.id,
                users_id: this.form.users_id,
                nama_lengkap: this.form.nama_lengkap,
                nik: this.form.nik || '',
                tanggal_lahir: normalizedTanggalLahir,
                jenis_kelamin: this.form.jenis_kelamin,
                email: this.form.email || '',
                no_hp: this.form.no_hp,
                kabupaten_id: this.form.kabupaten_id || null,
                kecamatan_id: this.form.kecamatan_id || null,
                des_kel_id: this.form.des_kel_id || null,
                alamat: this.form.alamat || '',
                username: this.dataku.username || '',
             };
 
             const hasNewFile = (this.form.foto_profil && this.form.foto_profil instanceof File);
 
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
 
                response = await fetch(this.$store.state.url.REGIS_MASYARAKAT + "editData", {
                   method: "POST",
                   headers: {
                      authorization: "kikensbatara " + localStorage.token
                   },
                   body: formData
                });
                result = await response.json();
             } else {
                response = await fetch(this.$store.state.url.REGIS_MASYARAKAT + "editData", {
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
                   message: result.message || "Data masyarakat berhasil diupdate"
                });
 
                this.mdl_edit = false;
                this.getView();
                this.resetForm();
             } else {
                throw new Error(result.message || "Gagal mengupdate data masyarakat");
             }
          } catch (error) {
             console.error("Error update data masyarakat:", error);
             this.$q.notify({
                type: "negative",
                message: error.message || "Terjadi kesalahan saat update data masyarakat"
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
             nik: '',
             tanggal_lahir: '',
             jenis_kelamin: '',
             kabupaten_id: null,
             kecamatan_id: null,
             des_kel_id: null,
             alamat: '',
             email: '',
             no_hp: '',
             foto_profil: null,
             foto_profil_url: '',
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
          // Validasi ID wajib
          if (!this.form.id || !this.form.users_id) {
             this.$q.notify({
                type: 'negative',
                message: 'Data tidak valid. Silakan pilih ulang.'
             });
             this.resetHapusForm();
             return;
          }
 
          this.btn_hapus = true;
          try {
             const payload = {
                id: this.form.id,
                users_id: this.form.users_id
             };
 
             const response = await fetch(this.$store.state.url.REGIS_MASYARAKAT + "removeMasyarakat", {
                method: "POST",
                headers: {
                   "Content-Type": "application/json",
                   authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(payload)
             });
 
             const res_data = await response.json();
 
             if (response.ok && res_data.success) {
                this.$q.notify({
                   type: 'positive',
                   message: res_data.message || 'Data masyarakat berhasil dihapus'
                });
                this.mdl_hapus = false;
                this.getView();
                this.resetForm();
             } else {
                throw new Error(res_data.message || 'Gagal menghapus data');
             }
          } catch (error) {
             console.error('Error hapus data:', error);
             this.$q.notify({
                type: 'negative',
                message: error.message || 'Terjadi kesalahan saat menghapus data'
             });
          } finally {
             this.btn_hapus = false;
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
             const res = await fetch(this.$store.state.url.REGIS_MASYARAKAT + "editPasswordMasyarakat", {
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
          this.lihatData = {
             nama_lengkap: data.nama_lengkap || '',
             nik: data.nik || '',
             tanggal_lahir: data.tanggal_lahir || '',
             jenis_kelamin: data.jenis_kelamin || '',
             email: data.email || '',
             no_hp: data.no_hp || '',
             alamat: data.alamat || '',
             nama_kabupaten: data.nama_kabupaten || '',
             nama_kecamatan: data.nama_kecamatan || '',
             nama_des_kel: data.nama_des_kel || '',
             foto_profil: data.foto_profil || '',
             username: data.username || '',
             users_id: data.users_id || '',
             id: data.id || '',
          };
       },
 
       resetPasswordForm() {
          this.dataku.password = '';
          this.dataku.confirmPassword = '';
          this.dataku.users_id = null;
          this.isPwd = true;
          this.isPwd2 = true;
          this.btn_password = false;
          this.mdl_password = false;
       },
 
       resetHapusForm() {
          this.form.id = null;
          this.form.users_id = null;
          this.btn_hapus = false;
          this.mdl_hapus = false;
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
 
       cari_data() {
          this.page_first = 1;
          this.getView();
       },
 
       handleImageError(event) {
          event.target.src = 'path/to/placeholder-image.jpg';  // Ganti dengan URL placeholder default, atau kosongkan src
          // Atau: event.target.style.display = 'none'; untuk sembunyikan img rusak
       },
    },
    mounted() {
       this.getView();
       this.loadKabupaten();
    }
 }
 </script>