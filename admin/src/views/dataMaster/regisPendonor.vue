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
                        <th width="10%">NIK</th>
                        <th width="15%">TTL</th>
                        <th width="10%">Golongan Darah</th>
                        <th width="10%">No HP</th>
                        <th width="10%">Jenis Kelamin</th>
                        <th width="10%" class="text-center">Aksi</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>

                        <td>{{ data.nama_lengkap }}</td>
                        <td>{{ data.nik }}</td>
                        <td>{{ UMUM.tglConvert(data.tanggal_lahir) }}</td>
                        <td>{{ data.golongan_darah }} {{ data.rhesus }}</td>
                        <td>{{ data.no_hp }}</td>
                        <td>{{ data.jenis_kelamin }}</td>
                        <td class="text-center">
                           <q-item-section>
                              <div class="text-white q-gutter-xs text-center">
                                 <q-btn size="12px" dense glossy round icon="settings" class="main1x">
                                    <q-menu>
                                       <q-list dense style="min-width: 100px">
                                          <q-item clickable v-close-popup @click="openRiwayat(data)">
                                             <q-item-section>Riwayat Donor</q-item-section>
                                          </q-item>
                                          <q-separator />

                                          <q-item clickable v-close-popup @click="mdl_lihat = true, selectData(data)">
                                             <q-item-section>Lihat Detail</q-item-section>
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
               <div class="text-h6 h_modalhead">Tambah Pendonor</div>
            </q-card-section>

            <form @submit.prevent="addData()">

               <q-card-section class="q-pt-none">

                  <hr class="hrpagin2">

                  <span class="h_lable">Nama Lengkap</span>
                  <q-input v-model="form.nama_lengkap" outlined square required :dense="true"
                     class="bg-white margin_btn" />

                  <span class="h_lable">NIK</span>
                  <q-input v-model="form.nik" outlined square required :dense="true" class="bg-white margin_btn" />

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
                        <q-input v-model="form.no_hp" type="tel" outlined square :dense="true" required
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
                  <q-input v-model="form.nama_lengkap" outlined square :dense="true" class="bg-white margin_btn" />
                  <span class="h_lable">NIK</span>
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
               
               </q-card-section>

               <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                  <q-btn :loading="btn_edit" color="warning" type="submit" label="Update" />
                  <q-btn label="Batal" color="negative" v-close-popup />
               </q-card-actions>
            </form>
         </q-card>
      </q-dialog>


       <!-- ================================================ MODAL HAPUS ================================================ -->
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

      <!-- ================================================ MODAL HAPUS ================================================ -->

      <q-dialog v-model="mdl_lihat" persistent>
         <q-card class="mdl-md detail-modal" style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12); border-radius: 12px;">
            <q-card-section class="bg-green text-white q-pa-lg" style="border-radius: 12px 12px 0 0;">
               <div class="text-h6 h_modalhead flex items-center q-gutter-sm">
                  <q-icon name="bloodtype" size="24px" />
                  <span>Detail Pendonor</span>
               </div>
            </q-card-section>
            <div class="col-12 text-center q-mb-xs">
               <div v-if="lihatData.foto_profil" class="q-pa-md">
                  <img :src="file_path + lihatData.foto_profil" alt="Foto Profil Pendonor"
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
                        Data Pribadi & Darah
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
                           <q-icon name="event" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Tanggal Lahir</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{
                        UMUM.tglConvert(lihatData.tanggal_lahir) || '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="wc" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Jenis Kelamin</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.jenis_kelamin === 'L' ?
                        'Laki-laki' : lihatData.jenis_kelamin === 'P' ? 'Perempuan' : '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="bloodtype" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Golongan Darah</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.golongan_darah || '-' }}
                              </div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="science" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Rhesus</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.rhesus || '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="calendar_today" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Terakhir Donor</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{
                        UMUM.tglConvert(lihatData.terakhir_donor) || '-' }}</div>
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
                           <q-icon name="email" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Email</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.email || '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="phone" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">No HP</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.no_hp || '-' }}</div>
                           </div>
                        </div>
                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="location_on" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Alamat Lengkap</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.alamat || '-' }}</div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="map" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Lokasi</div>
                              <div class="text-body1 text-weight-bold text-grey-9">
                                 {{ [lihatData.kabupaten_nama, lihatData.kecamatan_nama,
                     lihatData.des_kel_nama].filter(Boolean).join(', ') || '-' }}
                              </div>
                           </div>
                        </div>

                        <div class="row items-start q-gutter-sm detail-field">
                           <q-icon name="local_hospital" size="16px" color="grey-6" class="q-mt-xs" />
                           <div class="col">
                              <div class="text-caption text-grey-7 text-weight-medium q-mb-xs">Riwayat Penyakit</div>
                              <div class="text-body1 text-weight-bold text-grey-9">{{ lihatData.riwayat_penyakit || '-'
                                 }}</div>
                           </div>
                        </div>

                     </div>
                  </div>

                  <div class="col-12 q-mt-xl">
                     <q-separator class="q-mb-md" />
                     <q-banner v-if="lihatData.dokumen_pendukung" dense rounded class="bg-green-1 text-primary"
                        style="border-left: 4px solid #4caf50; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
                        <template v-slot:avatar>
                           <q-icon name="picture_as_pdf" size="20px" color="positive" />
                        </template>
                        <div>
                           <span class="text-weight-bold text-body2">Dokumen Pendukung Tersedia</span>
                           <div class="text-caption q-mt-xs">Klik tombol di samping untuk membuka dokumen PDF di tab
                              baru.</div>
                        </div>
                        <template v-slot:action>
                           <q-btn color="primary" label="Lihat Dokumen" @click="openDokumen()" flat dense unelevated
                              size="sm" />
                        </template>
                     </q-banner>
                     <div v-else class="text-center q-pa-lg bg-grey-1 rounded" style="border-left: 4px solid #9e9e9e;">
                        <q-icon name="picture_as_pdf_off" size="32px" color="grey-5" />
                        <div class="text-h6 text-grey-6 q-mt-sm">Tidak Ada Dokumen Pendukung</div>
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


      <!-- MODAL RIWAYAT DONOR -->
      <q-dialog v-model="mdl_riwayat">
         <q-card class="mdl-md">
            <q-card-section class="main2 text-white">
               <div class="text-h6 h_modalhead">Riwayat Donor - {{ currentPendonor.nama_lengkap || '-' }}</div>
            </q-card-section>

            <q-card-section class="q-pa-lg scroll" style="max-height: 70vh; overflow-y: auto;">
               <div v-if="riwayatLoading" class="row items-center justify-center q-pa-md">
                  <q-spinner-dots size="30px" />
               </div>

               <div v-else class="tbl_responsive q-mb-md">
                  <table width="100%">
                     <tr class="h_table_head main1 text-white ">
                        <th class="text-center" width="5%">No</th>
                        <th>Nama Kegiatan</th>
                        <th width="18%">Tanggal Mulai</th>
                        <th width="18%">Tanggal Selesai</th>
                        <th>Lokasi</th>
                     </tr>

                     <tr v-for="(r, i) in riwayatList" :key="r.jadwal_id || i" class="h_table_body">
                        <td class="text-center">{{ i + 1 }}</td>
                        <td>{{ r.nama_kegiatan || '-' }}</td>
                        <td>{{ UMUM.tglConvert ? UMUM.tglConvert(r.tanggal_mulai) : r.tanggal_mulai || '-' }}</td>
                        <td>{{ UMUM.tglConvert ? UMUM.tglConvert(r.tanggal_selesai) : r.tanggal_selesai || '-' }}</td>
                        <td>{{ r.lokasi || '-' }}</td>
                     </tr>

                     <tr v-if="!riwayatList.length && !riwayatLoading">
                        <td colspan="5" class="text-center text-grey">Belum ada riwayat donor</td>
                     </tr>
                  </table>
               </div>
            </q-card-section>

            <q-separator />
            <q-card-actions class="bg-grey-4 mdl-footer" align="right">
               <q-btn label="Tutup" color="negative" v-close-popup @click="mdl_riwayat = false" />
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

         form: {
            id: null,
            nama_lengkap: '',
            nik: '',
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
         btn_hapus: false,

         list_data: [],
         jml_data: 0,
         total_data: 0,
         page_first: 1,
         page_last: 0,
         page_limit: 10,
         cari_value: '',

         mdl_riwayat: false,
         currentPendonor: {},
         riwayatList: [],
         riwayatLoading: false,


         errorMessage: '',
         mdl_lihat: false,
         lihatData: {
            nama_lengkap: '',
            tanggal_lahir: '',
            jenis_kelamin: '',
            golongan_darah: '',
            rhesus: '',
            email: '',
            no_hp: '',
            alamat: '',
            riwayat_penyakit: '',
            terakhir_donor: '',
            kabupaten_nama: '',
            kecamatan_nama: '',
            des_kel_nama: '',
            foto_profil: '',
            dokumen_pendukung: '',
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

           
           

            this.btn_add = true;

            const formData = new FormData();
            formData.append('nama_lengkap', this.form.nama_lengkap);
            formData.append('nik', this.form.nik);
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

      editModal(data) {
         this.form = {
            id: data.id,
            nama_lengkap: data.nama_lengkap || '',
            nik: data.nik || '',
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


         if (this.form.kabupaten_id) {
            this.loadKecamatan(this.form.kabupaten_id);
            if (this.form.kecamatan_id) {
               this.loadDeskel(this.form.kecamatan_id);
            }
         }

         this.mdl_edit = true;
      },

      async updateData() {
         this.btn_edit = true;
         try {
            if (!this.form.nama_lengkap || !this.form.tanggal_lahir || !this.form.jenis_kelamin || !this.form.golongan_darah) {
               throw new Error('Field wajib (Nama, TTL, Jenis Kelamin, Golongan Darah) harus diisi!');
            }
           
            if (this.form.nik && this.form.nik.length < 16) {
               throw new Error('NIK harus berjumlah 16 angka!');
            }
            const normalizedTerakhirDonor = this.normalizeDate(this.form.terakhir_donor);
            const normalizedTanggalLahir = this.normalizeDate(this.form.tanggal_lahir);
            const payload = {
               id: this.form.id,
               nama_lengkap: this.form.nama_lengkap,
               nik: this.form.nik,
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
            nama_lengkap: '',
            nik: '',
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
       
         this.kecamatanOptions = [];
         this.deskelOptions = [];
         this.errorMessage = '';
      },

      async hapusData() {
         // Validasi ID wajib
         if (!this.form.id ) {
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
             
            };

            const response = await fetch(this.$store.state.url.REGIS_DONOR + "removePendonor", {
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
                  message: res_data.message || 'Data pendonor berhasil dihapus'
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


      
      selectData(data) {
        
         this.errorMessage = '';
         this.form = {
            ...data,
           
            id: data.id
         };
         this.lihatData = {
            nama_lengkap: data.nama_lengkap || '',
            nik: data.nik || '',
            tanggal_lahir: data.tanggal_lahir || '',
            jenis_kelamin: data.jenis_kelamin || '',
            golongan_darah: data.golongan_darah || '',
            rhesus: data.rhesus || '',
            email: data.email || '',
            no_hp: data.no_hp || '',
            alamat: data.alamat || '',
            riwayat_penyakit: data.riwayat_penyakit || '',
            terakhir_donor: data.terakhir_donor || '',
            kabupaten_nama: data.kabupaten_nama || '',  
            kecamatan_nama: data.kecamatan_nama || '',
            des_kel_nama: data.des_kel_nama || '',
            foto_profil: data.foto_profil || '',
            dokumen_pendukung: data.dokumen_pendukung || '',
          
            id: data.id || '',
         };
      },

      resetHapusForm() {
         this.form.id = null;
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

      cari_data() { this.page_first = 1; this.getView(); },
      openFoto() {
         if (this.lihatData.foto_profil) {
            const url = this.file_path + this.lihatData.foto_profil;
            window.open(url, '_blank');
         } else {
            this.$q.notify({ type: 'negative', message: 'Foto tidak tersedia' });
         }
      },
      openDokumen() {
         if (this.lihatData.dokumen_pendukung) {
            const url = this.file_path + this.lihatData.dokumen_pendukung;
            window.open(url, '_blank');
         } else {
            this.$q.notify({ type: 'negative', message: 'Dokumen tidak tersedia' });
         }
      },
      handleImageError(event) {
         event.target.src = 'path/to/placeholder-image.jpg';  // Ganti dengan URL placeholder default, atau kosongkan src
         // Atau: event.target.style.display = 'none'; untuk sembunyikan img rusak
      },

      async openRiwayat(pendonor) {
         this.currentPendonor = pendonor || {};
         this.riwayatList = [];
         this.mdl_riwayat = true;
         this.riwayatLoading = true;

         const pendonorId = pendonor?.id || pendonor?.pendonor_id;
         if (!pendonorId) {
            this.$q.notify({ type: 'negative', message: 'ID pendonor tidak ditemukan' });
            this.riwayatLoading = false;
            return;
         }

         try {
            const res = await fetch(this.$store.state.url.REGIS_DONOR + "getHistoryByPendonor", {
               method: "POST",
               headers: {
                  "content-type": "application/json",
                  authorization: "kikensbatara " + localStorage.token
               },
               body: JSON.stringify({ pendonor_id: pendonorId })
            });

            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
               this.riwayatList = json.data;
            } else {
               this.$q.notify({ type: 'warning', message: 'Tidak ada riwayat donor ditemukan' });
            }
         } catch (err) {
            console.error("❌ Error openRiwayat:", err);
            this.$q.notify({ type: 'negative', message: 'Gagal memuat riwayat donor' });
         } finally {
            this.riwayatLoading = false;
         }
      }




   },
   mounted() {
      this.getView();
      this.loadKabupaten();
   }
}
</script>
