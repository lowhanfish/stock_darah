<template>
    <div class="about " style="padding:15px">
      <q-card bordered class="my-card">
        <q-card-section class="main2 text-white">
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="text-h6 h_titleHead">CSR Force Majeure</div>
            </div>
  
            <!-- Filter Status -->
            <div class="col-12 col-md-2">
              <q-select v-model="filterku.status" :options="statusOptions" outlined dense square emit-value map-options
                class="bg-white" @input="onStatusChange" />
            </div>
  
            <!-- Cari + Tombol Add -->
            <div class="col-12 col-md-4">
              <div class="row">
                <q-input v-model="cari_value" @keyup="cari_data()" outlined square dense class="bg-white col q-mr-sm" />
                <q-btn glossy class="main1 col-auto" @click="mdl_add = true" dense flat icon="add">
                  <q-tooltip content-class="bg-cyan-9" content-style="font-size: 13px">
                    Click untuk menambah data
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
  
        </q-card-section>
  
      </q-card>
  
  
      <hr class="hrpagin2">
  
  
  
  
  
      <div class="row q-col-gutter-md">
        <!-- Filter Kecamatan -->
        <div class="col-12 col-md-6">
          <span class="h_lable">Kecamatan</span>
          <q-select v-model="filterku.kecamatan_id" :options="kecamatanOptions" option-label="nama_kecamatan"
            option-value="kecamatan_id" emit-value map-options outlined dense class="bg-white"
            @input="onChangeKecamatanFilter" />
  
        </div>
  
        <!-- Filter Desa -->
        <div class="col-12 col-md-6">
          <span class="h_lable">Desa</span>
          <q-select v-model="filterku.desa_id" :options="list_desa_filter" option-label="nama_des_kel"
            option-value="des_kel_id" label="-- SEMUA DESA --" emit-value map-options outlined dense class="bg-white"
            @input="onChangeDesa" />
  
        </div>
  
  
        <!-- Filter Bidang -->
        <div class="col-12 col-md-12">
          <span class="h_lable">Bidang CSR Force Majeure</span>
          <q-select v-model="filterku.bidang_force_id" :options="bidangOptions" option-label="uraian" option-value="id"
            emit-value map-options outlined dense class="bg-white" @input="onChangeBidang" />
        </div>
  
  
  
      </div>
      <hr class="hrpagin2">
  
      <div class="row q-mt-md" style="display: flex; flex-wrap: wrap;">
        <div v-for="item in dataView" :key="item.id" style="flex: 0 0 33.33%; padding: 8px;">
          <q-card bordered style="height: 500px; display: flex; flex-direction: column;">

<!-- Gambar dengan Status -->
<div class="img-wrapper"
  style="height: 250px; position: relative; overflow: hidden; border-bottom: 1px solid #e0e0e0;">
  <q-img :src="item.file_name ? file_path + item.file_name : 'https://cdn.quasar.dev/img/chicken-salad.jpg'"
    spinner-color="primary" style="width: 100%; height: 100%;" :contain="true" />

  <!-- Status Chip (Overlay) -->
  <div style="position: absolute; top: 10px; left: 10px;">
    <q-chip v-if="item.status == 1" color="orange-5" text-color="white" icon="new_releases" dense>
      Program CSR Baru
    </q-chip>
    <q-chip v-else-if="item.status == 2" color="blue-6" text-color="white" icon="autorenew" dense>
      Dalam Pengerjaan
    </q-chip>
    <q-chip v-else-if="item.status == 3" color="deep-purple-5" text-color="white" icon="hourglass_bottom"
      dense>
      Pengerjaan Sebagian
    </q-chip>
    <q-chip v-else-if="item.status == 4" color="green-6" text-color="white" icon="check_circle" dense>
      Selesai
    </q-chip>
  </div>
</div>

<!-- Nama CSR & Bidang -->
<q-card-section style="flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
  <div>
    <div class="text-h8 q-mb-xs" style="font-weight: 500;">{{ item.nama_csr }}</div>
    <div class="text-subtitle2 text-grey q-mb-sm">
      <b>{{ item.uraian_bidang_csr }}</b>
      <span v-if="item.uraian_bidang_sub_csr"> | {{ item.uraian_bidang_sub_csr }}</span>
    </div>
  </div>
  <!-- Kebutuhan & Nilai -->
  <div class="column q-gutter-xs text-subtitle2 text-dark">
    <div>
      Jumlah Kebutuhan Program: <b>{{ item.jumlah }}</b> {{ item.satuan }}
    </div>
    <div>
      Nilai : <b>Rp {{ Number(item.nilai).toLocaleString('id-ID') }} / {{ item.satuan }}</b>
    </div>
  </div>
</q-card-section>

