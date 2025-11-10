<template>
    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <!-- ================= HEADER ================= -->
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Permintaan Darah</div>
                    </div>
                    <div class="col-12 col-md-2"></div>
                    <div class="col-12 col-md-4">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true"
                                class="bg-white" style="width:90%" />
                            <!-- Tombol tambah hanya untuk tipe = 3 (Admin Ruangan) -->
                            <q-btn v-if="tipe === 3" glossy class="main1x" @click="mdl_add = true" dense flat icon="add"
                                style="width:10%">
                                <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                                    Tambah Permintaan
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

            <div class="col-12 col-md-4">
                <span class="h_lable">Golongan Darah</span>
                <q-select v-model="filter.golongan_darah" :options="['A', 'B', 'O', 'AB']" outlined dense
                    class="bg-white" @input="applyFilter" />
            </div>

            <div class="col-12 col-md-4">
                <span class="h_lable">Komponen</span>
                <q-select v-model="filter.komponen_id" :options="list_komponen" option-label="nama_komponen"
                    option-value="id" emit-value map-options outlined dense class="bg-white" @input="applyFilter" />
            </div>

            <div class="col-12 col-md-4">
                <span class="h_lable">Status</span>
                <q-select v-model="filter.status" :options="statusOptions" outlined dense class="bg-white"
                    @input="applyFilter" />
            </div>

        </div>

        <hr class="hrpagin2" />

        <!-- ================= TABLE ================= -->
        <div class="tbl_responsive">
            <table width="100%">
                <thead class="h_table_head main2x text-white">
                    <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="5%">Status</th>
                        <th width="15%">Nama Pasien</th>
                        <th width="15%">Tgl Lahir</th>
                        <th width="5%">Gol.Darah</th>
                        <th width="20%">Komponen</th>
                        <th width="5%" class="text-center">Jumlah (Kantong)</th>
                        <th width="15%">Tgl Permintaan</th>
                        <th width="15%" class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>
                        <td class="text-center">
                            <!-- <div>
                                <strong>{{ statusText(data.status) }}</strong>
                                <div v-if="data.status === 4 && data.status_keterangan" class="text-caption text-bold text-red">
                                    {{ data.status_keterangan }} <br>
                                </div>
                            </div> -->
                            <a href="javascript:void(0)" class="removeTextDecoration" @click="lihatKeterangan(data)">
                                <q-btn v-if="Number(data.status) === 1" round glossy size="xs" color="orange"
                                    icon="hourglass_empty" />
                                <q-btn v-else-if="Number(data.status) === 2" round glossy size="xs" color="info"
                                    icon="pending_actions" />
                                <q-btn v-else-if="Number(data.status) === 3" round glossy size="xs" color="green"
                                    icon="done" />
                                <q-btn v-else-if="Number(data.status) === 4" round glossy size="xs" color="negative"
                                    icon="close" />
                            </a>
                        </td>
                        <td>
                            <div>
                                {{ data.nama_pasien }}
                            </div>
                            <div class="text-blue text-bold" style="font-size: 12px;">

                                Ruangan: {{ data.nama_ruangan }}

                            </div>
                        </td>
                        <td>
                            <div>
                                {{ UMUM.tglConvert(data.tanggal_lahir) }}
                            </div>
                            <div class="text-blue text-bold" style="font-size: 12px;">

                                Usia: {{ UMUM.hitungUsia(data.tanggal_lahir) }} Tahun

                            </div>
                        </td>
                        <td class="text-center">{{ data.golongan_darah }}{{ data.rhesus }}</td>
                        <td>{{ data.nama_komponen || '-' }}</td>
                        <td class="text-center">{{ data.jumlah_kantong }}</td>
                        <td>{{ UMUM.tglConvert(data.tanggal_permintaan) }}</td>

                        <td class="text-center q-gutter-sm">
                            <!-- untuk sekarang hanya lihat detail; aksi lanjutan (edit/verif) nanti -->
                            <q-btn dense round color="primary" icon="visibility" @click="openLihat(data)">
                                <q-tooltip content-class="bg-blue-7">Lihat Detail</q-tooltip>
                            </q-btn>
                            <q-btn dense round color="warning" icon="edit" :disable="Number(data.status) === 3"
                                @click="openEdit(data)">
                                <q-tooltip v-if="Number(data.status) === 3" content-class="bg-amber-7">
                                    Tidak dapat edit — permintaan sudah Disetujui
                                </q-tooltip>
                                <q-tooltip v-else content-class="bg-amber-7">Edit Permintaan</q-tooltip>
                            </q-btn>

                            <q-btn dense round color="negative" icon="delete"
                                :disable="Number(data.status) === 2 || Number(data.status) === 3"
                                @click="openDelete(data)">
                                <q-tooltip content-class="bg-red-7">
                                    {{
                                (Number(data.status) === 2 || Number(data.status) === 3)
                                    ? 'Tidak dapat dihapus (sedang diperiksa / disetujui)'
                                    : 'Hapus Permintaan'
                            }}
                                </q-tooltip>
                            </q-btn>



                        </td>
                    </tr>

                    <tr v-if="list_data.length === 0">
                        <td colspan="9" class="text-center text-grey">
                            Belum ada data permintaan.
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

        <!-- ===================== MODAL ADD ===================== -->
        <q-dialog v-model="mdl_add" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Tambah Permintaan Darah</div>
                </q-card-section>

                <form @submit.prevent="addData">
                    <q-card-section class="q-pt-none">
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Nama Dokter</span>
                                <q-input v-model="form.nama_dokter" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Ruangan</span>
                                <q-select v-model="form.ruangan_id" :options="list_ruangan" option-value="id"
                                    option-label="nama_ruangan" emit-value map-options outlined square :dense="true"
                                    readonly class="bg-white margin_btn" required />
                            </div>
                        </div>

                        <span class="h_lable">Nama Pasien</span>
                        <q-input v-model="form.nama_pasien" outlined square :dense="true" class="bg-white margin_btn"
                            required />


                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Jenis Kelamin</span>
                                <q-select v-model="form.jenis_kelamin"
                                    :options="[{ label: 'Laki-laki', value: 'L' }, { label: 'Perempuan', value: 'P' }]"
                                    option-value="value" option-label="label" emit-value map-options outlined square
                                    :dense="true" class="bg-white margin_btn" required />
                            </div>



                            <div class="col-12 col-md-4">
                                <span class="h_lable">Nomor RM</span>
                                <q-input v-model="form.nomor_rm" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Tanggal Lahir</span>
                                <q-input v-model="form.tanggal_lahir" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                        </div>

                        <div v-if="form.jenis_kelamin === 'P'">
                            <hr class="hrpagin2" />
                            <div class="text-subtitle2 q-mb-sm">Khusus Pasien Wanita</div>

                            <div class="row q-col-gutter-md">
                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Jumlah Kehamilan Sebelumnya</span>
                                    <q-input v-model.number="form.jumlah_kehamilan" type="number" min="0" outlined
                                        square :dense="true" class="bg-white margin_btn"
                                        :rules="[val => (form.jenis_kelamin === 'P' ? (val !== null && val !== '' ? true : 'Harus diisi') : true)]" />
                                </div>

                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Pernah Abortus</span>
                                    <q-option-group v-model="form.pernah_abortus"
                                        :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                        type="radio" inline />
                                </div>

                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Pernah HDN (penyakit hemolitik bayi)</span>
                                    <q-option-group v-model="form.pernah_hdn"
                                        :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                        type="radio" inline />
                                </div>
                            </div>
                            <hr class="hrpagin2" />
                        </div>


                        <span class="h_lable">Alamat</span>
                        <q-input v-model="form.alamat" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Nama Wali</span>
                                <q-input v-model="form.nama_wali" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Kadar HB (g/dL)</span>
                                <q-input v-model.number="form.kadar_hb" type="number" step="0.1" outlined square
                                    :dense="true" class="bg-white margin_btn" />
                            </div>
                        </div>



                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Golongan Darah</span>
                                <q-select v-model="form.golongan_darah" :options="['A', 'B', 'O', 'AB']" outlined square
                                    :dense="true" class="bg-white margin_btn" required />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Rhesus</span>
                                <q-select v-model="form.rhesus" :options="['+', '-']" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Komponen</span>
                                <q-select v-model="form.komponen_id" :options="list_komponen" option-value="id"
                                    option-label="nama_komponen" emit-value map-options outlined dense
                                    class="bg-white margin_btn" required />
                            </div>
                        </div>

                        <span class="h_lable">Jumlah (Kantong)</span>
                        <q-input v-model.number="form.jumlah_kantong" type="number" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Permintaan</span>
                                <q-input v-model="form.tanggal_permintaan" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Diperlukan</span>
                                <q-input v-model="form.tanggal_diperlukan" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                        </div>

                        <span class="h_lable">Diagnosis Klinis</span>
                        <q-input v-model="form.diagnosis_klinis" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <span class="h_lable">Alasan Transfusi</span>
                        <q-input v-model="form.alasan_transfusi" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_add" color="primary" type="submit" label="Simpan" />
                        <q-btn label="Batal" color="negative" v-close-popup @click="resetForm" />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>

        <!-- ===================== MODAL LIHAT DETAIL ===================== -->
        <q-dialog v-model="mdl_lihat" persistent>
            <q-card class="mdl-md">
                <!-- Header -->
                <q-card-section class="bg-orange text-white row items-center justify-between">
                    <div class="text-h6 h_modalhead">Detail Permintaan Darah</div>
                    <q-btn flat round dense icon="close" color="white" v-close-popup @click="lihat_target = null"
                        class="q-ml-sm">
                        <q-tooltip content-class="bg-red">Tutup</q-tooltip>
                    </q-btn>
                </q-card-section>

                <!-- Body -->
                <q-card-section>
                    <div v-if="lihat_target">
                        <!-- Ringkas info utama -->
                        <div class="row q-col-gutter-md items-center">
                            <div class="col-12 col-md-3">
                                <div class="text-subtitle2">Nama Pasien</div>
                                <div class="text-body1 text-bold text-grey">{{ lihat_target.nama_pasien }}</div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="text-subtitle2">Dokter</div>
                                <div class="text-body1 text-bold text-grey">{{ lihat_target.nama_dokter }}</div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="text-subtitle2">Ruangan</div>
                                <div class="text-body1 text-bold text-grey">{{ lihat_target.nama_ruangan }}</div>
                            </div>
                            <div class="col-6 col-md-3">
                                <div class="text-subtitle2">Tanggal Permintaan</div>
                                <div class="text-body1 text-bold text-grey">{{
                                UMUM.tglConvert(lihat_target.tanggal_permintaan) }}</div>
                            </div>
                        </div>

                        <q-separator spaced />

                        <!-- Detail terstruktur -->
                        <q-list bordered dense class="rounded-borders">
                            <q-item>
                                <q-item-section>
                                    <q-item-label caption>Komponen</q-item-label>
                                    <q-item-label>{{ lihat_target.nama_komponen }}</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-item-label caption>Jumlah</q-item-label>
                                    <q-item-label class="text-weight-medium">
                                        {{ lihat_target.jumlah_kantong }} Kantong
                                    </q-item-label>
                                </q-item-section>
                            </q-item>

                            <q-separator inset />

                            <q-item>
                                <q-item-section>
                                    <q-item-label caption>Status</q-item-label>
                                    <q-item-label>
                                        <q-chip :color="statusColor(lihat_target.status)" text-color="white" size="sm"
                                            class="q-mr-sm">
                                            {{ statusText(lihat_target.status) }}
                                        </q-chip>
                                    </q-item-label>
                                </q-item-section>

                                <!-- <q-item-section v-if="lihat_target.status_keterangan" side>
                                    <q-item-label caption>Keterangan</q-item-label>
                                    <q-item-label>{{ lihat_target.status_keterangan }}</q-item-label>
                                </q-item-section> -->
                            </q-item>
                        </q-list>

                        <div class="q-mt-md">
                            <div class="text-subtitle2 q-mb-xs">Diagnosis</div>
                            <div class="text-body1">{{ lihat_target.diagnosis_klinis }}</div>
                        </div>

                        <div class="q-mt-md">
                            <div class="text-subtitle2 q-mb-xs">Alasan Transfusi</div>
                            <div class="text-body1">{{ lihat_target.alasan_transfusi }}</div>
                        </div>
                    </div>

                    <div v-if="lihat_target && lihat_target.jenis_kelamin === 'P'" class="q-mt-md">
                        <q-separator spaced />
                        <div class="text-subtitle1 text-weight-medium q-mb-sm">
                            Khusus Pasien Wanita
                        </div>

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Jumlah Kehamilan Sebelumnya</div>
                                <div class="text-body1">
                                    {{ lihat_target.jumlah_kehamilan !== null ? lihat_target.jumlah_kehamilan : '-' }}
                                </div>
                            </div>

                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Pernah Abortus</div>
                                <div class="text-body1">
                                    {{ lihat_target.pernah_abortus || '-' }}
                                </div>
                            </div>

                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Pernah HDN</div>
                                <div class="text-body1">
                                    {{ lihat_target.pernah_hdn || '-' }}
                                </div>
                            </div>
                        </div>
                    </div>


                    <!-- ===== Hasil Pemeriksaan UPD (tampil bila sudah Diperiksa/Disetujui) ===== -->
                    <div v-if="lihat_target && Number(lihat_target.status) >= 3" class="q-mt-md">
                        <hr class="hrpagin2">
                        <q-separator spaced />
                        <div class="text-subtitle1 q-mb-sm text-bold text-center">
                            Hasil Pemeriksaan UPD
                        </div>

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Petugas Pemeriksa</div>
                                <div class="text-body1 text-grey text-bold">{{ lihat_target.petugas_pemeriksa || '-' }}
                                </div>
                            </div>

                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Tanggal Pemeriksaan</div>
                                <div class="text-body1 text-grey text-bold">
                                    {{ lihat_target.tanggal_pemeriksaan ?
                                UMUM.tglConvert(lihat_target.tanggal_pemeriksaan) : '-' }}
                                </div>
                            </div>

                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Golongan Darah Hasil</div>
                                <div class="text-body1 text-grey text-bold">
                                    {{ lihat_target.golongan_darah_hasil || '-' }} {{ lihat_target.rhesus_hasil ?
                                lihat_target.rhesus_hasil : '' }}
                                </div>
                            </div>
                        </div>

                        <div class="row q-col-gutter-md q-mt-sm">
                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Crossmatch 1</div>
                                <div class="text-body1 text-grey text-bold">{{ lihat_target.crossmatch_1 || '-' }}</div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Crossmatch 2</div>
                                <div class="text-body1 text-grey text-bold">{{ lihat_target.crossmatch_2 || '-' }}</div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Crossmatch 3</div>
                                <div class="text-body1 text-grey text-bold">{{ lihat_target.crossmatch_3 || '-' }}</div>
                            </div>
                        </div>

                        <div class="row q-col-gutter-md q-mt-sm">
                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Jumlah Diberikan</div>
                                <div class="text-body1 text-grey text-bold">{{ lihat_target.jumlah_darah_diberikan !==
                                null ?
                                lihat_target.jumlah_darah_diberikan : '-' }} Kantong</div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Nomor Kantong</div>
                                <div class="text-body1 text-grey text-bold">{{ lihat_target.nomor_kantong || '-' }}
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="text-subtitle2">Petugas Pengeluar</div>
                                <div class="text-body1 text-grey text-bold">{{ lihat_target.petugas_pengeluar || '-' }}
                                </div>
                            </div>
                        </div>

                        <div class="row q-col-gutter-md q-mt-sm">
                            <div class="col-12">
                                <div class="text-subtitle2">Penerima Darah</div>
                                <div class="text-body1 text-grey text-bold">{{ lihat_target.penerima_darah || '-' }}
                                </div>
                            </div>
                        </div>

                        <div class="q-mt-sm">
                            <div class="text-subtitle2 q-mb-xs">Catatan Tambahan Pemeriksa</div>
                            <div class="text-body1 text-grey text-bold">{{ lihat_target.catatan_tambahan || '-' }}</div>
                        </div>
                    </div>



                </q-card-section>

                <!-- Footer / Actions -->
                <q-card-actions class="bg-grey-4 mdl-footer">
                    <q-space />

                    <!-- Jika status = 1 (Diajukan) -->
                    <div v-if="lihat_target && Number(lihat_target.status) === 1 && tipe !== 3"
                        class="row items-center q-gutter-sm">
                        <q-btn :loading="btn_periksa" color="primary" label="Diperiksa" dense
                            @click="openPeriksaFor(lihat_target)">
                            <q-tooltip content-class="bg-blue-8">Verifikasi & isi form UPD</q-tooltip>
                        </q-btn>

                        <q-btn :loading="btn_reject" color="negative" label="Ditolak" dense
                            @click="openReject(lihat_target)">
                            <q-tooltip content-class="bg-red-8">Tolak permintaan (wajib isi alasan)</q-tooltip>
                        </q-btn>
                    </div>

                    <!-- Jika status = 2 (Diperiksa) -->
                    <div v-else-if="lihat_target && Number(lihat_target.status) === 2 && tipe !== 3"
                        class="row items-center q-gutter-sm">
                        <q-btn :loading="btn_periksa" color="green" label="Lanjutkan Pemeriksaan" dense
                            @click="openPeriksaFor(lihat_target)">
                            <q-tooltip content-class="bg-green-8">Lanjut isi hasil pemeriksaan UPD</q-tooltip>
                        </q-btn>

                        <q-btn :loading="btn_reject" color="negative" label="Ditolak" dense
                            @click="openReject(lihat_target)">
                            <q-tooltip content-class="bg-red-8">Tolak permintaan (wajib isi alasan)</q-tooltip>
                        </q-btn>
                    </div>

                    <!-- Jika status 3 atau 4 -->
                    <div v-else>
                        <q-btn label="Tutup" color="negative" v-close-popup @click="lihat_target = null" />
                    </div>
                </q-card-actions>

            </q-card>
        </q-dialog>


        <!-- ===================== MODAL EDIT ===================== -->
        <q-dialog v-model="mdl_edit" persistent>
            <q-card class="mdl-md">
                <q-card-section class="bg-orange text-white">
                    <div class="text-h6 h_modalhead">Edit Permintaan Darah</div>
                </q-card-section>

                <form @submit.prevent="submitEdit">
                    <q-card-section class="q-pt-none">
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Nama Dokter</span>
                                <q-input v-model="form_edit.nama_dokter" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Ruangan</span>
                                <q-select v-model="form_edit.ruangan_id" :options="list_ruangan" option-value="id"
                                    option-label="nama_ruangan" emit-value map-options outlined square :dense="true"
                                    class="bg-white margin_btn" :disable="true" />
                                <!-- jika ruangan tidak boleh diubah di edit, buat disable=true -->
                            </div>
                        </div>

                        <span class="h_lable">Nama Pasien</span>
                        <q-input v-model="form_edit.nama_pasien" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Jenis Kelamin</span>
                                <q-select v-model="form_edit.jenis_kelamin"
                                    :options="[{ label: 'Laki-laki', value: 'L' }, { label: 'Perempuan', value: 'P' }]"
                                    option-value="value" option-label="label" emit-value map-options outlined square
                                    :dense="true" class="bg-white margin_btn" required />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Nomor RM</span>
                                <q-input v-model="form_edit.nomor_rm" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Tanggal Lahir</span>
                                <q-input v-model="form_edit.tanggal_lahir" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                        </div>

                        <div v-if="form_edit.jenis_kelamin === 'P'">
                            <hr class="hrpagin2" />
                            <div class="text-subtitle2 q-mb-sm">Khusus Pasien Wanita</div>
                            <div class="row q-col-gutter-md">
                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Jumlah Kehamilan Sebelumnya</span>
                                    <q-input v-model.number="form_edit.jumlah_kehamilan" type="number" min="0" outlined
                                        square :dense="true" class="bg-white margin_btn" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Pernah Abortus</span>
                                    <q-option-group v-model="form_edit.pernah_abortus"
                                        :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                        type="radio" inline />
                                </div>
                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Pernah HDN</span>
                                    <q-option-group v-model="form_edit.pernah_hdn"
                                        :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                        type="radio" inline />
                                </div>
                            </div>
                            <hr class="hrpagin2" />
                        </div>

                        <span class="h_lable">Alamat</span>
                        <q-input v-model="form_edit.alamat" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Nama Wali</span>
                                <q-input v-model="form_edit.nama_wali" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Kadar HB (g/dL)</span>
                                <q-input v-model.number="form_edit.kadar_hb" type="number" step="0.1" outlined square
                                    :dense="true" class="bg-white margin_btn" />
                            </div>
                        </div>

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Golongan Darah</span>
                                <q-select v-model="form_edit.golongan_darah" :options="['A', 'B', 'O', 'AB']" outlined
                                    square :dense="true" class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Rhesus</span>
                                <q-select v-model="form_edit.rhesus" :options="['+', '-']" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Komponen</span>
                                <q-select v-model="form_edit.komponen_id" :options="list_komponen" option-value="id"
                                    option-label="nama_komponen" emit-value map-options outlined dense
                                    class="bg-white margin_btn" required />
                            </div>
                        </div>

                        <span class="h_lable">Jumlah (Kantong)</span>
                        <q-input v-model.number="form_edit.jumlah_kantong" type="number" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Permintaan</span>
                                <q-input v-model="form_edit.tanggal_permintaan" type="date" outlined square
                                    :dense="true" class="bg-white margin_btn" />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Diperlukan</span>
                                <q-input v-model="form_edit.tanggal_diperlukan" type="date" outlined square
                                    :dense="true" class="bg-white margin_btn" />
                            </div>
                        </div>

                        <span class="h_lable">Diagnosis Klinis</span>
                        <q-input v-model="form_edit.diagnosis_klinis" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" required />

                        <span class="h_lable">Alasan Transfusi</span>
                        <q-input v-model="form_edit.alasan_transfusi" type="textarea" outlined square :dense="true"
                            class="bg-white margin_btn" required />
                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_edit" color="primary" type="submit" label="Simpan Perubahan" />
                        <q-btn label="Batal" color="negative" v-close-popup @click="mdl_edit = false" />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>




        <!-- MODAL PERIKSA (UPD) -->
        <q-dialog v-model="mdl_periksa" persistent>
            <q-card class="mdl-md">
                <q-card-section class="main2 text-white">
                    <div class="text-h6 h_modalhead">Form Pemeriksaan UPD</div>
                </q-card-section>

                <form @submit.prevent="submitPeriksa">
                    <q-card-section class="q-pt-none">
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Petugas Pemeriksa</span>
                                <q-input v-model="periksa_form.petugas_pemeriksa" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Pemeriksaan</span>
                                <q-input v-model="periksa_form.tanggal_pemeriksaan" type="date" outlined square
                                    :dense="true" class="bg-white margin_btn" required />
                            </div>
                        </div>

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Golongan Darah Hasil</span>
                                <q-select v-model="periksa_form.golongan_darah_hasil" :options="['A', 'B', 'O', 'AB']"
                                    outlined dense class="bg-white" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Rhesus Hasil</span>
                                <q-select v-model="periksa_form.rhesus_hasil" :options="['+', '-']" outlined dense
                                    class="bg-white" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Jumlah Diberikan (kantong)</span>
                                <q-input v-model.number="periksa_form.jumlah_darah_diberikan" type="number" outlined
                                    dense class="bg-white" />
                            </div>
                        </div>

                        <span class="h_lable">Nomor Kantong</span>
                        <q-input v-model="periksa_form.nomor_kantong" outlined dense class="bg-white" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Petugas Pengeluar</span>
                                <q-input v-model="periksa_form.petugas_pengeluar" outlined dense class="bg-white" />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Penerima Darah</span>
                                <q-input v-model="periksa_form.penerima_darah" outlined dense class="bg-white" />
                            </div>
                        </div>

                        <span class="h_lable">Catatan Tambahan</span>
                        <q-input v-model="periksa_form.catatan_tambahan" type="textarea" outlined dense
                            class="bg-white" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Crossmatch 1</span>
                                <q-select v-model="periksa_form.crossmatch_1" :options="['Cocok', 'Tidak', 'Emergency']"
                                    outlined dense class="bg-white" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Crossmatch 2</span>
                                <q-select v-model="periksa_form.crossmatch_2" :options="['Cocok', 'Tidak', 'Emergency']"
                                    outlined dense class="bg-white" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Crossmatch 3</span>
                                <q-select v-model="periksa_form.crossmatch_3" :options="['Cocok', 'Tidak', 'Emergency']"
                                    outlined dense class="bg-white" />
                            </div>
                        </div>

                    </q-card-section>

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_periksa" color="primary" type="submit" label="Simpan & Tandai Diperiksa" />
                        <q-btn label="Batal" color="negative" v-close-popup @click="mdl_periksa = false" />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>

        <!-- MODAL REJECT -->
        <q-dialog v-model="mdl_reject" persistent>
            <q-card class="mdl-sm">
                <q-card-section class="q-pt-none text-center orageGrad">
                    <form @submit.prevent="submitReject">
                        <br>
                        <div class="text-h6">Alasan Penolakan</div>
                        <q-input v-model="reject_reason" type="textarea" outlined square :dense="true"
                            class="bg-white q-mt-md" required />
                        <q-card-actions align="center" class="q-mt-md">
                            <q-btn label="Batal" size="sm" color="secondary" v-close-popup
                                @click="mdl_reject = false" />
                            &nbsp;
                            <q-btn :loading="btn_reject" type="submit" label="Kirim Penolakan" size="sm"
                                color="negative" />
                        </q-card-actions>
                    </form>
                </q-card-section>
            </q-card>
        </q-dialog>



        <!-- ========================== KETERANGAN ================================ -->
        <q-dialog v-model="mdl_keterangan" persistent>
            <q-card class="mdl-md">
                <q-card-section class="bg-orange">
                    <div class="text-h6 h_modalhead">KETERANGAN</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <div>
                        <div class="q-mb-sm">
                            <q-separator spaced />
                            <span class="q-ml-sm">Keterangan : {{ statusText(selectedItem.status,
                                selectedItem.status_keterangan)
                                }}</span>
                            <q-separator spaced />
                        </div>
                    </div>


                </q-card-section>

                <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                    <q-btn label="Close" color="negative" v-close-popup @click="closeKeterangan" />
                </q-card-actions>
            </q-card>
        </q-dialog>

        <!-- ================================================ MODAL HAPUS ================================================ -->
        <q-dialog v-model="mdl_delete" persistent>
            <q-card class="mdl-sm ">
                <q-card-section class="q-pt-none text-center orageGrad">
                    <form @submit.prevent="removeData">
                        <br>
                        <img src="img/alert.png" alt="" width="75"> <br>
                        <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGHAPUS DATA INI??</span>
                        <input type="submit" style="position: absolute; left: -9999px" />
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
            tipe: 0, // dari profile.stokdarah_konut
            user: null,

            // form tambah permintaan (admin ruangan)
            form: {
                rumah_sakit_id: 1,
                ruangan_id: null,
                nama_dokter: '',
                tanggal_permintaan: '',
                tanggal_diperlukan: '',
                nama_pasien: '',
                nomor_rm: '',
                tanggal_lahir: '',
                alamat: '',
                nama_wali: '',
                jenis_kelamin: '',
                jumlah_kehamilan: null,      // number
                pernah_abortus: '',          // 'Ya' / 'Tidak'
                pernah_hdn: '',

                // pernah_transfusi:'',
                // kapan_transfusi:'null',
                // ada_reaksi:'Ya',
                // gejala_reaksi:'null',
                // pernah_coombs:'Ya',
                // lokasi_coombs:'null',
                // hasil_coombs:'null',  

                golongan_darah: '',
                rhesus: '',
                komponen_id: null,
                jumlah_kantong: 1,
                diagnosis_klinis: '',
                alasan_transfusi: '',
                kadar_hb: null,
                status: 1, // default 1 = diajukan
                status_keterangan: 'Menunggu Diperiksa oleh Admin UPD'
            },

            // modal edit
            mdl_edit: false,
            mdl_delete: false,
            btn_edit: false,


            // form edit
            form_edit: {
                id: null,
                rumah_sakit_id: 1,
                ruangan_id: null,
                nama_dokter: '',
                tanggal_permintaan: '',
                tanggal_diperlukan: '',
                nama_pasien: '',
                nomor_rm: '',
                tanggal_lahir: '',
                alamat: '',
                nama_wali: '',
                jenis_kelamin: '',
                jumlah_kehamilan: null,
                pernah_abortus: '',
                pernah_hdn: '',
                golongan_darah: '',
                rhesus: '',
                komponen_id: null,
                jumlah_kantong: 1,
                diagnosis_klinis: '',
                alasan_transfusi: '',
                kadar_hb: null,
                status: 1,
                status_keterangan: ''
            },



            list_data: [],
            list_komponen: [],
            list_ruangan: [],

            mdl_keterangan: false,
            selectedItem: {},

            page_first: 1,
            page_last: 0,
            page_limit: 10,
            jml_data: 0,
            total_data: 0,
            cari_value: '',

            mdl_add: false,
            btn_add: false,

            mdl_lihat: false,
            lihat_target: null,

            filter: {
                komponen_id: '',
                golongan_darah: '',
                status: ''
            },

            statusOptions: [
                { label: 'Semua', value: '' },
                { label: 'Diajukan', value: 1 },
                { label: 'Diperiksa', value: 2 },
                { label: 'Disetujui', value: 3 },
                { label: 'Ditolak', value: 4 }
            ],
            mdl_periksa: false,
            mdl_reject: false,
            btn_periksa: false,
            btn_reject: false,
            periksa_form: {
                id: null,
                petugas_pemeriksa: '',
                tanggal_pemeriksaan: '',
                golongan_darah_hasil: '',
                rhesus_hasil: '',
                catatan_tambahan: '',
                crossmatch_1: '',
                crossmatch_2: '',
                crossmatch_3: '',
                jumlah_darah_diberikan: null,
                nomor_kantong: '',
                petugas_pengeluar: '',
                penerima_darah: ''
            },
            reject_reason: ''
        }
    },
    methods: {

        statusColor(st) {
            const s = Number(st);
            if (s === 1) return 'orange';    // Diajukan
            if (s === 2) return 'info';      // Diperiksa
            if (s === 3) return 'positive';  // Disetujui
            if (s === 4) return 'negative';  // Ditolak
            return 'grey';
        },
        getView() {
            const query = new URLSearchParams({
                page: this.page_first,
                limit: this.page_limit,
                cari_value: this.cari_value || '',
                komponen_id: this.filter.komponen_id || '',
                golongan_darah: this.filter.golongan_darah || '',
                ...(this.filter.status !== '' && this.filter.status !== null
                    ? { status: this.filter.status }
                    : {})
            }).toString()

            // sesuaikan key URL di store: gunakan PERMINTAAN
            const URL = this.$store.state.url.PERMINTAAN || (this.$store.state.url.BASE || '') + "permintaan_darah/";

            fetch(URL + "view?" + query, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.list_data = res_data.data || []
                        this.total_data = res_data.total_data || 0
                        this.page_last = res_data.total_pages || 1
                        this.jml_data = this.list_data.length
                        if (this.page_first > this.page_last) this.page_first = this.page_last || 1
                    } else {
                        this.$q.notify({ type: 'negative', message: res_data.message || 'Gagal memuat data permintaan darah' })
                    }
                })
                .catch(err => {
                    console.error('Error fetching permintaan:', err)
                    this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memuat data permintaan darah' })
                })
        },

        getKomponen() {
            const URL = this.$store.state.url.KOMPONEN || (this.$store.state.url.BASE || '') + "komponen_darah/";
            fetch(URL + "view", {
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

        getRuangan() {
            // ganti key URL sesuai store kamu; saya asumsikan ada this.$store.state.url.TENAGA_MEDIS
            const URL = this.$store.state.url.REGIS_MEDIS || (this.$store.state.url.BASE || '') + "getview/";
            fetch(URL + "getview", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({})
            })
                .then(res => res.json())
                .then(res_data => {
                    // server diharapkan mengembalikan array objek tenaga_medis dengan properti id dan nama_ruangan
                    this.list_ruangan = res_data.data || []
                })
                .catch(err => console.error("Error getRuangan:", err))
        },


        addData() {
            this.btn_add = true
            if (this.form.jenis_kelamin === 'P') {
                if (this.form.jumlah_kehamilan === null || this.form.jumlah_kehamilan === '') {
                    this.$q.notify({ type: 'negative', message: 'Jumlah kehamilan harus diisi untuk pasien wanita' });
                    return;
                }
            }

            const URL = this.$store.state.url.PERMINTAAN || (this.$store.state.url.BASE || '') + "permintaan_darah/";

            fetch(URL + "addData", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(this.form)
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.$q.notify({ type: "positive", message: res_data.message || "Permintaan berhasil ditambahkan" })
                        this.mdl_add = false
                        this.resetForm()
                        this.getView()
                    } else {
                        this.$q.notify({ type: "negative", message: res_data.message || "Gagal menambah permintaan" })
                    }
                })
                .catch(err => {
                    console.error("Error addData:", err)
                    this.$q.notify({ type: "negative", message: "Gagal menambah permintaan darah" })
                })
                .finally(() => {
                    this.btn_add = false
                })
        },

        resetForm() {
            this.form = {
                rumah_sakit_id: 1,
                ruangan_id: null,
                nama_dokter: '',
                tanggal_permintaan: '',
                tanggal_diperlukan: '',
                nama_pasien: '',
                nomor_rm: '',
                tanggal_lahir: '',
                alamat: '',
                nama_wali: '',
                jenis_kelamin: '',
                jumlah_kehamilan: null,
                pernah_abortus: '',
                pernah_hdn: '',
                golongan_darah: '',
                rhesus: '',
                komponen_id: null,
                jumlah_kantong: 1,
                diagnosis_klinis: '',
                alasan_transfusi: '',
                kadar_hb: null,
                status: 1,
                status_keterangan: 'Menunggu Diperiksa oleh Admin UPD'
            }
        },

        openEdit(row) {
            if (!row || !row.id) {
                this.$q.notify({ type: 'negative', message: 'Data tidak valid untuk edit' });
                return;
            }

            // jika sudah disetujui, jangan buka modal (double-check frontend)
            if (Number(row.status) === 3) {
                this.$q.notify({ type: 'warning', message: 'Tidak dapat mengedit: permintaan sudah Disetujui' });
                return;
            }

            // copy data ke form_edit (hindari binding langsung)
            this.form_edit = Object.assign({}, {
                id: row.id,
                rumah_sakit_id: row.rumah_sakit_id || 1,
                ruangan_id: row.ruangan_id || null,
                nama_dokter: row.nama_dokter || '',
                tanggal_permintaan: row.tanggal_permintaan || '',
                tanggal_diperlukan: row.tanggal_diperlukan || '',
                nama_pasien: row.nama_pasien || '',
                nomor_rm: row.nomor_rm || '',
                tanggal_lahir: row.tanggal_lahir || '',
                alamat: row.alamat || '',
                nama_wali: row.nama_wali || '',
                jenis_kelamin: row.jenis_kelamin || '',
                jumlah_kehamilan: row.jumlah_kehamilan || null,
                pernah_abortus: row.pernah_abortus || '',
                pernah_hdn: row.pernah_hdn || '',
                golongan_darah: row.golongan_darah || '',
                rhesus: row.rhesus || '',
                komponen_id: row.komponen_id || null,
                jumlah_kantong: row.jumlah_kantong || 1,
                diagnosis_klinis: row.diagnosis_klinis || '',
                alasan_transfusi: row.alasan_transfusi || '',
                kadar_hb: row.kadar_hb || null,
                status: row.status || 1,
                status_keterangan: row.status_keterangan || ''
            });

            this.mdl_edit = true;
        },

        async submitEdit() {
            // simple validation
            if (!this.form_edit || !this.form_edit.id) {
                this.$q.notify({ type: 'negative', message: 'Data edit tidak lengkap' });
                return;
            }

            // do not allow save if status is 3 on client side
            if (Number(this.form_edit.status) === 3) {
                this.$q.notify({ type: 'warning', message: 'Tidak dapat menyimpan: status sudah Disetujui' });
                return;
            }

            this.btn_edit = true;
            try {
                const URL = this.$store.state.url.PERMINTAAN || (this.$store.state.url.BASE || '') + "permintaan_darah/";
                const res = await fetch(URL + "edit", {   // NOTE: endpoint backend contoh = /permintaan_darah/edit
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        authorization: "kikensbatara " + localStorage.token
                    },
                    body: JSON.stringify(this.form_edit)
                });
                const json = await res.json();
                if (json && json.success) {
                    this.$q.notify({ type: 'positive', message: json.message || 'Perubahan tersimpan' });
                    this.mdl_edit = false;
                    this.getView();
                } else {
                    this.$q.notify({ type: 'negative', message: json.message || 'Gagal menyimpan perubahan' });
                }
            } catch (err) {
                console.error('Error submitEdit:', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat menyimpan perubahan' });
            } finally {
                this.btn_edit = false;
            }
        },



        openLihat(data) {
            this.lihat_target = data
            this.mdl_lihat = true
        },

        updateStatusRequest(payload) {
            const URL = this.$store.state.url.PERMINTAAN || (this.$store.state.url.BASE || '') + "permintaan_darah/";
            return fetch(URL + "updateStatus", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
        },


        async openPeriksaFor(row) {
            if (!row || !row.id) {
                this.$q.notify({ type: 'negative', message: 'Data permintaan tidak valid' });
                return;
            }

            // disable tombol sementara
            this.btn_periksa = true;

            try {
                // 1) set status = 2 (Diperiksa) dulu
                const payload = {
                    id: row.id,
                    status: 2
                    // tidak perlu status_keterangan karena backend akan set default
                };

                const res = await this.updateStatusRequest(payload);

                if (!res || !res.success) {
                    // jika gagal, beri notifikasi dan jangan buka modal
                    this.$q.notify({ type: 'negative', message: res && res.message ? res.message : 'Gagal ubah status menjadi Diperiksa' });
                    return;
                }

                // 2) update local UI: set status di list dan di lihat_target (optimistic update)
                row.status = 2;
                if (this.lihat_target && this.lihat_target.id === row.id) {
                    this.lihat_target.status = 2;
                    this.lihat_target.status_keterangan = 'Permintaan Sedang diperiksa';
                }

                // 3) prefill periksa_form dengan data yang mungkin sudah ada (atau kosong)
                this.periksa_form = {
                    id: row.id,
                    petugas_pemeriksa: '', // biarkan user isi
                    tanggal_pemeriksaan: new Date().toISOString().slice(0, 16), // yyyy-mm-ddTHH:MM
                    golongan_darah_hasil: row.golongan_darah || '',
                    rhesus_hasil: row.rhesus || '',
                    catatan_tambahan: row.catatan_tambahan || '',
                    crossmatch_1: row.crossmatch_1 || '',
                    crossmatch_2: row.crossmatch_2 || '',
                    crossmatch_3: row.crossmatch_3 || '',
                    jumlah_darah_diberikan: row.jumlah_darah_diberikan || null,
                    nomor_kantong: row.nomor_kantong || '',
                    petugas_pengeluar: row.petugas_pengeluar || '',
                    penerima_darah: row.penerima_darah || ''
                };

                // buka modal pemeriksaan
                this.mdl_periksa = true;

                // refresh list sedikit agar status 2 terlihat (opsional)
                this.getView();

            } catch (err) {
                console.error('Error openPeriksaFor:', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memulai pemeriksaan' });
            } finally {
                this.btn_periksa = false;
            }
        },


        // simpan hasil pemeriksaan -> status = 2 (Diperiksa)
        async submitPeriksa() {
            if (!this.periksa_form || !this.periksa_form.id) {
                this.$q.notify({ type: 'negative', message: 'Form pemeriksaan belum terisi dengan benar' });
                return;
            }

            this.btn_periksa = true;

            try {
                const payload = {
                    id: this.periksa_form.id,
                    status: 3, // langsung setujui pada saat simpan pemeriksaan
                    status_keterangan: 'Permintaan Darah sudah berhasil',

                    // fields pemeriksaan yang backend menerima
                    petugas_pemeriksa: this.periksa_form.petugas_pemeriksa || null,
                    tanggal_pemeriksaan: this.periksa_form.tanggal_pemeriksaan || null,
                    golongan_darah_hasil: this.periksa_form.golongan_darah_hasil || null,
                    rhesus_hasil: this.periksa_form.rhesus_hasil || null,
                    catatan_tambahan: this.periksa_form.catatan_tambahan || null,
                    crossmatch_1: this.periksa_form.crossmatch_1 || null,
                    crossmatch_2: this.periksa_form.crossmatch_2 || null,
                    crossmatch_3: this.periksa_form.crossmatch_3 || null,
                    jumlah_darah_diberikan: this.periksa_form.jumlah_darah_diberikan || null,
                    nomor_kantong: this.periksa_form.nomor_kantong || null,
                    petugas_pengeluar: this.periksa_form.petugas_pengeluar || null,
                    penerima_darah: this.periksa_form.penerima_darah || null
                };

                const res = await this.updateStatusRequest(payload);

                if (!res || !res.success) {
                    this.$q.notify({ type: 'negative', message: res && res.message ? res.message : 'Gagal menyimpan hasil pemeriksaan' });
                    return;
                }

                // success: tutup modal, refresh list, beri notifikasi
                this.$q.notify({ type: 'positive', message: res.message || 'Pemeriksaan disimpan dan permintaan disetujui' });
                this.mdl_periksa = false;

                // update local target & list agar status jadi 3
                if (this.lihat_target && this.lihat_target.id === this.periksa_form.id) {
                    this.lihat_target.status = 3;
                    this.lihat_target.status_keterangan = 'Permintaan Darah sudah berhasil';
                    // juga simpan hasil pemeriksaan pada lihat_target agar tampil di detail
                    Object.assign(this.lihat_target, {
                        petugas_pemeriksa: payload.petugas_pemeriksa,
                        tanggal_pemeriksaan: payload.tanggal_pemeriksaan,
                        golongan_darah_hasil: payload.golongan_darah_hasil,
                        rhesus_hasil: payload.rhesus_hasil,
                        catatan_tambahan: payload.catatan_tambahan,
                        crossmatch_1: payload.crossmatch_1,
                        crossmatch_2: payload.crossmatch_2,
                        crossmatch_3: payload.crossmatch_3,
                        jumlah_darah_diberikan: payload.jumlah_darah_diberikan,
                        nomor_kantong: payload.nomor_kantong,
                        petugas_pengeluar: payload.petugas_pengeluar,
                        penerima_darah: payload.penerima_darah
                    });
                }

                this.getView(); // refresh daftar
            } catch (err) {
                console.error('Error submitPeriksa:', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat menyimpan pemeriksaan' });
            } finally {
                this.btn_periksa = false;
            }
        },


        // tombol 'Ditolak' -> buka modal isian alasan
        openReject(row) {
            this.reject_reason = '';
            this.lihat_target = row;
            this.mdl_reject = true;
        },

        lihatKeterangan(item) {
            // salin objek agar tidak merubah referensi asli
            this.selectedItem = Object.assign({}, item || {});
            this.mdl_keterangan = true;
        },

        closeKeterangan() {
            this.mdl_keterangan = false;
            // reset selectedItem sedikit setelah dialog tertutup (untuk state bersih)
            setTimeout(() => { this.selectedItem = {}; }, 200);
        },

        // kirim penolakan -> status = 4
        submitReject() {
            if (!this.lihat_target || !this.lihat_target.id) {
                this.$q.notify({ type: 'negative', message: 'Tidak ada permintaan yang dipilih' });
                return;
            }
            if (!this.reject_reason || !String(this.reject_reason).trim()) {
                this.$q.notify({ type: 'negative', message: 'Alasan penolakan wajib diisi' });
                return;
            }
            this.btn_reject = true;
            const payload = {
                id: this.lihat_target.id,
                status: 4,
                status_keterangan: this.reject_reason
            };
            this.updateStatusRequest(payload)
                .then(res => {
                    if (res && res.success) {
                        this.$q.notify({ type: 'positive', message: res.message || 'Permintaan berhasil ditolak' });
                        this.mdl_reject = false;
                        this.lihat_target = null;
                        this.getView();
                    } else {
                        this.$q.notify({ type: 'negative', message: res.message || 'Gagal menolak permintaan' });
                    }
                })
                .catch(err => {
                    console.error('Error submitReject:', err);
                    this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat mengirim penolakan' });
                })
                .finally(() => this.btn_reject = false);
        },

        openDelete(data) {
            if (!data || !data.id) {
                console.warn("⚠️ Tidak ada data yang dipilih untuk dihapus:", data)
                return
            }

            this.form = { id: data.id }
            this.mdl_delete = true
        },

        // kirim ke backend
        removeData() {
            this.$store.commit("shoWLoading")

            fetch(this.$store.state.url.PERMINTAAN + "delete", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({ id: this.form.id })
            })
                .then(res => res.json())
                .then(res_data => {
                    this.$store.commit("hideLoading")
                    if (res_data.success) {
                        this.Notify(res_data.message || '✅ Sukses Menghapus Data', 'negative', 'check_circle_outline')
                        this.getView()
                    } else {
                        this.Notify(res_data.message || '⚠️ Gagal menghapus data', 'warning', 'error_outline')
                    }
                })
                .catch(err => {
                    this.$store.commit("hideLoading")
                    this.Notify('❌ Terjadi kesalahan: ' + err.message, 'warning', 'error_outline')
                })
        },

        Notify(message, color, icon) {
            this.$q.notify({
                message,
                color,
                icon,
                position: 'top',
                timeout: 1000
            })
        },
        indexing(idx) {
            return ((this.page_first - 1) * this.page_limit) + idx
        },

        cari_data() {
            this.page_first = 1
            this.getView()
        },

        applyFilter() {
            this.page_first = 1
            this.getView()
        },

        statusText(code, keterangan) {
            // code mungkin string atau number
            const c = Number(code)
            if (c === 1) return 'Menunggu Diperiksa oleh Admin UPD'
            if (c === 2) return 'Permintaan Sedang diperiksa'
            if (c === 3) return 'Permintaan Darah sudah berhasil'
            if (c === 4) return keterangan || 'Ditolak'
            return '-'
        }
    },

    watch: {
        'form.jenis_kelamin'(val) {
            if (val !== 'P') {
                // reset fields khusus wanita
                this.form.jumlah_kehamilan = null;
                this.form.pernah_abortus = '';
                this.form.pernah_hdn = '';
            }
        }
    },

    mounted() {
        // ambil profile dari localStorage (sesuai contoh kamu)
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

        this.getKomponen()
        this.getView()
        this.getRuangan()
        this.form.rumah_sakit_id = 1;
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
</style>
