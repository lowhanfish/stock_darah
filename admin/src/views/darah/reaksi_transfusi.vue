<template>
    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <!-- ================= HEADER ================= -->
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Reaksi Transfusi</div>
                    </div>
                    <div class="col-12 col-md-2"></div>
                    <div class="col-12 col-md-4">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true"
                                class="bg-white" style="width:90%" />
                            <q-btn glossy class="main1x" @click="mdl_add = true" dense flat icon="add"
                                style="width:10%">
                                <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                                    Tambah Reaksi
                                </q-tooltip>
                            </q-btn>
                        </div>
                    </div>
                </div>
            </q-card-section>

        </q-card>


        <hr class="hrpagin2">

        <!-- ================= FILTER ================= -->
        <div class="row q-col-gutter-md">

            <!-- Filter Komponen -->
            <div class="col-12 col-md-4">
                <span class="h_lable">Komponen</span>
                <q-select v-model="filter.komponen_id" :options="list_komponen" option-label="nama_komponen"
                    option-value="id" emit-value map-options outlined dense class="bg-white" @input="applyFilter" />
            </div>

            <!-- Filter Golongan Darah -->
            <div class="col-12 col-md-4">
                <span class="h_lable">Golongan Darah</span>

            </div>

            <!-- Filter Tipe Transaksi -->
            <div class="col-12 col-md-4">
                <span class="h_lable">Tipe Transaksi</span>
                <q-select v-model="filter.tipe_transaksi" :options="['masuk', 'keluar']" outlined dense class="bg-white"
                    @input="applyFilter" />
            </div>

        </div>

        <hr class="hrpagin2" />

        <!-- <q-separator dark inset /> -->

        <!-- ================= TABLE ================= -->

        <div class="tbl_responsive">
            <table width="100%">
                <thead class="h_table_head main2x text-white">
                    <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="5%" class="text-center">Reaksi Transfusi</th>
                        <th width="15%" class="text-center">Nama Pasien </th>
                        <th width="10%" class="text-center">Waktu Transfusi</th>
                        <th width="10%">Jenis Reaksi</th>
                        <th width="10%" class="text-center">Waktu Terjadi Reaksi</th>
                        <th width="10%" class="text-center">Waktu dilaporkan</th>
                        <th width="10%">Petugas Pelapor</th>
                        <th width="15%" class="text-center">Tindakan</th>
                        <th width="10%" class="text-center">Aksi</th>
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

                            <!-- Role 1/2 (UPD) atau lainnya -->
                            <!-- Role 1 & 2 (Admin UPD) -->
                            <template v-else>

                                <!-- Jika status = 'terkirim' → UPD harus isi pemeriksaan -->
                                <q-btn v-if="data.status === 'terkirim'" color="light-green-6" icon="medical_services"
                                    class="main1x" @click="openPemeriksaanModal(data)">
                                    <q-tooltip content-class="bg-green-7">Lanjut Pemeriksaan Pretransfusi</q-tooltip>
                                </q-btn>

                                <!-- Jika status = 'unduh' → tampilkan tombol unduh dokumen -->
                                <q-btn v-else-if="data.status === 'unduh'" color="primary" icon="document_scanner"
                                    class="main1x" @click="openLihatDokumen(data)">
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

                                Ruangan: {{ data.nama_ruangan }}

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
                            <!-- Role 3: tombol muncul tapi edit/delete disabled jika status 'terkirim' -->
                            <template v-if="Number(tipe) === 3">
                                <q-btn dense round color="warning" icon="edit" :disable="data.status === 'terkirim'"
                                    @click="openEdit(data)">
                                    <q-tooltip v-if="data.status === 'terkirim'">Tidak bisa diedit setelah
                                        dikirim</q-tooltip>
                                    <q-tooltip v-else>Edit</q-tooltip>
                                </q-btn>

                                <q-btn dense round color="negative" icon="delete" :disable="data.status === 'terkirim'"
                                    @click="openDelete(data)">
                                    <q-tooltip v-if="data.status === 'terkirim'">Tidak bisa dihapus setelah
                                        dikirim</q-tooltip>
                                    <q-tooltip v-else>Hapus</q-tooltip>
                                </q-btn>

                                <q-btn dense round color="primary" icon="visibility" @click="openLihat(data)">
                                    <q-tooltip>Lihat</q-tooltip>
                                </q-btn>
                            </template>

                            <!-- Role 1 / 2: tombol sama, tetapi aktif walau status 'terkirim' -->
                            <template v-else>
                                <q-btn dense round color="warning" icon="edit" @click="openEdit(data)">
                                    <q-tooltip>Edit (UPD)</q-tooltip>
                                </q-btn>

                                <q-btn dense round color="negative" icon="delete" @click="openDelete(data)">
                                    <q-tooltip>Hapus (UPD)</q-tooltip>
                                </q-btn>

                                <q-btn dense round color="primary" icon="visibility" @click="openLihat(data)">
                                    <q-tooltip>Lihat</q-tooltip>
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
                <q-card-section class="q-pt-none text-center orageGrad">
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

                <form @submit.prevent="addPemeriksaan">
                    <q-card-section class="q-pt-none">

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
                            <div>
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
                        </div>
                    </div>
                </q-card-section>


                <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    <q-btn label="Tutup" color="negative" v-close-popup @click="mdl_view = false" />
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

            mdl_hapus: false,      // modal konfirmasi hapus
            btn_hapus: false,      // loading untuk tombol hapus
            hapus_target: null,
            filter: {
                komponen_id: '',
                tipe_transaksi: ''
            },
            // tambahan untuk modal pemeriksaan UPD
            modalPemeriksaanOpen: false,
            mdl_pemeriksaan: false,
            pemeriksaanForm: {
                reaksi_id: null,
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

            // konstanta status (string)
            STATUS_DRAFT: 'draft',
            STATUS_TERKIRIM: 'terkirim',
            loadingKirim: false,
            mdl_view: false,
            loadingView: false,
            viewPemeriksaan: null,
            // tambahkan ini di object data()
            mdl_pdf_view: false,      // kontrol modal preview PDF
            loadingPdf: false,        // loading spinner saat fetch pdf
            pdfUrl: null,             // object URL (blob:) atau direct URL
            pdfName: null,            // nama file untuk download

        }
    },
    methods: {

        cancelKirim() {
            this.kirim_target = null;
            this.mdl_kirim = false;
        },

        // async confirmKirim() {
        //     if (!this.kirim_target || !this.kirim_target.id) {
        //         this.mdl_kirim = false;
        //         return;
        //     }
        //     const id = this.kirim_target.id;
        //     const base = this.$store.state.url.REAKSI_TRANSFUSI;

        //     try {
        //         await fetch(base + id + "/send", {
        //             method: "POST",
        //             headers: {
        //                 "content-type": "application/json",
        //                 authorization: "kikensbatara " + (localStorage.token || '')
        //             },
        //             body: JSON.stringify({ status: "terkirim" })
        //         });
        //     } catch (e) {
        //         // silent fail agar minimal; Anda bisa tambah notif jika mau
        //         console.error('confirmKirim error', e);
        //     }

        //     // update UI lokal & tutup modal
        //     try { this.kirim_target.status = "terkirim"; } catch (e) { }
        //     this.kirim_target = null;
        //     this.mdl_kirim = false;
        //     this.getView();
        // },

        // openPemeriksaan baru: hanya routing keputusan
        /**
 * buka modal pemeriksaan (dipanggil dari tombol openPemeriksaan)
 * pastikan data.id dikirim sebagai reaksi_id
 */
        openPemeriksaanModal(item) {
            this.pemeriksaanForm = {
                reaksi_id: item.id,
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
                pemeriksaan_at: '' // optional prefill: new Date().toISOString().slice(0,16)
            };
            this.mdl_pemeriksaan = true;
        },

        cancelPemeriksaan() {
            this.mdl_pemeriksaan = false;
            // optionally reset form
            // this.pemeriksaanForm = {...}
        },

        async addPemeriksaan() {
            if (!this.pemeriksaanForm.reaksi_id) {
                this.$q.notify({ type: 'negative', message: 'Target reaksi tidak ditemukan.' });
                return;
            }
            // minimal validation: nomor kantong dan komponen wajib (ubah sesuai kebutuhan)
            if (!this.pemeriksaanForm.no_kantong || !this.pemeriksaanForm.komponen_darah) {
                this.$q.notify({ type: 'negative', message: 'Mohon isi No. Kantong dan Komponen Darah.' });
                return;
            }

            this.loadingPemeriksaan = true;
            const baseURL = this.$store?.state?.url?.REAKSI_TRANSFUSI
                || ((this.$store?.state?.url?.BASE || '') + 'api/v1/reaksi_transfusi/');
            // default endpoint (sesuaikan bila perlu)
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

                    // tutup modal & reset
                    this.mdl_pemeriksaan = false;

                    // opsional: update status reaksi (jika backend mengatur status)
                    this.getView()

                    // jika respon mengembalikan data, Anda bisa gunakan untuk update UI langsung
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
                // jangan fetch di sini — panggil openKirimConfirmation yang hanya buka modal
                this.openKirimConfirmation(data);
                return;
            }

            // UPD (role 1/2) jika status 'terkirim' -> langsung buka modal pemeriksaan
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

        // async addPemeriksaan() {
        //     if (!this.pemeriksaanForm.reaksi_id) {
        //         this.$q.notify({ type: 'negative', message: 'Target reaksi tidak ditemukan.' });
        //         return;
        //     }
        //     // minimal validation: nomor kantong dan komponen wajib (ubah sesuai kebutuhan)
        //     if (!this.pemeriksaanForm.no_kantong || !this.pemeriksaanForm.komponen_darah) {
        //         this.$q.notify({ type: 'negative', message: 'Mohon isi No. Kantong dan Komponen Darah.' });
        //         return;
        //     }

        //     this.loadingPemeriksaan = true;
        //     const baseURL = this.$store?.state?.url?.REAKSI_TRANSFUSI
        //         || ((this.$store?.state?.url?.BASE || '') + 'api/v1/reaksi_transfusi/');
        //     // default endpoint (sesuaikan bila perlu)
        //     const url = baseURL + 'pemeriksaan/add';

        //     try {
        //         const res = await fetch(url, {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 authorization: 'kikensbatara ' + (localStorage.token || '')
        //             },
        //             body: JSON.stringify(this.pemeriksaanForm)
        //         });

        //         const json = await res.json().catch(() => ({ success: false, message: 'Response parse error' }));

        //         if (res.ok && (json.success || json.status)) {
        //             this.$q.notify({ type: 'positive', message: json.message || 'Pemeriksaan berhasil disimpan.' });

        //             // tutup modal & reset
        //             this.mdl_pemeriksaan = false;

        //             // opsional: update status reaksi (jika backend mengatur status)
        //             this.getView()

        //             // jika respon mengembalikan data, Anda bisa gunakan untuk update UI langsung
        //         } else {
        //             this.$q.notify({ type: 'negative', message: json.message || `Gagal menyimpan pemeriksaan (${res.status})` });
        //         }
        //     } catch (err) {
        //         console.error('addPemeriksaan error', err);
        //         this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat menyimpan pemeriksaan.' });
        //     } finally {
        //         this.loadingPemeriksaan = false;
        //     }
        // },

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

                // jika Anda menambahkan ruangan_id saat mounted
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
        if (!item || !item.id) {
            this.$q.notify({ type: 'negative', message: 'Data tidak valid' });
            return;
        }
        // Ambil token dari localStorage
        const token = localStorage.token || '';
        if (!token) {
            this.$q.notify({ type: 'negative', message: 'Token autentikasi tidak ditemukan. Silakan login ulang.' });
            return;
        }
        // Build base URL (sesuaikan dengan store Anda)
        const base = this.$store?.state?.url?.REAKSI_TRANSFUSI
            || ((this.$store?.state?.url?.BASE || '') + 'api/v1/reaksi_transfusi/');
        // Tambahkan token sebagai query param agar dikirim ke backend
        const url = base + 'pemeriksaan/pdf?reaksi_id=' + encodeURIComponent(item.id) + '&token=' + encodeURIComponent(token);
        // Opsi 1: Buka di tab baru (default, seperti asli, tapi dengan token)
        try {
            window.open(url, '_blank');
        } catch (e) {
            console.error('Error opening PDF in new tab:', e);
            this.$q.notify({ type: 'negative', message: 'Gagal membuka dokumen. Periksa koneksi atau coba lagi.' });
        }
        // Opsi 2 (Alternatif): Gunakan modal preview PDF (jika ingin preview inline)
        // Uncomment baris di bawah jika ingin ganti ke modal alih-alih tab baru
        // this.loadPdfInModal(url);
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

// Fungsi untuk download PDF (jika ingin tombol download di modal)
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
    // Fungsi untuk tutup modal PDF
    closePdfModal() {
        if (this.pdfUrl && this.pdfUrl.startsWith('blob:')) {
            URL.revokeObjectURL(this.pdfUrl); // Bersihkan memory
        }
        this.pdfUrl = null;
        this.pdfName = null;
        this.mdl_pdf_view = false;
    },



        // buka modal hapus
        openDelete(data) {
            this.hapus_target = data;
            this.mdl_hapus = true;
        },

        // konfirmasi hapus (panggil backend)
        confirmDelete() {
            if (!this.hapus_target || !this.hapus_target.id_transaksi) {
                this.$q.notify({ type: 'negative', message: 'Tidak ada transaksi yang dipilih' });
                return;
            }

            this.btn_hapus = true;

            fetch(this.$store.state.url.TRANSAKSI + "delete/" + this.hapus_target.id_transaksi, {
                method: "DELETE",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.$q.notify({ type: 'positive', message: res_data.message || 'Transaksi berhasil dihapus' });
                        this.mdl_hapus = false;
                        this.hapus_target = null;
                        // reload current page (tetap di halaman sama)
                        this.getView();
                    } else {
                        this.$q.notify({ type: 'negative', message: res_data.message || 'Gagal menghapus transaksi' });
                    }
                })
                .catch(err => {
                    console.error('Error delete transaksi:', err);
                    this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat menghapus transaksi' });
                })
                .finally(() => {
                    this.btn_hapus = false;
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