<q-separator />

<!-- Footer Action -->
<q-card-actions align="right" class="q-pt-sm">
  <q-btn v-if="tipe == 4 && (item.status == 1 || item.status == 3)" color="amber" text-color="white"
    label="Ambil Program" glossy rounded dense icon="gavel" @click="ambilProgram(item)">
    <q-tooltip content-class="bg-amber-7" content-style="font-size: 13px">
      Ambil program CSR ini
    </q-tooltip>
  </q-btn>

  <q-btn round dense color="primary" icon="visibility" @click="onItemClick(item, 'lihat')">
    <q-tooltip content-class="bg-blue-4">Lihat Detil</q-tooltip>
  </q-btn>

  <q-btn v-if="tipe == 1" round dense color="amber" icon="edit" @click="onItemClick(item, 'edit')">
    <q-tooltip content-class="bg-amber-6">Edit Program</q-tooltip>
  </q-btn>

  <q-btn v-if="tipe == 1" round dense color="negative" icon="delete" @click="onItemClick(item, 'delete')">
    <q-tooltip content-class="bg-red-6">Hapus Program</q-tooltip>
  </q-btn>
</q-card-actions>
</q-card>
  
  
        </div>
  
  
      </div>
  
      <hr class="hrpagin">
      <br>
      <div class="flex flex-center">
        <q-pagination v-model="page_first" :max="page_last" :max-pages="4" color="grey-6" :direction-links="true"
          :boundary-links="true" icon-first="skip_previous" icon-last="skip_next" icon-prev="fast_rewind"
          icon-next="fast_forward" @input="getView" />
      </div>
  
  
      <!-- ===================== MODAL ADD KEGIATAN CSR ===================== -->
      <q-dialog v-model="mdl_add" persistent>
        <q-card class="mdl-md">
          <q-card-section class="main2 text-white">
            <div class="text-h6 h_modalhead">Tambah Kegiatan CSR Force Majeure</div>
          </q-card-section>
  
          <form @submit.prevent="addData()">
  
            <q-card-section class="q-pt-none">
  
              <hr class="hrpagin2">
  
              <!-- BIDANG CSR -->
              <span class="h_lable">Bidang CSR Force Majeure</span>
              <q-select v-model="form.bidang_force_id" :options="list_bidang" option-value="id" option-label="uraian"
                emit-value map-options outlined square dense class="bg-white margin_btn" />
  
            
              <!-- NAMA CSR -->
              <span class="h_lable">Nama CSR</span>
              <q-input v-model="form.nama_csr" outlined square :dense="true" class="bg-white margin_btn" />
  
              <!-- DESKRIPSI CSR -->
              <span class="h_lable">Deskripsi / Keterangan CSR</span>
              <q-input v-model="form.deskripsi" type="textarea" outlined square :dense="true"
                class="bg-white margin_btn" />
  
              <!-- JUMLAH KEBUTUHAN -->
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <span class="h_lable">Jumlah</span>
                  <q-input v-model="form.jumlah" type="number" outlined square :dense="true"
                    class="bg-white margin_btn" />
                </div>
                <div class="col-4">
                  <span class="h_lable">Satuan</span>
                  <q-input v-model="form.satuan" outlined square :dense="true" class="bg-white margin_btn" />
                </div>
                <div class="col-4">
                  <span class="h_lable">Nilai Perkiraan</span>
                  <q-input v-model="form.nilai" type="number" outlined square :dense="true" class="bg-white margin_btn" />
                </div>
              </div>
  
              <!-- TANGGAL MULAI & SELESAI -->
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <span class="h_lable">Tanggal Mulai</span>
                  <q-input v-model="form.tanggal_mulai" type="date" outlined square :dense="true"
                    class="bg-white margin_btn" />
                </div>
                <div class="col-6">
                  <span class="h_lable">Tanggal Selesai</span>
                  <q-input v-model="form.tanggal_selesai" type="date" outlined square :dense="true"
                    class="bg-white margin_btn" />
                </div>
              </div>
  
              <!-- KECAMATAN -->
              <span class="h_lable">Kecamatan</span>
              <q-select v-model="form.kecamatan_id" :options="list_kecamatan" option-value="kecamatan_id"
                option-label="nama_kecamatan" emit-value map-options outlined square dense use-input fill-input
                hide-selected input-debounce="0" @filter="filterKecamatan" class="bg-white margin_btn" @input="getDesa" />
  
              <!-- DESA -->
              <span class="h_lable">Desa</span>
              <q-select v-model="form.desa_id" :options="list_desa" option-value="des_kel_id" option-label="nama_des_kel"
                emit-value map-options outlined square dense use-input fill-input hide-selected input-debounce="0"
                @filter="filterDesa" class="bg-white margin_btn" />
  
  
              <!-- ALAMAT -->
              <span class="h_lable">Alamat Lengkap</span>
              <q-input v-model="form.alamat" type="textarea" outlined square :dense="true" class="bg-white margin_btn" />
  
              <!-- FILE UPLOAD -->
              <span class="h_lable">Lampiran File</span>
              <q-file v-model="form.file" label="Pilih File" outlined square dense class="bg-white margin_btn" />
  
  
              <hr class="hrpagin2">
  
            </q-card-section>
  
            <q-card-actions class="bg-grey-4 mdl-footer" align="right">
              <q-btn :loading="btn_add" color="primary" type="submit" label="Simpan" />
              <q-btn label="Batal" color="negative" v-close-popup />
            </q-card-actions>
          </form>
        </q-card>
      </q-dialog>
      <!-- ===================== MODAL ADD KEGIATAN CSR ===================== -->
  
      <!-- ===================== MODAL EDIT KEGIATAN CSR ===================== -->
      <q-dialog v-model="mdl_edit" persistent>
        <q-card class="mdl-md">
          <q-card-section class="main2 text-white">
            <div class="text-h6 h_modalhead">Edit Kegiatan CSR</div>
          </q-card-section>
  
          <form @submit.prevent="editData()">
  
            <q-card-section class="q-pt-none">
  
              <hr class="hrpagin2">
  
              <!-- BIDANG CSR -->
              <span class="h_lable">Bidang CSR</span>
              <q-select v-model="form.bidang_force_id" :options="list_bidang" option-value="id" option-label="uraian"
                emit-value map-options outlined square dense class="bg-white margin_btn" />
  
  
              <!-- NAMA CSR -->
              <span class="h_lable">Nama CSR</span>
              <q-input v-model="form.nama_csr" outlined square :dense="true" class="bg-white margin_btn" />
  
              <!-- DESKRIPSI CSR -->
              <span class="h_lable">Deskripsi / Keterangan CSR</span>
              <q-input v-model="form.deskripsi" type="textarea" outlined square :dense="true"
                class="bg-white margin_btn" />
  
              <!-- JUMLAH KEBUTUHAN -->
              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <span class="h_lable">Jumlah</span>
                  <q-input v-model="form.jumlah" type="number" outlined square :dense="true"
                    class="bg-white margin_btn" />
                </div>
                <div class="col-4">
                  <span class="h_lable">Satuan</span>
                  <q-input v-model="form.satuan" outlined square :dense="true" class="bg-white margin_btn" />
                </div>
                <div class="col-4">
                  <span class="h_lable">Nilai Perkiraan</span>
                  <q-input v-model="form.nilai" type="number" outlined square :dense="true" class="bg-white margin_btn" />
                </div>
              </div>
  
              <!-- TANGGAL MULAI & SELESAI -->
              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <span class="h_lable">Tanggal Mulai</span>
                  <q-input v-model="form.tanggal_mulai" type="date" outlined square :dense="true"
                    class="bg-white margin_btn" />
                </div>
                <div class="col-6">
                  <span class="h_lable">Tanggal Selesai</span>
                  <q-input v-model="form.tanggal_selesai" type="date" outlined square :dense="true"
                    class="bg-white margin_btn" />
                </div>
              </div>
  
              <!-- KECAMATAN -->
              <span class="h_lable">Kecamatan</span>
              <q-select v-model="form.kecamatan_id" :options="list_kecamatan" option-value="kecamatan_id"
                option-label="nama_kecamatan" emit-value map-options outlined square dense use-input fill-input
                hide-selected input-debounce="0" @filter="filterKecamatan" class="bg-white margin_btn" @input="getDesa" />
  
              <!-- DESA -->
              <span class="h_lable">Desa</span>
              <q-select v-model="form.desa_id" :options="list_desa" option-value="des_kel_id" option-label="nama_des_kel"
                emit-value map-options outlined square dense use-input fill-input hide-selected input-debounce="0"
                class="bg-white margin_btn" />
  
              <!-- ALAMAT -->
              <span class="h_lable">Alamat Lengkap</span>
              <q-input v-model="form.alamat" type="textarea" outlined square :dense="true" class="bg-white margin_btn" />
  
              <!-- FILE UPLOAD -->
              <span class="h_lable">Lampiran File</span>
              <q-file v-model="form.file" label="Pilih File" outlined square dense class="bg-white margin_btn" />
  
              <hr class="hrpagin2">
            </q-card-section>
  
            <q-card-actions class="bg-grey-4 mdl-footer" align="right">
              <!-- <q-btn :loading="btn_edit" color="primary" type="submit" label="Simpan Perubahan" /> -->
              <q-btn color="primary" type="submit" label="Simpan Perubahan" />
              <q-btn label="Batal" color="negative" v-close-popup />
            </q-card-actions>
          </form>
        </q-card>
      </q-dialog>
      <!-- ===================== MODAL EDIT KEGIATAN CSR ===================== -->
  
  
      <!-- ===================== MODAL LIHAT DETIL KEGIATAN CSR ===================== -->
      <q-dialog v-model="mdl_lihat" persistent>
        <q-card class="mdl-md">
  
          <!-- Header -->
          <q-card-section class="main2 text-white">
            <div class="text-h6 h_modalhead">Detil Kegiatan CSR Force Majeure</div>
          </q-card-section>
  
          <!-- Body -->
          <q-card-section class="q-pt-none">
  
            <hr class="hrpagin2">
  
            <div class="q-mb-sm">
              <span class="h_lable">Lampiran File:</span>
              <div v-if="selectedItem.file_name" class="q-mt-xs">
  
                <!-- Preview gambar, bisa klik juga -->
                <q-img :src="file_path + selectedItem.file_name" spinner-color="primary"
                  style="max-height: 600px; cursor: pointer; border: 1px solid #ddd; border-radius: 4px;"
                  @click="downloadFile(selectedItem.file_name)" />
              </div>
              <div v-else class="q-mt-xs">
                <span>Tidak ada file</span>
              </div>
            </div>
  
  
            <!-- INFORMASI PROGRAM -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-xs">Informasi Program</div>
              <div class="q-mb-sm"><b>Bidang:</b> {{ selectedItem.uraian_bidang_csr_force }}</div>
              <!-- <div v-if="selectedItem.uraian_bidang_sub_csr" class="q-mb-sm"><b>Sub Bidang:</b> {{
                selectedItem.uraian_bidang_sub_csr }}</div> -->
              <div class="q-mb-sm"><b>Nama CSR:</b> {{ selectedItem.nama_csr }}</div>
              <div class="q-mb-sm"><b>Jumlah / Nilai:</b> {{ selectedItem.jumlah }} {{ selectedItem.satuan }} - {{
                formatRupiah(selectedItem.nilai) }}/{{ selectedItem.satuan }}</div>
            </div>
  
            <!-- PELAKSANAAN PROGRAM -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-xs">Pelaksanaan Program</div>
              <div class="row q-col-gutter-md">
                <div class="col-6"><b>Tanggal Mulai:</b> {{ selectedItem.tanggal_mulai }}</div>
                <div class="col-6"><b>Tanggal Selesai:</b> {{ selectedItem.tanggal_selesai }}</div>
              </div>
            </div>
  
            <!-- STATUS PROGRAM -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-xs">Status Program</div>
              <div class="q-mb-sm">
                <b>Status:</b>
                <q-badge v-if="selectedItem.status == 1" color="orange" dense label="Program CSR Baru" />
                <q-badge v-else-if="selectedItem.status == 2" color="yellow" text-color="black" dense
                  label="Dalam Pengerjaan" />
                <q-badge v-else-if="selectedItem.status == 3" color="blue-grey-8" text-color="white" dense
                  label="Pengerjaan Sebagian" />
                <q-badge v-else-if="selectedItem.status == 4" color="light-blue-9" text-color="white" dense
                  label="Selesai" />
              </div>
              <div class="q-mb-sm"><b>Tersedia:</b> {{ selectedItem.jumlah }} {{ selectedItem.satuan }}</div>
              <div class="q-mb-sm"><b>Terambil:</b> {{ selectedItem.nilai }} / {{ selectedItem.satuan }}</div>
            </div>
  
            <!-- DESKRIPSI PROGRAM -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-xs">Deskripsi Program</div>
              <div>{{ selectedItem.deskripsi }}</div>
            </div>
  
            <!-- ALAMAT -->
            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-xs">Alamat</div>
              <div class="q-mb-sm"><b>Kecamatan:</b> {{ selectedItem.nama_kecamatan }}</div>
              <div class="q-mb-sm"><b>Desa:</b> {{ selectedItem.nama_desa }}</div>
              <div class="q-mb-sm"><b>Alamat Lengkap:</b> {{ selectedItem.alamat }}</div>
            </div>
  
            <hr class="hrpagin2">
  
          </q-card-section>
  
          <!-- Footer -->
          <q-card-actions class="bg-grey-4 mdl-footer" align="right">
            <q-btn label="Tutup" color="negative" v-close-popup />
          </q-card-actions>
  
        </q-card>
      </q-dialog>
      <!-- ===================== MODAL LIHAT DETIL KEGIATAN CSR ===================== -->
  
        <!-- ================================================ MODAL HAPUS ================================================ -->
        <q-dialog v-model="mdl_delete" persistent>
                    <q-card class="mdl-sm ">
                    <q-card-section class="q-pt-none text-center orageGrad">
                        <form @submit.prevent="removeData">
                            <br>
                            <img src="img/alert.png" alt="" width="75"> <br>
                            <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI??</span>
                            <input type="submit" style="position: absolute; left: -9999px"/>
                            <br>
                            <br>
  
                            <q-btn label="Batal" size="sm" color="negative"  v-close-popup/>
                            &nbsp;
                            <q-btn type="submit" label="Hapus" size="sm" color="primary" v-close-popup/>
  
                        </form>
                    </q-card-section>
                    </q-card>
                </q-dialog>
  
              <!-- ================================================ MODAL HAPUS ================================================ -->
  
              <q-dialog v-model="mdlAmbil" persistent>
      <q-card class="mdl-md">

        <!-- Header -->
        <q-card-section class="bg-amber text-white flex items-center">
          <q-icon name="gavel" size="md" class="q-mr-sm" />
          <div class="text-h6">Ambil Program CSR</div>
        </q-card-section>

        <q-separator />

        <!-- Konten -->
        <q-card-section class="q-gutter-md">

          <!-- Info Program -->
          <div>
            <div class="text-subtitle1 text-bold q-mb-sm">📌 Informasi Program</div>
            <q-list dense bordered separator class="rounded-borders">
              <q-item>
                <q-item-section class="col-3 text-weight-medium"> <b>Nama</b></q-item-section>
                <q-item-section class="col-9">{{ selectedProgram.nama_csr }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Bidang</b></q-item-section>
                <q-item-section class="col-9">{{ selectedProgram.uraian_bidang_csr_force }}</q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Jumlah Tersedia</b></q-item-section>
                <q-item-section>
                  <q-badge color="amber" text-color="black"
                    :label="selectedProgram.jumlah_sisa + ' ' + selectedProgram.satuan" />
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Jumlah Total</b></q-item-section>
                <q-item-section class="col-9">{{ selectedProgram.jumlah }} {{ selectedProgram.satuan }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Nilai Program</b></q-item-section>
                <q-item-section class="col-9">Rp {{ Number(selectedProgram.nilai).toLocaleString('id-ID') }} / {{
              selectedProgram.satuan }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Tanggal Mulai</b></q-item-section>
                <q-item-section class="col-9">{{ UMUM.tglConvert(selectedProgram.tanggal_mulai) }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Tanggal Selesai</b></q-item-section>
                <q-item-section class="col-9">{{ UMUM.tglConvert(selectedProgram.tanggal_selesai) }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Alamat</b></q-item-section>
                <q-item-section class="col-9">{{ selectedProgram.alamat }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Kecamatan</b></q-item-section>
                <q-item-section class="col-9">{{ selectedProgram.nama_kecamatan }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Desa</b></q-item-section>
                <q-item-section class="col-9">{{ selectedProgram.nama_desa }}</q-item-section>
              </q-item>
            </q-list>
          </div>


          <!-- Info Mitra -->
          <div>
            <div class="text-subtitle1 text-bold q-mb-sm">🏢 Informasi Perusahaan</div>
            <q-list dense bordered separator class="rounded-borders">
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Nama Perusahaan</b></q-item-section>
                <q-item-section class="col-9">{{ mitra.nama_perusahaan }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Email Perusahaan</b></q-item-section>
                <q-item-section class="col-9">{{ mitra.email_perusahaan }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Telp Perusahaan</b></q-item-section>
                <q-item-section class="col-9">{{ mitra.telp_perusahaan }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Alamat Perusahaan</b></q-item-section>
                <q-item-section class="col-9">{{ mitra.alamat_perusahaan }}</q-item-section>
              </q-item>
            </q-list>

            <q-separator spaced />

            <div class="text-subtitle2 text-bold q-mb-sm">👤 Penanggung Jawab</div>
            <q-list dense bordered separator class="rounded-borders">
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Nama</b></q-item-section>
                <q-item-section class="col-9">{{ mitra.nama_pj }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Jabatan</b></q-item-section>
                <q-item-section class="col-9">{{ mitra.jabatan }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>Email</b></q-item-section>
                <q-item-section class="col-9">{{ mitra.email_pj }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section class="col-3 text-weight-medium"><b>No Hp</b></q-item-section>
                <q-item-section class="col-9">{{ mitra.hp_pj }}</q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Ambil Program -->
          <div>
            <div class="text-subtitle1 text-bold q-mb-sm">⚖️ Jumlah Pnegambilan CSR</div>
            <q-toggle v-model="ambilSemua" label="Mengambil Seluruh Jumlah Kebutuhan CSR" color="amber"
              @update:model-value="onToggleSemua" />
            <q-input v-model.number="jumlahAmbil" type="number" outlined dense class="q-mt-sm"
              label="Jumlah yang ingin diambil" :disable="ambilSemua" :max="selectedProgram.jumlah_sisa" :rules="[
              val => val > 0 || 'Minimal 1',
              val => val <= selectedProgram.jumlah_sisa || 'Tidak boleh lebih dari sisa'
            ]" />

            <!-- Catatan -->
            <q-input v-model="catatanAmbil" type="textarea" outlined autogrow class="q-mt-md"
              label="Catatan (opsional)" />
          </div>

        </q-card-section>

        <q-separator />

        <!-- Actions -->
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Batal" color="negative" v-close-popup />
          <q-btn label="Kirim Pengajuan" color="amber" text-color="white" @click="submitAmbil" glossy />
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
         btn_add: false,
        status: 4,
        mdl_add: false,
        mdl_edit: false,
        mdl_delete: false,
        alert: false,
        simpan1: false,
        mdl_lihat: false,
        selectedItem: {},
        cari_value: "",
        page_first: 1,
        page_last: 1,
        page_limit: 9,
        total: 0,
        selectedProgram: {},
        jumlahAmbil: 0,
        mdlAmbil: false,
        ambilSemua: false,
        catatanAmbil: '',
        mitra: {},
        tipe: null, // simpan tipe user
  
        form: {
          bidang_force_id: null,
          nama_csr: "",
          deskripsi: "",
          jumlah: null,
          satuan: "",
          nilai: null,
          tanggal_mulai: "",
          tanggal_selesai: "",
          kecamatan_id: null,
          desa_id: null,
          alamat: "",
          file_name: null  // 🔹 untuk file upload
        },

        mitra: {
        nama_perusahaan: '',
        email_perusahaan: '',
        telp_perusahaan: '',
        alamat_perusahaan: '',
        nama_pj: '',
        jabatan: '',
        email_pj: '',
        hp_pj: ''
      },
        list_bidang: [],
        list_kecamatan: [],
        list_kecamatan_master: [], // simpan data asli
        list_desa: [],
        list_desa_master: [],
        listCSR: [],
        file_path: this.$store.state.url.URL_APP + "uploads/",
  
  
        filterku: {
          kecamatan_id: "",
          desa_id: "",
          bidang_force_id: "",
          status: ""
        },
  
  
        list_bidang_filter: [],
  
        // hasil data yang difilter
        dataView: [],
  
        list_kecamatan_filter: [],
        list_desa_filter: [],
  
        statusOptions: [
          { label: 'Semua Status', value: '' },
          { label: 'Program CSR Baru', value: 1 },
          { label: 'Dalam Pengerjaan', value: 2 },
          { label: 'Pengerjaan Sebagian', value: 3 },
          { label: 'Selesai', value: 4 }
        ],
  
        kecamatanOptions: [],
        bidangOptions: [] // <- ubah dari computed ke data
  
      }
  
  
    },
  
  
    methods: {

      ambilProgram(item) {
      this.selectedProgram = item
      this.ambilSemua = false
      this.jumlahAmbil = item.jumlah_sisa
      this.catatanAmbil = `Kami akan mengambil program CSR ${item.nama_csr}, mohon untuk segera ditindaklanjuti. Terima kasih.`
      this.mdlAmbil = true

      // ambil userId dari localStorage
      const profile = JSON.parse(localStorage.profile)
      const userId = profile._id

      // panggil fungsi getMitra
      this.getMitra(userId)
    },
    onToggleSemua(val) {
      if (val) {
        // toggle ON → pakai semua jumlah sisa
        this.jumlahAmbil = this.selectedProgram.jumlah_sisa
      }
      // kalau toggle OFF → biarkan jumlahAmbil tetap ada nilainya,
      // user bisa mengedit manual di input
    },
  
      onChangeDesa(val) {
        this.filterku.desa_id = val;
        this.getView(); // refresh data sesuai filter
      },
  
      onStatusChange(val) {
        this.getView()
      },
  
  
      onChangeBidang(val) {

        this.getView(); // refresh data
      },
  
      formatRupiah(value) {
        if (value == null) return "-";
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      },
  
      onItemClick(item, action) {
        this.selectedItem = item;
  
        if (action === "edit") {
          this.openEditModal(item); // buka modal edit dan isi form
        } else if (action === "lihat") {
          this.mdl_lihat = true; // buka modal lihat detail
        } else if (action === "delete") {
          this.form.id = item.id;  // <--- ini penting
          this.mdl_delete = true; // buka modal delete
        }
  
      },
      downloadFile(fileName) {
        if (fileName) {
          window.open(this.file_path + fileName, "_blank");
        }
      },
  
      getBidang() {
        fetch(this.$store.state.url.URL_DM_BID + "force", {
          headers: {
            authorization: "kikensbatara " + localStorage.token
          }
        })
          .then(res => res.json())
          .then(res_data => {
            this.list_bidang = res_data
          })
      },
  
     
      getKecamatan() {
        fetch(this.$store.state.url.FORCEMAJEURE + "kecamatan", {
          method: "GET",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          }
        })
          .then(res => res.json())
          .then(res_data => {
            this.list_kecamatan = res_data
            this.list_kecamatan_master = res_data // simpan untuk filter
          })
      },
  
      filterKecamatan(val, update) {
        if (val === '') {
          update(() => {
            this.list_kecamatan = this.list_kecamatan_master
          })
          return
        }
  
        update(() => {
          const needle = val.toLowerCase()
          this.list_kecamatan = this.list_kecamatan_master.filter(v =>
            v.nama_kecamatan.toLowerCase().includes(needle)
          )
        })
      },
  
      getDesa() {
        this.form.desa_id = null
        this.list_desa = []
        this.list_desa_master = []
  
        fetch(this.$store.state.url.FORCEMAJEURE + "desa", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
            kecamatan_id: this.form.kecamatan_id   // 🔥 ini yang benar
          })
        })
          .then(res => res.json())
          .then(res_data => {
            this.list_desa = res_data;
            this.list_desa_master = res_data
          });
      },
  
      filterDesa(val, update) {
        if (val === '') {
          update(() => {
            this.list_desa = this.list_desa_master
          })
          return
        }
  
        update(() => {
          const needle = val.toLowerCase()
          this.list_desa = this.list_desa_master.filter(v =>
            v.nama_des_kel.toLowerCase().includes(needle)
          )
        })
      },
  
  
      addData() {
        this.btn_add = true;
  
        const formData = new FormData();
        for (let key in this.form) {
          if (key === "file" && this.form.file) {
            formData.append("file", this.form.file); // field 'file' sesuai backend
          } else {
            formData.append(key, this.form[key]);
          }
        }
  
        fetch(this.$store.state.url.FORCEMAJEURE + "addData", {
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
              this.Notify("Sukses Menambah Data", "primary", "check_circle_outline");
              this.getView();
              this.mdl_add = false;
              this.resetForm();
            } else {
              this.Notify("Gagal Menambah Data", "negative", "error_outline");
            }
          })
          .catch(err => {
            this.btn_add = false;
            console.error("❌ Error:", err);
            this.Notify("Terjadi kesalahan server", "negative", "error_outline");
          });
      },
      resetForm() {
        this.form = {
          bidang_force_id: null,
          nama_csr: "",
          deskripsi: "",
          jumlah: null,
          satuan: "",
          nilai: null,
          tanggal_mulai: "",
          tanggal_selesai: "",
          kecamatan_id: null,
          desa_id: null,
          alamat: ""
        }
      },
  
      // ambil data utama
      getView() {
        this.$store.commit("shoWLoading")
        fetch(this.$store.state.url.FORCEMAJEURE + "viewData", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
            ...this.filterku,       // kirim semua filter
            data_ke: this.page_first,
            cari_value: this.cari_value,
            page_limit: this.page_limit
          })
        })
          .then(res => res.json())
          .then(res_data => {
            this.dataView = res_data.data
            this.total = res_data.total;
            this.page_last = Math.ceil(this.total / this.page_limit);
            this.$store.commit("hideLoading")
          })
          .catch(err => {
            console.error("❌ Error getView:", err)
            this.$store.commit("hideLoading")
          })
      },
  
      removeData: function () {
          fetch(this.$store.state.url.FORCEMAJEURE + "removeData", {
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
                this.Notify('Sukses Menghapus Data', 'negative', 'check_circle_outline');
                this.getView();
              } else {
                this.Notify('Gagal Menghapus Data', 'warning', 'error');
              }
            })
            .catch(err => {
              this.Notify('Error: ' + err.message, 'warning', 'error');
            });
        },
  
  
      getBidangFilter() {
        fetch(this.$store.state.url.URL_DM_BID + "force", {
          headers: {
            authorization: "kikensbatara " + localStorage.token
          }
        })
          .then(res => res.json())
          .then(res_data => {
            this.bidangOptions = [
              { id: "", uraian: "-- SEMUA BIDANG --" },
              ...res_data.map(b => ({
                ...b,
                id: b.id.toString()  // pastikan tipe sama dengan v-model
              }))
            ];
          })
      },
  
     
      getKecamatanFilter() {
        fetch(this.$store.state.url.FORCEMAJEURE + "kecamatan", {
          headers: {
            authorization: "kikensbatara " + localStorage.token
          }
        })
          .then(res => res.json())
          .then(res_data => {
            this.kecamatanOptions = [
              { kecamatan_id: "", nama_kecamatan: "-- SEMUA KECAMATAN --" },
              ...res_data.map(k => ({
                ...k,
                kecamatan_id: k.kecamatan_id.toString()
              }))
            ];
          })
          .catch(err => console.error("❌ Error fetch kecamatan:", err));
      },
  
  
      // Saat pilih kecamatan
      onChangeKecamatanFilter(val) {
        this.filterku.kecamatan_id = val; // pastikan v-model tersinkronisasi
        this.filterku.desa_id = "";
        this.getDesaFilter();
        this.getView(); // jika ingin otomatis reload data
      },
  
      // Ambil desa sesuai kecamatan
      getDesaFilter() {
        if (!this.filterku.kecamatan_id) {
          this.list_desa_filter = []
          return
        }
  
        fetch(this.$store.state.url.FORCEMAJEURE + "desa", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          },
          body: JSON.stringify({
            kecamatan_id: this.filterku.kecamatan_id
          })
        })
          .then(res => res.json())
          .then(res_data => {
            this.list_desa_filter = res_data
          })
          .catch(err => {
            console.error("Error fetch desa:", err) // 🔥 log error
          })
      },

      getMitra(userId) {
      fetch(this.$store.state.url.FORCEMAJEURE + "mitra/" + userId, {
        method: "GET",
        headers: {
          authorization: "kikensbatara " + localStorage.token
        }
      })
        .then(res => res.json())
        .then(res_data => {
          if (res_data.success) {
            this.mitra = res_data.data
          } else {
            this.Notify("Gagal mengambil data mitra", "negative", "error_outline")
          }
        })
        .catch(err => {
          console.error("❌ Error:", err)
          this.Notify("Terjadi kesalahan server", "negative", "error_outline")
        })
    },


      submitAmbil() {
      if (!this.jumlahAmbil || this.jumlahAmbil <= 0) {
        this.Notify("Jumlah yang diambil harus lebih dari 0", "negative", "error_outline");
        return;
      }

      const profile = JSON.parse(localStorage.profile);

      const payload = {
        kegiatan_id: this.selectedProgram.id,
        perusahaan_id: profile._id, // ambil user login
        jumlah_ambil: this.jumlahAmbil,
        catatan_mitra: this.catatanAmbil
      };


      fetch(this.$store.state.url.FORCEMAJEURE + "addPengajuan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: "kikensbatara " + localStorage.token
        },
        body: JSON.stringify(payload)
      })
        .then(res => res.json())
        .then(res_data => {
          if (res_data.success) {
            this.Notify("Pengajuan berhasil dikirim", "primary", "check_circle_outline");
            this.mdlAmbil = false;
            this.getView(); // refresh list
          } else {
            this.Notify("Gagal mengirim pengajuan", "negative", "error_outline");
          }
        })
        .catch(err => {
          console.error("❌ Error:", err);
          this.Notify("Terjadi kesalahan server", "negative", "error_outline");
        });
    },

  
  
  
  
  
      simulateProgress(number) {
        // we set loading state
        this[`simpan${number}`] = true
        // simulate a delay
        setTimeout(() => {
          // we're done, we reset loading state
          this[`simpan${number}`] = false
        }, 3000)
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
  
      // cari_data() {
  
      //     this.getView(); // refresh data sesuai input pencarian
      //   },
      btn_prev() {
        if (this.page_first > 1) this.page_first--;
        this.getView();
      },
  
      btn_next() {
        if (this.page_first < this.page_last) this.page_first++;
        this.getView();
      },
  
      cari_data() {
        this.page_first = 1;
        this.getView();
      },
  
      indexing(index) {
        return ((this.page_first - 1) * this.page_limit) + index;
      },
  
      openEditModal(item) {
        this.selectedItem = item;
  
        // set form
        this.form = { ...item };
  

        // buka modal
        this.mdl_edit = true;
      }
  
  
  
    },
    mounted() {

      const get_profile = JSON.parse(localStorage.profile);
    this.tipe = Number(get_profile.profile.db_csrkonsel); // ambil db_csrkonsel


    // simpan data mitra (kalau yang login memang mitra)
    this.mitra = {
      id: get_profile._id,
      nama: get_profile.profile.nama,
      username: get_profile.username
    }
  
      // jalankan ketika halaman pertama kali dibuka
      this.getView();
      this.getKecamatan();
      this.getDesa();
      this.getKecamatanFilter();
      // this.getDesaFilter();
      this.getBidang();
      this.getBidangFilter();
    }
  }
  </script>
  