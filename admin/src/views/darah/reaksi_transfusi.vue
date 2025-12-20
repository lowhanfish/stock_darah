<template>
    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <!-- ================= HEADER ================= -->
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Reaksi Transfusi</div>
                        <div class="text-h8">Manajemen Darah</div>
                    </div>
                    <div class="col-12 col-md-2"></div>
                    <div class="col-12 col-md-4">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true"
                                class="bg-white" style="width:90%" />
                            <q-btn v-if="tipe == 3" glossy class="main4" @click="mdl_add = true" dense flat icon="add"
                                style="width:10%">
                                <q-tooltip content-class="bg-green-5" content-style="font-size: 13px">
                                    Tambah Reaksi
                                </q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>
            </q-card-section>

        </q-card>


        <hr class="hrpagin2">


        <!-- ================= TABLE ================= -->

        <div class="tbl_responsive">
            <table width="100%">
                <thead class="h_table_head main2x text-white">
                    <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="5%" class="text-center">Reaksi Transfusi</th>
                        <th width="10%" class="text-center">Nama Pasien </th>
                        <th width="10%" class="text-center">Waktu Transfusi</th>
                        <th width="10%">Jenis Reaksi</th>
                        <th width="10%" class="text-center">Waktu Terjadi Reaksi</th>
                        <th width="10%" class="text-center">Waktu dilaporkan</th>
                        <th width="10%">Petugas Pelapor</th>
                        <th width="15%" class="text-center">Tindakan</th>
                        <th width="15%" class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>

                        <!-- KOLom Pemeriksaan (ganti yang lama) -->
                        <td class="text-center">
                            <!-- Role 3: Admin Ruangan -->
                            <template v-if="Number(tipe) === 3">
                                <!-- Tombol Kirim saat draft -->
                                <q-btn v-if="data.status === 'draft'" color="primary" dense icon="send"
                                    @click="openKirimConfirmation(data)">
                                    <q-tooltip content-class="bg-blue-9">Kirim laporan ini ke UPD (tidak bisa diedit
                                        lagi)</q-tooltip>
                                </q-btn>

                                <!-- Tombol Unduh / Lihat Dokumen saat sudah terkirim (tetap disable sampai status 'unduh') -->
                                <q-btn v-else-if="data.status === 'terkirim' || data.status === 'unduh' || data.status"
                                    class="main1x" icon="document_scanner" color="primary"
                                    :disable="data.status !== 'unduh'"
                                    @click="data.status === 'unduh' && openLihatDokumen(data)" />
                            </template>

                            <!-- Role 1 & 2 (Admin UPD) -->
                            <template v-else>

                                <!-- Jika status = 'terkirim' → UPD harus isi pemeriksaan -->
                                <q-btn v-if="data.status === 'terkirim'" color="light-green-6" icon="medical_services"
                                    class="main1x" @click="openPemeriksaanModal(data)">
                                    <q-tooltip content-class="bg-green-7">Lanjut Pemeriksaan Pretransfusi</q-tooltip>
                                </q-btn>

                                <!-- Jika status = 'unduh' → tampilkan tombol unduh dokumen -->
                                <q-btn v-else-if="data.status === 'unduh'" color="primary" icon="document_scanner"
                                    class="main1x" :loading="loadingPdfId === data.id"
                                    :disable="loadingPdfId === data.id" @click="openLihatDokumen(data)">

                                    <q-tooltip content-class="bg-blue-8">Unduh / Lihat Dokumen</q-tooltip>
                                </q-btn>

                                <!-- Jika status lain (mis. draft — tapi draft disembunyikan oleh backend untuk UPD) -->
                                <q-btn v-else color="light-green-6" icon="medical_services" class="main1x"
                                    @click="openPemeriksaanModal(data)">
                                    <q-tooltip content-class="bg-green-7">Pemeriksaan Pretransfusi</q-tooltip>
                                </q-btn>

                            </template>

                        </td>

                        <td class="text-center">
                            <div>
                                {{ data.nama_pasien }}
                            </div>
                            <div class="text-blue text-bold" style="font-size: 12px;">

                                {{ data.nama_ruangan }}

                            </div>

                        </td>
                        <td class="text-center">{{ UMUM.tglConvertx(data.jam_transfusi, true) }}</td>
                        <td>{{ data.jenis_reaksi }}</td>
                        <td class="text-center">{{ UMUM.tglConvertx(data.jam_terjadi, true) }}</td>
                        <td class="text-center">{{ UMUM.tglConvertx(data.jam_dilaporkan, true) }}</td>
                        <td class="text-center">{{ data.petugas_pelapor }}</td>
                        <td class="text-center">{{ data.tindakan }}</td>
                        <!-- KOLom Aksi (ganti yang lama) -->
                        <td class="text-center q-gutter-sm">
                            <template v-if="Number(tipe) === 3">
                                <q-btn dense round color="warning" icon="edit" :disable="data.status === 'terkirim'"
                                    @click="openEdit(data)">
                                    <q-tooltip content-class="bg-yellow-9" v-if="data.status === 'terkirim'">Tidak bisa
                                        diedit setelah
                                        dikirim</q-tooltip>
                                    <q-tooltip v-else content-class="bg-yellow-9">Edit</q-tooltip>
                                </q-btn>

                                <q-btn dense round color="negative" icon="delete" :disable="data.status === 'terkirim'"
                                    @click="openDelete(data)">
                                    <q-tooltip content-class="bg-red-8" v-if="data.status === 'terkirim'">Tidak bisa
                                        dihapus setelah
                                        dikirim</q-tooltip>
                                    <q-tooltip v-else content-class="bg-red-8">Hapus</q-tooltip>
                                </q-btn>

                                <q-btn dense round color="primary" icon="visibility" @click="openLihat(data)">
                                    <q-tooltip content-class="bg-blue-6">Lihat</q-tooltip>
                                </q-btn>
                            </template>

                            <template v-else>
                                <q-btn disable dense round color="warning" icon="edit" @click="openEdit(data)">
                                    <q-tooltip content-class="bg-yellow-8">Edit (UPD)</q-tooltip>
                                </q-btn>

                                <q-btn disable dense round color="negative" icon="delete" @click="openDelete(data)">
                                    <q-tooltip content-class="bg-red-8">Hapus (UPD)</q-tooltip>
                                </q-btn>

                                <q-btn dense round color="primary" icon="visibility" @click="openLihat(data)"
                                    :disable="data.status === 'terkirim' && !data.pemeriksaan_id">
                                    <q-tooltip v-if="data.status === 'terkirim' && !data.pemeriksaan_id"
                                        content-class="bg-red-8">
                                        Menunggu data pemeriksaan diinput
                                    </q-tooltip>
                                    <q-tooltip v-else content-class="bg-blue-6">Lihat</q-tooltip>
                                </q-btn>
                            </template>
                        </td>

                    </tr>

                    <tr v-if="list_data.length === 0">
                        <td colspan="8" class="text-center text-grey">
                            Belum ada data.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="flex flex-center q-mt-md">
            <q-pagination v-model="page_first" :max="page_last" @input="getView" color="grey-6" :max-pages="4"
                :direction-links="true" :boundary-links="true" />
        </div>


        <!-- ===================== MODAL ADD REAKSI TRANSFUSI ===================== -->
        <q-dialog v-model="mdl_add" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Laporan Reaksi Transfusi</div>
                </q-card-section>

                <form @submit.prevent="addData">
                    <q-card-section class="q-pt-none">

                        <!-- Pilih Permintaan (Nama Pasien) -->
                        <!-- <span class="h_lable">Pilih Permintaan (Nama Pasien)</span>
                        <q-select v-model="form.permintaan_id" outlined square :dense="true" class="bg-white margin_btn"
                            :options="list_permintaan" option-value="id" option-label="nama_pasien" emit-value
                            map-options required /> -->

                        <span class="h_lable">Pilih Permintaan (Nama Pasien)</span>
                        <q-select ref="select" v-model="form.permintaan_id" outlined square :dense="true"
                            class="bg-white margin_btn" :options="list_permintaan" option-value="id"
                            option-label="nama_pasien" emit-value map-options required>
                            <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps" clickable @click="handleOptionClick(scope)">
                                    <q-item-section>
                                        <q-item-label class="text-dark text-bold">
                                            {{ scope.opt.nama_pasien }}
                                        </q-item-label>
                                        <q-item-label class="text-blue text-bold" style="font-size: 12px;">
                                            {{ UMUM.tglConvert(scope.opt.tanggal_lahir) }}
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>

                        <!-- Jam Transfusi -->
                        <span class="h_lable">Jam Transfusi</span>
                        <q-input v-model="form.jam_transfusi" type="datetime-local" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <!-- Jenis Reaksi -->
                        <span class="h_lable">Jenis Reaksi</span>
                        <q-input v-model="form.jenis_reaksi" outlined square :dense="true" class="bg-white margin_btn"
                            placeholder="Contoh: Urtikaria, Demam, Sesak, dll" required />

                        <!-- Jam Terjadinya Reaksi -->
                        <span class="h_lable">Jam Terjadinya Reaksi</span>
                        <q-input v-model="form.jam_terjadi" type="datetime-local" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <!-- Jam Dilaporkan -->
                        <span class="h_lable">Jam Dilaporkan</span>
                        <q-input v-model="form.jam_dilaporkan" type="datetime-local" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <!-- Petugas Yang Melaporkan -->
                        <span class="h_lable">Petugas Yang Melaporkan</span>
                        <q-input v-model="form.petugas_pelapor" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <!-- Tindakan -->
                        <span class="h_lable">Tindakan Yang Dilakukan</span>
                        <q-input v-model="form.tindakan" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                    </q-card-section>

                    <!-- Footer -->
                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_add" color="primary" type="submit" label="Simpan" />
                        <q-btn label="Batal" color="negative" v-close-popup />
                    </q-card-actions>
                </form>

            </q-card>
        </q-dialog>




        <q-dialog v-model="mdl_kirim" persistent>
            <q-card class="mdl-sm">
                <q-card-section class="q-pt-none text-center birumudaGrad">
                    <form @submit.prevent="confirmKirim">
                        <br>
                        <img src="img/alert.png" alt="" width="75" /> <br>
                        <span class="h_notifikasi">
                            APAKAH ANDA YAKIN INGIN MENGIRIM LAPORAN INI KE UPD? <br>
                        </span>

                        <!-- accessibility: submit hidden input -->
                        <input type="submit" style="position: absolute; left: -9999px" />
                        <br><br>

                        <q-btn label="Batal" size="sm" color="negative" v-close-popup @click="cancelKirim" />
                        &nbsp;
                        <q-btn :label="loadingKirim ? 'Mengirim...' : 'Ya, Kirim'" size="sm" color="primary"
                            :loading="loadingKirim" type="submit" />
                    </form>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- ===================== MODAL ADD PEMERIKSAAN TRANSFUSI (UPD) ===================== -->
        <q-dialog v-model="mdl_pemeriksaan" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Pemeriksaan Pretransfusi (UPD)</div>
                </q-card-section>

                <form @submit.prevent="submitPemeriksaan">
                    <q-card-section class="q-pt-none">

                        <div class="col-12 col-md-12">
                            <span class="h_lable">DPJP Labpratorium</span>
                            <q-input v-model="pemeriksaanForm.dpjp_lab" outlined square dense
                                class="bg-white margin_btn" />
                        </div>

                        <div class="text-subtitle1 q-mt-sm text-bold">Pemeriksaan Pretransfusi</div>

                        <!-- <hr class="hrpagin2" /> -->

                        <!-- hidden reaksi_id -->
                        <input type="hidden" v-model="pemeriksaanForm.reaksi_id" />

                        <div class="row q-col-gutter-md">

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Asal Darah</span>
                                <q-input v-model="pemeriksaanForm.asal_darah" outlined square dense
                                    class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">No. Kantong</span>
                                <q-input v-model="pemeriksaanForm.no_kantong" outlined square dense
                                    class="bg-white margin_btn" required />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Komponen Darah</span>
                                <q-select v-model="pemeriksaanForm.komponen_darah" :options="list_komponen"
                                    option-value="id" option-label="nama_komponen" emit-value map-options outlined dense
                                    class="bg-white margin_btn" required />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Golongan Darah</span>
                                <q-select v-model="pemeriksaanForm.golongan_darah" :options="['A', 'B', 'O', 'AB']"
                                    outlined square dense class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-12">
                                <span class="h_lable">Uji Silang / Serasi</span>
                                <q-input v-model="pemeriksaanForm.uji_silang_serasi" outlined square dense
                                    class="bg-white margin_btn" />
                            </div>

                        </div>
                        <hr class="hrpagin2" />
                        <div class="text-subtitle1 q-mt-sm text-bold">Konfirmasi Pasca Transfusi</div>
                        <div class="row q-col-gutter-md">


                            <div class="col-12 col-md-6">
                                <span class="h_lable">Konfirmasi Gol Pasien</span>
                                <q-select v-model="pemeriksaanForm.konfirm_gol_pasien" :options="['A', 'B', 'O', 'AB']"
                                    outlined square dense class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Konfirmasi Rhesus Pasien</span>
                                <q-select v-model="pemeriksaanForm.konfirm_rhesus_pasien" :options="['+', '-']" outlined
                                    square dense class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Konfirmasi Gol Donor</span>
                                <q-select v-model="pemeriksaanForm.konfirm_gol_donor" :options="['A', 'B', 'O', 'AB']"
                                    outlined square dense class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-6">
                                <span class="h_lable">Konfirmasi Rhesus Donor</span>
                                <q-select v-model="pemeriksaanForm.konfirm_rhesus_donor" :options="['+', '-']" outlined
                                    square dense class="bg-white margin_btn" />
                            </div>

                            <div class="col-12">
                                <span class="h_lable">Uji Silang — Konfirmasi</span>
                                <q-input v-model="pemeriksaanForm.uji_silang_konfirmasi" type="textarea" outlined square
                                    dense class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-12">
                                <span class="h_lable">Waktu Pemeriksaan</span>
                                <q-input v-model="pemeriksaanForm.pemeriksaan_at" type="datetime-local" outlined square
                                    dense class="bg-white margin_btn" />
                            </div>
                        </div>

                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="loadingPemeriksaan" color="primary" type="submit" label="Simpan Pemeriksaan" />
                        <q-btn label="Batal" color="negative" v-close-popup @click="cancelPemeriksaan" />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>


        <!-- MODAL LIHAT PEMERIKSAAN -->
        <q-dialog v-model="mdl_view" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Detail Pemeriksaan Pretransfusi</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <div v-if="loadingView" class="row items-center justify-center q-pa-md">
                        <q-spinner-dots />
                    </div>

                    <div v-else>
                        <div v-if="!viewPemeriksaan" class="text-center text-grey q-pa-md">
                            Belum ada pemeriksaan.
                        </div>

                        <div v-else>
                            <!-- Bagian: Pemeriksaan Pretransfusi -->
                            <div class="q-mb-md">
                                <div class="text-subtitle1 text-bold">Pemeriksaan Pretransfusi</div>
                                <div class="detail-table q-mt-sm">
                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">No. Kantong</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.no_kantong || '-' }}</div>
                                    </div>

                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">Komponen</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.komponen_darah || '-' }}
                                        </div>
                                    </div>

                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">Asal Darah</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.asal_darah || '-' }}</div>
                                    </div>

                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">Uji Silang / Serasi</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.uji_silang_serasi || '-' }}
                                        </div>
                                    </div>

                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">Waktu Pemeriksaan</div>
                                        <div class="col-8 detail-value">
                                            {{ viewPemeriksaan.pemeriksaan_at ?
                                UMUM.tglConvertx(viewPemeriksaan.pemeriksaan_at,
                                    true) : (viewPemeriksaan.pemeriksaan_created ?
                                        UMUM.tglConvertx(viewPemeriksaan.pemeriksaan_created, true) : '-') }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Bagian: Konfirmasi Pasca Transfusi -->
                            <div class="q-mb-md">
                                <div class="text-subtitle1 text-bold">Konfirmasi Pasca Transfusi</div>
                                <div class="detail-table q-mt-sm">
                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">Golongan Darah Pasien</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.konfirm_gol_pasien || '-' }}
                                        </div>
                                    </div>

                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">Rhesus Pasien</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.konfirm_rhesus_pasien || '-'
                                            }}</div>
                                    </div>

                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">Golongan Darah Donor</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.konfirm_gol_donor || '-' }}
                                        </div>
                                    </div>

                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">Rhesus Donor</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.konfirm_rhesus_donor || '-'
                                            }}</div>
                                    </div>

                                    <div class="row detail-row">
                                        <div class="col-4 detail-label">Uji Silang — Konfirmasi</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.uji_silang_konfirmasi || '-'
                                            }}</div>
                                    </div>

                                    <!-- <div class="row detail-row">
                                        <div class="col-4 detail-label">Status Reaksi</div>
                                        <div class="col-8 detail-value">{{ viewPemeriksaan.reaksi_status || '-' }}</div>
                                    </div> -->
                                </div>
                            </div>
                            <div>

                                <div class="text-subtitle1 text-bold">DPJP Laboratorium : {{ viewPemeriksaan.dpjp_lab }}
                                </div>
                            </div>
                        </div>
                    </div>
                </q-card-section>


                <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    <q-btn label="Tutup" color="negative" v-close-popup @click="mdl_view = false" />
                    <q-btn v-if="viewPemeriksaan && (Number(tipe) === 1 || Number(tipe) === 2)" label="Edit Pemeriksaan"
                        color="primary" @click="openEditPemeriksaan(viewPemeriksaan)" />

                </q-card-actions>

                <!-- <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="loadingPemeriksaan" color="primary" type="submit" label="Simpan Pemeriksaan" />
                        <q-btn label="Batal" color="negative" v-close-popup @click="cancelPemeriksaan" />
                    </q-card-actions> -->
            </q-card>
        </q-dialog>

        <!-- MODAL PREVIEW / DOWNLOAD PDF -->
        <q-dialog v-model="mdl_pdf_view" maximized>
            <q-card class="full-height">
                <q-bar>
                    <div class="text-h6">Preview Dokumen Pemeriksaan</div>
                    <q-space />
                    <!-- tombol download -->
                    <q-btn flat round dense icon="file_download" @click="downloadPdf" :disable="!pdfUrl" />
                    <q-btn flat round dense icon="close" v-close-popup @click="closePdfModal" />
                </q-bar>

                <q-separator />

                <q-card-section class="q-pa-none" style="height: calc(100% - 56px);">
                    <div v-if="loadingPdf" class="row items-center justify-center full-height">
                        <q-spinner-dots size="40px" />
                    </div>

                    <div v-else-if="pdfUrl" style="height:100%;">
                        <iframe :src="pdfUrl" style="width:100%; height:100%; border:0;"></iframe>
                    </div>

                    <div v-else class="row items-center justify-center full-height text-grey">
                        Tidak ada dokumen untuk ditampilkan.
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- MODAL EDIT DATA -->
        <q-dialog v-model="mdl_edit" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Edit Reaksi Transfusi</div>
                </q-card-section>

                <form @submit.prevent="updateData">
                    <q-card-section class="q-pt-none">

                        <span class="h_lable">Pilih Permintaan (Nama Pasien)</span>
                        <q-select ref="selectEdit" v-model="form_edit.permintaan_id" outlined square :dense="true"
                            class="bg-white margin_btn" :options="list_permintaan" option-value="id"
                            option-label="nama_pasien" emit-value map-options required>
                            <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                    <q-item-section>
                                        <q-item-label class="text-dark text-bold">
                                            {{ scope.opt.nama_pasien }}
                                        </q-item-label>
                                        <q-item-label class="text-blue text-bold" style="font-size: 12px;">
                                            {{ UMUM.tglConvert(scope.opt.tanggal_lahir) }}
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>

                        <span class="h_lable">Jam Transfusi</span>
                        <q-input v-model="form_edit.jam_transfusi" type="datetime-local" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <span class="h_lable">Jenis Reaksi</span>
                        <q-input v-model="form_edit.jenis_reaksi" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <span class="h_lable">Jam Terjadinya Reaksi</span>
                        <q-input v-model="form_edit.jam_terjadi" type="datetime-local" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <span class="h_lable">Jam Dilaporkan</span>
                        <q-input v-model="form_edit.jam_dilaporkan" type="datetime-local" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <span class="h_lable">Petugas Yang Melaporkan</span>
                        <q-input v-model="form_edit.petugas_pelapor" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <span class="h_lable">Tindakan Yang Dilakukan</span>
                        <q-input v-model="form_edit.tindakan" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_edit" color="warning" type="submit" label="Simpan Perubahan" />
                        <q-btn label="Batal" color="negative" v-close-popup />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>


        <!-- HAPUS DATA -->
        <!-- <q-dialog v-model="mdl_delete" persistent>
            <q-card class="q-pa-md">
                <q-card-section class="text-center">
                    <q-icon name="warning" color="negative" size="48px" />
                    <div class="text-h6 q-mt-md">Konfirmasi Penghapusan</div>
                    <p class="q-mt-sm">Anda yakin ingin menghapus data laporan reaksi transfusi ini secara permanen?</p>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn flat label="Batal" color="grey" v-close-popup />
                    <q-btn :loading="btn_delete" label="Hapus" color="negative" @click="deleteData" />
                </q-card-actions>
            </q-card>
        </q-dialog> -->

        <q-dialog v-model="mdl_delete" persistent>
            <q-card class="mdl-sm">
                <q-card-section class="q-pt-none text-center orageGrad">
                    <form @submit.prevent="deleteData">
                        <br>
                        <img src="img/alert.png" alt="" width="75" /> <br>
                        <span class="h_notifikasi">
                            APAKAH ANDA YAKIN INGIN MENGHAPUS LAPORAN REAKSI TRANSFUSI INI SECARA PERMANEN? <br>
                        </span>

                        <input type="submit" style="position: absolute; left: -9999px" />
                        <br><br>

                        <q-btn label="Batal" size="sm" color="primary" v-close-popup />
                        &nbsp;
                        <q-btn :label="btn_delete ? 'Menghapus...' : 'Ya, Hapus'" size="sm" color="negative"
                            :loading="btn_delete" type="submit" />
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
            tipe: 0,
            user: null,
            UMUM: UMUM,
            list_permintaan: [],
            mdl_add: false,
            mdl_kirim: false,
            btn_add: false,
            form: {
                permintaan_id: null,
                jam_transfusi: null,
                jenis_reaksi: '',
                jam_terjadi: null,
                jam_dilaporkan: null,
                petugas_pelapor: '',
                tindakan: ''
            },

            list_data: [],
            list_komponen: [],

            page_first: 1,
            page_last: 0,
            page_limit: 10,
            jml_data: 0,
            total_data: 0,
            cari_value: '',

            mdl_edit: false,
            btn_edit: false,
            form_edit: {
                id: null,
                permintaan_id: null,
                jam_transfusi: null,
                jenis_reaksi: '',
                jam_terjadi: null,
                jam_dilaporkan: null,
                petugas_pelapor: '',
                tindakan: ''
            },

            mdl_delete: false,
            btn_delete: false,
            delete_id: null,
            hapus_target: null,
            filter: {
                komponen_id: '',
                tipe_transaksi: ''
            },

            modalPemeriksaanOpen: false,
            mdl_pemeriksaan: false,
            pemeriksaanForm: {
                reaksi_id: null,
                dpjp_lab: '',
                asal_darah: '',
                no_kantong: '',
                komponen_darah: '',
                golongan_darah: '',
                uji_silang_serasi: '',
                konfirm_gol_pasien: '',
                konfirm_rhesus_pasien: '',
                konfirm_gol_donor: '',
                konfirm_rhesus_donor: '',
                uji_silang_konfirmasi: '',
                pemeriksaan_at: ''
            },
            loadingPemeriksaan: false,
            pemeriksaanEditMode: false,
            pemeriksaanEditId: null,


            STATUS_DRAFT: 'draft',
            STATUS_TERKIRIM: 'terkirim',
            loadingKirim: false,
            mdl_view: false,
            loadingView: false,
            viewPemeriksaan: null,

            mdl_pdf_view: false,
            loadingPdfId: null,
            pdfUrl: null,
            pdfName: null,

        }
    },
    methods: {

        cancelKirim() {
            this.kirim_target = null;
            this.mdl_kirim = false;
        },


        openPemeriksaanModal(item) {
            this.pemeriksaanForm = {
                reaksi_id: item.id,
                dpjp_lab: '',
                asal_darah: '',
                no_kantong: '',
                komponen_darah: '',
                golongan_darah: '',
                uji_silang_serasi: '',
                konfirm_gol_pasien: '',
                konfirm_rhesus_pasien: '',
                konfirm_gol_donor: '',
                konfirm_rhesus_donor: '',
                uji_silang_konfirmasi: '',
                pemeriksaan_at: ''
            };
            this.mdl_pemeriksaan = true;
            this.pemeriksaanEditMode = false;
            this.pemeriksaanEditId = null;
            this.mdl_pemeriksaan = true;
        },

        cancelPemeriksaan() {
            this.mdl_pemeriksaan = false;
        },

        async addPemeriksaan() {
            if (!this.pemeriksaanForm.reaksi_id) {
                this.$q.notify({ type: 'negative', message: 'Target reaksi tidak ditemukan.' });
                return;
            }
            if (!this.pemeriksaanForm.no_kantong || !this.pemeriksaanForm.komponen_darah) {
                this.$q.notify({ type: 'negative', message: 'Mohon isi No. Kantong dan Komponen Darah.' });
                return;
            }

            this.loadingPemeriksaan = true;
            const baseURL = this.$store?.state?.url?.REAKSI_TRANSFUSI
                || ((this.$store?.state?.url?.BASE || '') + 'api/v1/reaksi_transfusi/');
            const url = baseURL + 'pemeriksaan/add';

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: 'kikensbatara ' + (localStorage.token || '')
                    },
                    body: JSON.stringify(this.pemeriksaanForm)
                });

                const json = await res.json().catch(() => ({ success: false, message: 'Response parse error' }));

                if (res.ok && (json.success || json.status)) {
                    this.$q.notify({ type: 'positive', message: json.message || 'Pemeriksaan berhasil disimpan.' });
                    this.mdl_pemeriksaan = false;

                    this.getView()
                } else {
                    this.$q.notify({ type: 'negative', message: json.message || `Gagal menyimpan pemeriksaan (${res.status})` });
                }
            } catch (err) {
                console.error('addPemeriksaan error', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat menyimpan pemeriksaan.' });
            } finally {
                this.loadingPemeriksaan = false;
            }
        },
        openPemeriksaan(data) {
            const isAdminRuangan = (Number(this.tipe) === 3);

            if (isAdminRuangan && data.status === this.STATUS_DRAFT) {
                this.openKirimConfirmation(data);
                return;
            }
            const isUPD = Number(this.tipe) === 1 || Number(this.tipe) === 2;
            if (isUPD && data.status === this.STATUS_TERKIRIM) {
                this.pemeriksaanForm = { reaksi_id: data.id };
                this.modalPemeriksaanOpen = true;
                return;
            }

            // default: buka modal pemeriksaan
            this.pemeriksaanForm = { reaksi_id: data.id };
            this.modalPemeriksaanOpen = true;
        },





        openKirimConfirmation(item) {
            this.kirim_target = item;
            this.mdl_kirim = true;
        },
        async confirmKirim() {
            const id = this.kirim_target.id;
            const base = this.$store.state.url.REAKSI_TRANSFUSI;
            await fetch(base + id + "/send", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + (localStorage.token || '')
                },
                body: JSON.stringify({ status: 'terkirim' })
            });
            this.kirim_target.status = "terkirim";
            this.mdl_kirim = false;
            this.getView();
        },

        handleOptionClick(scope) {
            this.form.permintaan_id = scope.opt.id;
            this.$refs.select.hidePopup();
        },

        async getData() {
            try {
                const baseURL = this.$store.state.url.REAKSI_TRANSFUSI
                    || (this.$store.state.url.BASE || '') + "api/v1/reaksi_transfusi/";

                // jika form.ruangan_id ada, tambahkan param
                const url = this.form.ruangan_id ? `${baseURL}?ruangan_id=${this.form.ruangan_id}` : baseURL;

                console.log("fetch url:", url);

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "content-type": "application/json",
                        authorization: "kikensbatara " + localStorage.token
                    }
                });

                const json = await res.json();
                console.log("getData json:", json);

                if (json.status) {
                    this.list_permintaan = json.permintaan || [];
                    this.table_data = json.reaksi || [];
                    if (this.list_permintaan.length && !this.form.permintaan_id) {
                        this.form.permintaan_id = this.list_permintaan[0].id;
                    }
                } else {
                    this.list_permintaan = [];
                    this.table_data = [];
                }
            } catch (err) {
                console.error("getData error:", err);
                this.list_permintaan = [];
                this.table_data = [];
            }
        },

        addData() {
            console.log('DEBUG addData payload:', this.form);
            this.btn_add = true;

            fetch(this.$store.state.url.REAKSI_TRANSFUSI + "addData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(this.form)
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success || res_data.status) {
                        this.$q.notify({
                            type: "positive",
                            message: res_data.message || "Laporan Reaksi Transfusi berhasil ditambahkan"
                        });

                        this.mdl_add = false;
                        this.resetForm();
                        this.getView();
                    } else {
                        this.$q.notify({
                            type: "negative",
                            message: res_data.message || "Gagal menambah laporan reaksi transfusi"
                        });
                    }
                })
                .catch(err => {
                    console.error("Error addData:", err);
                    this.$q.notify({
                        type: "negative",
                        message: "Terjadi kesalahan saat menyimpan data"
                    });
                })
                .finally(() => {
                    this.btn_add = false;
                });
        },

        resetForm() {
            this.form = {
                permintaan_id: null,

                jam_transfusi: "",
                jenis_reaksi: "",
                jam_terjadi: "",
                jam_dilaporkan: "",
                petugas_pelapor: "",
                tindakan: "",

                ruangan_id: this.form?.ruangan_id || null,
                rumah_sakit_id: this.form?.rumah_sakit_id || null
            };
        },

        getView() {
            const query = new URLSearchParams({
                page: this.page_first,
                limit: this.page_limit,
                cari_value: this.cari_value || ''
            }).toString();

            fetch(this.$store.state.url.REAKSI_TRANSFUSI + "view?" + query, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    console.log('getView response:', res_data);

                    if (res_data.success) {
                        this.list_data = res_data.data || [];
                        this.total_data = res_data.total_data || 0;
                        this.page_last = res_data.total_pages || 1;
                        this.jml_data = this.list_data.length;

                        if (this.page_first > this.page_last) {
                            this.page_first = this.page_last || 1;
                        }
                    } else {
                        this.$q.notify({
                            type: 'negative',
                            message: res_data.message || 'Gagal memuat data reaksi transfusi'
                        });
                    }
                })
                .catch(err => {
                    console.error('Error fetching reaksi transfusi:', err);
                    this.$q.notify({
                        type: 'negative',
                        message: 'Terjadi kesalahan saat memuat data reaksi transfusi'
                    });
                });
        },

        async openLihat(item) {
            // item adalah row dari list_data, berisi id (reaksi id)
            if (!item || !item.id) {
                this.$q.notify({ type: 'negative', message: 'Data tidak valid' });
                return;
            }

            this.loadingView = true;
            this.viewPemeriksaan = null;
            this.mdl_view = true;

            const baseURL = this.$store?.state?.url?.REAKSI_TRANSFUSI
                || ((this.$store?.state?.url?.BASE || '') + 'api/v1/reaksi_transfusi/');
            const url = baseURL + 'pemeriksaan/view?reaksi_id=' + encodeURIComponent(item.id);

            try {
                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: 'kikensbatara ' + (localStorage.token || '')
                    }
                });
                const json = await res.json().catch(() => ({ success: false, message: 'Response parse error' }));
                if (res.ok && (json.success || json.status)) {
                    this.viewPemeriksaan = json.data;
                } else {
                    this.viewPemeriksaan = null;
                    this.$q.notify({ type: 'negative', message: json.message || 'Gagal memuat data pemeriksaan' });
                }
            } catch (err) {
                console.error('openLihat error', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memuat data pemeriksaan' });
                this.viewPemeriksaan = null;
            } finally {
                this.loadingView = false;
            }
        },

        openEditPemeriksaan(dataPemeriksaan) {
            // Tutup detail view
            this.mdl_view = false;

            // Debug: lihat payload
            console.log('openEditPemeriksaan payload:', dataPemeriksaan, 'list_komponen:', this.list_komponen);

            // Pastikan kita punya data pemeriksaan dan id pemeriksaan
            // Kadang field id bisa bernama 'id' atau 'pemeriksaan_id' tergantung response
            const pemeriksaanId = dataPemeriksaan?.id || dataPemeriksaan?.pemeriksaan_id || null;
            if (!pemeriksaanId) {
                this.$q.notify({ type: 'negative', message: 'ID pemeriksaan tidak ditemukan — tidak bisa edit.' });
                return;
            }

            // Cari komponen di list_komponen. dataPemeriksaan.komponen_darah mungkin mengandung id atau nama.
            let komponenValue = null;
            if (this.list_komponen && this.list_komponen.length) {
                // jika dataPemeriksaan.komponen_darah adalah angka/id:
                const asNumber = Number(dataPemeriksaan.komponen_darah);
                if (!isNaN(asNumber) && asNumber > 0) {
                    const foundById = this.list_komponen.find(k => Number(k.id) === asNumber);
                    if (foundById) komponenValue = foundById.id;
                }
                // jika belum ditemukan, cari berdasarkan nama_komponen
                if (!komponenValue) {
                    const foundByName = this.list_komponen.find(k => String(k.nama_komponen).trim() === String(dataPemeriksaan.komponen_darah).trim());
                    if (foundByName) komponenValue = foundByName.id;
                }
            }

            // Inisialisasi form dengan data pemeriksaan yang dikirim
            this.pemeriksaanForm = {
                reaksi_id: dataPemeriksaan.reaksi_id || dataPemeriksaan.reaksi_id || null,
                dpjp_lab: dataPemeriksaan.dpjp_lab || '',
                asal_darah: dataPemeriksaan.asal_darah || '',
                no_kantong: dataPemeriksaan.no_kantong || '',
                // set komponen_darah ke ID dari list_komponen — agar q-select bisa menampilkan labelnya
                komponen_darah: komponenValue !== null ? komponenValue : (dataPemeriksaan.komponen_darah || ''),
                golongan_darah: dataPemeriksaan.golongan_darah || '',
                uji_silang_serasi: dataPemeriksaan.uji_silang_serasi || '',
                konfirm_gol_pasien: dataPemeriksaan.konfirm_gol_pasien || '',
                konfirm_rhesus_pasien: dataPemeriksaan.konfirm_rhesus_pasien || '',
                konfirm_gol_donor: dataPemeriksaan.konfirm_gol_donor || '',
                konfirm_rhesus_donor: dataPemeriksaan.konfirm_rhesus_donor || '',
                uji_silang_konfirmasi: dataPemeriksaan.uji_silang_konfirmasi || '',
                // format untuk datetime-local
                pemeriksaan_at: this.formatDatetimeLocal(dataPemeriksaan.pemeriksaan_at || dataPemeriksaan.pemeriksaan_created || '')
            };

            // set mode edit
            this.pemeriksaanEditMode = true;
            this.pemeriksaanEditId = pemeriksaanId;

            // buka modal pemeriksaan (reuse modal add)
            this.mdl_pemeriksaan = true;
        },

        async submitPemeriksaan() {
            console.log('submitPemeriksaan: editMode=', this.pemeriksaanEditMode, 'editId=', this.pemeriksaanEditId);
            if (this.pemeriksaanEditMode) {
                await this.updatePemeriksaan();
            } else {
                await this.addPemeriksaan();
            }
        },


        // update pemeriksaan yang sudah ada
        async updatePemeriksaan() {
            if (!this.pemeriksaanEditId) {
                this.$q.notify({ type: 'negative', message: 'ID pemeriksaan tidak ditemukan.' });
                return;
            }

            if (!this.pemeriksaanForm.no_kantong || !this.pemeriksaanForm.komponen_darah) {
                this.$q.notify({ type: 'negative', message: 'Mohon isi No. Kantong dan Komponen Darah.' });
                return;
            }

            this.loadingPemeriksaan = true;
            try {
                const baseURL = this.$store?.state?.url?.REAKSI_TRANSFUSI
                    || ((this.$store?.state?.url?.BASE || '') + 'api/v1/reaksi_transfusi/');
                const url = baseURL + 'pemeriksaan/edit';

                // Include pemeriksaan id
                const payload = Object.assign({}, this.pemeriksaanForm, { id: this.pemeriksaanEditId });

                console.log('updatePemeriksaan payload:', payload);

                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: 'kikensbatara ' + (localStorage.token || '')
                    },
                    body: JSON.stringify(payload)
                });

                const json = await res.json().catch(() => ({ success: false, message: 'Response parse error' }));

                if (res.ok && (json.success || json.status)) {
                    this.$q.notify({ type: 'positive', message: json.message || 'Pemeriksaan berhasil diperbarui.' });
                    this.mdl_pemeriksaan = false;

                    // reset edit mode
                    this.pemeriksaanEditMode = false;
                    this.pemeriksaanEditId = null;

                    // refresh daftar & view
                    this.getView();

                    // Jika server mengembalikan data pemeriksaan baru, perbarui viewPemeriksaan
                    if (json.data) {
                        this.viewPemeriksaan = json.data;
                    }
                } else {
                    console.error('updatePemeriksaan failed:', res.status, json);
                    this.$q.notify({ type: 'negative', message: json.message || `Gagal memperbarui pemeriksaan (${res.status})` });
                }
            } catch (err) {
                console.error('updatePemeriksaan error', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memperbarui pemeriksaan.' });
            } finally {
                this.loadingPemeriksaan = false;
            }
        },



        getKomponen() {
            fetch(this.$store.state.url.KOMPONEN + "view", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({})
            })
                .then(res => res.json())
                .then(res_data => {
                    this.list_komponen = res_data.data || []
                })
                .catch(err => console.error("Error getKomponen:", err))
        },

        openLihatDokumen(item) {
            this.loadingPdfId = item.id;

            if (!item || !item.id) {
                this.$q.notify({ type: 'negative', message: 'Data tidak valid' });
                return;
            }

            const token = localStorage.token || '';
            if (!token) {
                this.$q.notify({ type: 'negative', message: 'Token autentikasi tidak ditemukan. Silakan login ulang.' });
                return;
            }

            const base = this.$store?.state?.url?.REAKSI_TRANSFUSI
                || ((this.$store?.state?.url?.BASE || '') + 'api/v1/reaksi_transfusi/');
            const url = base + 'pemeriksaan/pdf?reaksi_id=' + encodeURIComponent(item.id); // Tanpa token di URL

            // Fetch PDF dengan header Authorization
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'kikensbatara ' + token,
                    'Content-Type': 'application/pdf'
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Gagal memuat PDF: ' + response.status);
                    }
                    return response.blob();
                })
                .then(blob => {
                    // Buat URL blob dan buka di tab baru (tanpa token di URL)
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank');
                })
                .catch(error => {
                    console.error('Error opening PDF:', error);
                    this.$q.notify({ type: 'negative', message: 'Gagal membuka dokumen. Periksa koneksi atau coba lagi.' });
                })
                .finally(() => {
                    this.loadingPdfId = null;
                });
        },

        async loadPdfInModal(pdfUrl) {
            this.loadingPdf = true;
            this.pdfUrl = null;
            this.pdfName = 'reaksi_transfusi.pdf';
            this.mdl_pdf_view = true;
            try {
                // Fetch PDF sebagai blob dengan header Authorization
                const response = await fetch(pdfUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'kikensbatara ' + (localStorage.token || ''),
                        'Content-Type': 'application/pdf' // Opsional, untuk memastikan
                    }
                });
                if (!response.ok) {
                    throw new Error(`Gagal memuat PDF: ${response.status} - ${response.statusText}`);
                }
                const blob = await response.blob();
                this.pdfUrl = URL.createObjectURL(blob);
            } catch (error) {
                console.error('Error loading PDF in modal:', error);
                this.$q.notify({ type: 'negative', message: 'Gagal memuat PDF. Periksa koneksi atau data.' });
                this.closePdfModal(); // Tutup modal jika error
            } finally {
                this.loadingPdf = false;
            }
        },

        downloadPdf() {
            if (!this.pdfUrl) {
                this.$q.notify({ type: 'negative', message: 'Tidak ada PDF untuk didownload.' });
                return;
            }
            const a = document.createElement('a');
            a.href = this.pdfUrl;
            a.download = this.pdfName || 'reaksi_transfusi.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        },
        closePdfModal() {
            if (this.pdfUrl && this.pdfUrl.startsWith('blob:')) {
                URL.revokeObjectURL(this.pdfUrl);
            }
            this.pdfUrl = null;
            this.pdfName = null;
            this.mdl_pdf_view = false;
        },

        formatDatetimeLocal(dateStr) {
            if (!dateStr) return '';

            // 1. Ubah string dari database menjadi Objek Date
            // Browser otomatis akan mengonversi UTC ke Waktu Lokal (WIB/WITA/WIT) di sini
            const d = new Date(dateStr);

            // Validasi jika tanggal error/invalid
            if (isNaN(d.getTime())) return '';

            // 2. Ambil komponen waktu berdasarkan LOKAL komputer user
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0'); // Ingat: getMonth() mulai dari 0
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');     // Ini akan mengambil jam lokal, bukan UTC
            const minutes = String(d.getMinutes()).padStart(2, '0');

            // 3. Gabungkan menjadi format string yang diterima input datetime-local (YYYY-MM-DDTHH:mm)
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        },

        openEdit(data) {
            // Copy data dari baris tabel ke form_edit
            this.form_edit = {
                id: data.id,
                permintaan_id: data.permintaan_id,
                // Format tanggal agar terbaca di input type="datetime-local"
                jam_transfusi: this.formatDatetimeLocal(data.jam_transfusi),
                jenis_reaksi: data.jenis_reaksi,
                jam_terjadi: this.formatDatetimeLocal(data.jam_terjadi),
                jam_dilaporkan: this.formatDatetimeLocal(data.jam_dilaporkan),
                petugas_pelapor: data.petugas_pelapor,
                tindakan: data.tindakan
            };

            this.mdl_edit = true;
        },

        updateData() {
            this.btn_edit = true;
            const baseURL = this.$store.state.url.REAKSI_TRANSFUSI
                || (this.$store.state.url.BASE || '') + "api/v1/reaksi_transfusi/";

            fetch(baseURL + "editData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(this.form_edit)
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success || res_data.status) {
                        this.$q.notify({
                            type: "positive",
                            message: res_data.message || "Data berhasil diperbarui"
                        });
                        this.mdl_edit = false;
                        this.getView(); // Refresh tabel
                    } else {
                        this.$q.notify({
                            type: "negative",
                            message: res_data.message || "Gagal memperbarui data"
                        });
                    }
                })
                .catch(err => {
                    console.error("Error updateData:", err);
                    this.$q.notify({
                        type: "negative",
                        message: "Terjadi kesalahan saat menyimpan perubahan"
                    });
                })
                .finally(() => {
                    this.btn_edit = false;
                });
        },

        openDelete(data) {
            // Simpan ID yang akan dihapus
            this.delete_id = data.id;
            // Buka modal konfirmasi
            this.mdl_delete = true;
        },

        deleteData() {
            this.btn_delete = true;

            const baseURL = this.$store.state.url.REAKSI_TRANSFUSI
                || (this.$store.state.url.BASE || '') + "api/v1/reaksi_transfusi/";

            fetch(baseURL + "delete", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({ id: this.delete_id }) // Kirim hanya ID
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success || res_data.status) {
                        this.$q.notify({
                            type: "positive",
                            message: res_data.message || "Data berhasil dihapus"
                        });
                        this.mdl_delete = false;
                        this.getView(); // Refresh tabel
                    } else {
                        this.$q.notify({
                            type: "negative",
                            message: res_data.message || "Gagal menghapus data"
                        });
                    }
                })
                .catch(err => {
                    console.error("Error deleteData:", err);
                    this.$q.notify({
                        type: "negative",
                        message: "Terjadi kesalahan saat menghapus data"
                    });
                })
                .finally(() => {
                    this.btn_delete = false;
                    this.delete_id = null; // Reset ID
                });
        },



        indexing(idx) {
            return ((this.page_first - 1) * this.page_limit) + idx
        },

        formatTanggal(dt) {
            if (!dt) return '-'
            const d = new Date(dt)
            if (isNaN(d)) return dt
            return d.toLocaleString('id-ID', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },

        cari_data() {
            this.page_first = 1
            this.getView()
        },

        // 🔹 Terapkan filter
        applyFilter() {
            this.page_first = 1;
            this.getView();
        },
    },

    mounted() {
        try {
            const get_profile = JSON.parse(localStorage.profile || '{}')
            if (get_profile && get_profile.profile) {
                this.tipe = Number(get_profile.profile.stokdarah_konut)
                this.user = get_profile
                // jika admin ruangan otomatis isi rumah_sakit_id / ruangan_id jika tersedia di profile
                if (get_profile.profile.ruangan_id) {
                    this.form.ruangan_id = Number(get_profile.profile.ruangan_id)
                }
                if (get_profile.profile.rumah_sakit_id) {
                    this.form.rumah_sakit_id = Number(get_profile.profile.rumah_sakit_id)
                }
            }
        } catch (e) {
            console.warn('Gagal parse localStorage.profile', e)
        }
        this.getData();
        this.getKomponen();
        this.getView();
    }
}
</script>

<style scoped>
.tbl_responsive {
    overflow: auto;
}

.h_table_head {
    background: #333;
}

.h_table_body td {
    padding: 10px 8px;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
}

.text-right {
    text-align: right;
}

.text-center {
    text-align: center;
}

.detail-table {
    border: 1px solid #eee;
    border-radius: 6px;
    padding: 12px;
    background: #fff;
}

.detail-row {
    padding: 8px 0;
    border-bottom: 1px dashed #f0f0f0;
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.detail-value {
    color: #444;
    font-size: 14px;
    word-break: break-word;
}
</style>