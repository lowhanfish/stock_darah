<template>
    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <!-- ================= HEADER ================= -->
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Permintaan Darah</div>
                        <div class="text-h8">Manajemen Darah</div>
                    </div>
                    <div class="col-12 col-md-2"></div>
                    <div class="col-12 col-md-4">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true"
                                class="bg-white" style="width:90%" />
                            <!-- Tombol tambah hanya untuk tipe = 3 (Admin Ruangan) -->
                            <q-btn v-if="tipe === 3" glossy class="main4" @click="mdl_add = true" dense flat icon="add"
                                style="width:10%">
                                <q-tooltip content-class="bg-green-6" content-style="font-size: 13px">
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
                <q-select v-model="filter.status" :options="statusOptions" emit-value map-options outlined dense
                    class="bg-white" @input="applyFilter" />
            </div>

        </div>

        <hr class="hrpagin2" />

        <!-- ================= TABLE ================= -->
        <div class="tbl_responsive">
            <table width="100%">
                <thead class="h_table_head main2x text-white">
                    <tr>
                        <th width="5%" class="text-center">No</th>
                        <th width="10%" class="text-center">Status</th>
                        <th width="15%">Nama Pasien</th>
                        <th width="15%">Tgl Lahir</th>
                        <th width="5%">Gol.Darah</th>
                        <th width="25%">Komponen</th>
                        <th width="5%" class="text-center">Jumlah Permintaan (Kantong)</th>
                        <th width="5%" class="text-center">Jumlah diberikan (Kantong)</th>
                        <th width="15%" class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, index) in list_data" :key="data.id + '-' + index">
                        <td class="text-center">{{ indexing(index + 1) }}</td>
                        <td class="text-center">

                            <div class="removeTextDecoration">
                                <!-- Pengajuan (bisa buka keterangan) -->
                                <q-badge v-if="Number(data.status) === 1" color="orange" text-color="white"
                                    class="q-pa-xs status-badge text-bold cursor-pointer"
                                    @click="lihatKeterangan(data)">
                                    Pengajuan
                                </q-badge>

                                <!-- Diperiksa (bisa buka keterangan) -->
                                <q-badge v-else-if="Number(data.status) === 2" color="info" text-color="white"
                                    class="q-pa-xs status-badge text-bold cursor-pointer"
                                    @click="lihatKeterangan(data)">
                                    Diperiksa
                                </q-badge>

                                <template v-else-if="Number(data.status) === 3">
                                    <q-badge v-if="tipe === 1 || tipe === 2" color="secondary" text-color="white"
                                        class="q-pa-xs status-badge text-bold cursor-pointer"
                                        @click.stop="openStage2(data)">
                                        Darah Siap Diambil
                                    </q-badge>

                                    <q-badge v-else-if="tipe === 3" color="secondary" text-color="white"
                                        class="q-pa-xs status-badge text-bold cursor-pointer"
                                        @click="lihatKeterangan(data)">
                                        Darah Siap Diambil
                                    </q-badge>
                                </template>

                                <!-- Telah Diambil (klik -> buka modal view read-only) -->
                                <q-badge v-else-if="Number(data.status) === 6" color="accent" text-color="white"
                                    class="q-pa-xs status-badge text-bold cursor-pointer"
                                    @click.stop="openStage2(data)">
                                    Darah Telah Diambil
                                </q-badge>

                                <!-- Selesai (bisa buka keterangan) -->
                                <q-badge v-else-if="Number(data.status) === 4" color="green" text-color="white"
                                    class="q-pa-xs status-badge text-bold cursor-pointer" @click="openStage2(data)">
                                    Permintaan Selesai
                                </q-badge>

                                <!-- Ditolak (bisa buka keterangan) -->
                                <q-badge v-else-if="Number(data.status) === 5" color="negative" text-color="white"
                                    class="q-pa-xs status-badge text-bold cursor-pointer"
                                    @click="lihatKeterangan(data)">
                                    Permintaan Ditolak
                                </q-badge>
                            </div>

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
                        <td class="text-center">{{ data.golongan_darah || '-' }}{{ data.rhesus }}</td>
                        <td>{{ data.nama_komponen || '-' }}</td>
                        <td class="text-center">{{ data.jumlah_kantong }}</td>
                        <td class="text-center">{{ data.jumlah_darah_diberikan || "-" }}</td>

                        <td class="text-center q-gutter-sm">
                            <!-- untuk sekarang hanya lihat detail; aksi lanjutan (edit/verif) nanti -->
                            <q-btn dense round color="primary" icon="visibility" @click="openLihat(data)">
                                <q-tooltip content-class="bg-blue-7">Lihat Detail</q-tooltip>
                            </q-btn>
                            <q-btn dense round color="warning" icon="edit"
                                :disable="Number(data.status) === 3 || Number(data.status) === 4"
                                @click="openEdit(data)" v-if="tipe !== 1"> <q-tooltip
                                    v-if="Number(data.status) === 3 || Number(data.status) === 4"
                                    content-class="bg-amber-7">
                                    Tidak dapat edit — permintaan sudah Disetujui
                                </q-tooltip>
                                <q-tooltip v-else content-class="bg-amber-7">Edit Permintaan</q-tooltip>
                            </q-btn>

                            <q-btn dense round color="negative" icon="delete"
                                :disable="Number(data.status) === 2 || Number(data.status) === 3 || Number(data.status) === 4"
                                @click="openDelete(data)" v-if="tipe !== 1"> <q-tooltip content-class="bg-red-7">
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
                        <hr class="hrpagin2" />
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Nama Dokter*</span>
                                <q-input v-model="form.nama_dokter" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Nama Pasien*</span>
                                <q-input v-model="form.nama_pasien" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                        </div>

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Jenis Kelamin*</span>
                                <q-select v-model="form.jenis_kelamin"
                                    :options="[{ label: 'Laki-laki', value: 'L' }, { label: 'Perempuan', value: 'P' }]"
                                    option-value="value" option-label="label" emit-value map-options outlined square
                                    :dense="true" class="bg-white margin_btn" required />
                            </div>



                            <div class="col-12 col-md-4">
                                <span class="h_lable">Nomor RM*</span>
                                <q-input v-model="form.nomor_rm" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>

                            <div class="col-12 col-md-4">
                                <span class="h_lable">Tanggal Lahir*</span>
                                <q-input v-model="form.tanggal_lahir" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                        </div>

                        <div v-if="form.jenis_kelamin === 'P'">
                            <hr class="hrpagin2" />
                            <div class="text-subtitle2 q-mb-sm">Khusus Pasien Wanita</div>

                            <div class="row q-col-gutter-md">
                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Jumlah Kehamilan</span>
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


                        <span class="h_lable">Alamat*</span>
                        <q-input v-model="form.alamat" type="textarea" autogrow outlined square :dense="true"
                            class="bg-white margin_btn" />

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Nama Wali*</span>
                                <q-input v-model="form.nama_wali" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Kadar HB (g/dL)</span>
                                <q-input v-model.number="form.kadar_hb" type="number" step="0.1" outlined square
                                    :dense="true" class="bg-white margin_btn" hint="Opsional (diisi jika tersedia)" />
                            </div>
                        </div>



                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Golongan Darah</span>
                                <q-select v-model="form.golongan_darah" :options="['A', 'B', 'O', 'AB']" outlined square
                                    :dense="true" class="bg-white margin_btn" />
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

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Jumlah (Kantong)*</span>
                                <q-input v-model.number="form.jumlah_kantong" type="number" outlined square
                                    :dense="true" class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Jumlah (cc)*</span>
                                <q-input v-model.number="form.jumlah_cc" type="number" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                        </div>

                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Permintaan*</span>
                                <q-input v-model="form.tanggal_permintaan" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Tanggal Diperlukan*</span>
                                <q-input v-model="form.tanggal_diperlukan" type="date" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                        </div>

                        <span class="h_lable">Diagnosis Klinis</span>
                        <q-input v-model="form.diagnosis_klinis" type="textarea" outlined square :dense="true" autogrow
                            class="bg-white margin_btn" />

                        <span class="h_lable">Alasan Transfusi</span>
                        <q-input v-model="form.alasan_transfusi" type="textarea" outlined square :dense="true" autogrow
                            class="bg-white margin_btn" />

                        <hr class="hrpagin2" />
                        <div class="text-subtitle1 q-mb-sm text-bold text-center">Riwayat Transfusi & Pemeriksaan
                            Serologi</div>

                        <div class="row q-col-gutter-md">
                            <!-- Transfusi Sebelumnya -->
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Transfusi Sebelumnya</span>
                                <q-option-group v-model="form.transfusi_sebelumnya"
                                    :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                    type="radio" inline />
                            </div>

                            <div class="col-12 col-md-6" v-show="form.transfusi_sebelumnya === 'Ya'">
                                <span class="h_lable">Kapan (tanggal / keterangan)</span>
                                <q-input v-model="form.transfusi_kapan" outlined square :dense="true" class="bg-white"
                                    placeholder="YYYY-MM-DD atau keterangan" />
                            </div>

                            <!-- Reaksi Transfusi -->
                            <div class="col-12 col-md-6 q-mt-sm">
                                <span class="h_lable">Reaksi Transfusi</span>
                                <q-option-group v-model="form.reaksi_transfusi"
                                    :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                    type="radio" inline />
                            </div>

                            <div class="col-12 col-md-6" v-show="form.reaksi_transfusi === 'Ya'">
                                <span class="h_lable">Gejala</span>
                                <q-input v-model="form.gejala_transfusi" outlined square :dense="true" class="bg-white"
                                    placeholder="Jelaskan gejala reaksi" />
                            </div>

                            <!-- Coomb's test -->
                            <div class="col-12 col-md-6 q-mt-sm">
                                <span class="h_lable">Pernah diperiksa serologi (Coomb's test)?</span>
                                <q-option-group v-model="form.coomb_test"
                                    :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                    type="radio" inline />
                            </div>

                            <div class="col-12 col-md-6" v-show="form.coomb_test === 'Ya'">
                                <div class="row q-col-gutter-md">
                                    <div class="col-12 col-md-12">
                                        <span class="h_lable">Dimana (lab/rumah sakit)</span>
                                        <q-input v-model="form.coomb_tempat" outlined square :dense="true"
                                            class="bg-white" />
                                    </div>
                                    <div class="col-12 col-md-6 q-mt-sm">
                                        <span class="h_lable">Kapan</span>
                                        <q-input v-model="form.coomb_kapan" type="date" outlined square :dense="true"
                                            class="bg-white" />
                                    </div>
                                    <div class="col-12 col-md-6 q-mt-sm">
                                        <span class="h_lable">Hasil</span>
                                        <q-input v-model="form.coomb_hasil" outlined square :dense="true"
                                            class="bg-white" placeholder="Negatif / Positif / Lainnya" />
                                    </div>
                                </div>
                            </div>
                        </div>



                    </q-card-section>
                    <hr class="hrpagin2" />

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn :loading="btn_add" color="primary" type="submit" label="Simpan" />
                        <q-btn label="Batal" color="negative" v-close-popup @click="resetForm" />
                    </q-card-actions>
                </form>
            </q-card>
        </q-dialog>

        <!-- ===================== MODAL LIHAT DETAIL ===================== -->
        <q-dialog v-model="mdl_lihat" persistent>
            <q-card class="mdl-lg">
                <!-- Header -->
                <q-card-section class="bg-orange text-white row items-center justify-between">
                    <div class="text-h6 h_modalhead">Detail Permintaan Darah</div>
                    <q-btn flat round dense icon="close" color="white" v-close-popup @click="lihat_target = null"
                        class="q-ml-sm" aria-label="Tutup">
                        <q-tooltip content-class="bg-red">Tutup</q-tooltip>
                    </q-btn>
                </q-card-section>

                <!-- Body -->
                <q-card-section>
                    <div v-if="lihat_target">
                        <!-- Ringkas info utama (grid responsif) -->
                        <div class="row q-col-gutter-md">
                            <!-- Kolom Kiri -->
                            <div class="col-12 col-md-6">
                                <div class="detail-table">
                                    <div class="row-line">
                                        <div class="label">Nama Pasien</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">{{ lihat_target.nama_pasien || '-' }}</div>
                                    </div>
                                    <div class="row-line">
                                        <div class="label">No. RM</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">{{ lihat_target.nomor_rm || '-' }}</div>
                                    </div>
                                    <div class="row-line">
                                        <div class="label">Tanggal Lahir</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">
                                            {{ lihat_target.tanggal_lahir ? UMUM.tglConvert(lihat_target.tanggal_lahir)
                                : '-' }}
                                        </div>
                                    </div>
                                    <div class="row-line">
                                        <div class="label">Alamat</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">{{ lihat_target.alamat || '-' }}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Kolom Kanan -->
                            <div class="col-12 col-md-6">
                                <div class="detail-table">
                                    <div class="row-line">
                                        <div class="label">Dokter</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">{{ lihat_target.nama_dokter || '-' }}</div>
                                    </div>
                                    <div class="row-line">
                                        <div class="label">Ruangan</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">{{ lihat_target.nama_ruangan || '-' }}</div>
                                    </div>
                                    <div class="row-line">
                                        <div class="label">Tanggal Diperlukan</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">
                                            {{ lihat_target.tanggal_diperlukan ?
                                UMUM.tglConvert(lihat_target.tanggal_diperlukan) : '-' }}
                                        </div>
                                    </div>
                                    <div class="row-line">
                                        <div class="label">Nama Wali</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">{{ lihat_target.nama_wali || '-' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <q-separator spaced />

                        <!-- Komponen & Jumlah (tampil lebih ringkas) -->
                        <q-list bordered dense class="rounded-borders">
                            <q-item>
                                <q-item-section>
                                    <q-item-label caption class="text-black"> <strong> Komponen : </strong>
                                        <span class="text-bold text-grey" style="font-size: 16px;">
                                            {{ lihat_target.nama_komponen || '-' }}
                                        </span>
                                    </q-item-label>
                                    <div class="text-caption q-mt-xs"> <strong> Golongan Darah : </strong> <span
                                            class="text-bold text-grey" style="font-size: 16px;">{{
                                lihat_target.golongan_darah || '-' }}{{ lihat_target.rhesus ?
                                lihat_target.rhesus : '' }} </span>
                                    </div>
                                </q-item-section>

                                <q-item-section side style="min-width:160px; text-align:right">
                                    <q-item-label caption class="text-black text-bold"> <strong> Jumlah : </strong>
                                        <span class="text-bold text-grey" style="font-size: 16px;">
                                            {{ lihat_target.jumlah_kantong }} Kantong
                                        </span>
                                    </q-item-label>
                                    <q-item-label caption class="text-black text-bold"> <strong> Volume : </strong>
                                        <span class="text-bold text-grey" style="font-size: 16px;">
                                            {{ lihat_target.jumlah_cc !== null ? lihat_target.jumlah_cc + ' cc' : '-' }}
                                        </span>
                                    </q-item-label>
                                </q-item-section>
                            </q-item>

                            <q-separator inset />

                            <q-item>
                                <q-item-section>
                                    <q-item-label caption class="text-black text-bold">Status</q-item-label>
                                    <q-item-label>
                                        <q-chip :color="statusColor(lihat_target.status)" text-color="white" size="md"
                                            class="q-mr-sm">
                                            {{ statusText(lihat_target.status) }}
                                        </q-chip>
                                    </q-item-label>
                                </q-item-section>

                                <q-item-section side style="min-width:140px; text-align:right">
                                    <q-item-label caption class="text-black text-bold">Permintaan dibuat</q-item-label>
                                    <q-item-label class="text-weight-medium text-bold">
                                        {{ lihat_target.created_at ? UMUM.tglConvert(lihat_target.created_at, true) :
                                '-' }}
                                    </q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>

                        <!-- Clinical details -->
                        <div class="q-mt-md">
                            <div class="text-subtitle2 q-mb-xs">Diagnosis : </div>
                            <div class="detail-table">
                                <div class="row-line">
                                    <div class="label"></div>
                                    <div class="colon"></div>
                                    <div class="value text-bold">{{ lihat_target.diagnosis_klinis || '-' }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="q-mt-md">
                            <div class="text-subtitle2 q-mb-xs">Alasan Transfusi : </div>
                            <div class="detail-table">
                                <div class="row-line">
                                    <div class="label"></div>
                                    <div class="colon"></div>
                                    <div class="value text-bold">{{ lihat_target.alasan_transfusi || '-' }}</div>
                                </div>
                            </div>
                        </div>

                        <q-separator spaced />

                        <!-- Riwayat Transfusi & Pemeriksaan Serologi -->
                        <div class="q-mt-md">
                            <div class="text-subtitle1 q-mb-sm text-bold text-center">Riwayat Transfusi & Pemeriksaan
                                Serologi</div>
                            <div class="row q-col-gutter-md">


                                <!-- Transfusi Sebelumnya -->
                                <div class="col-12 col-md-4">
                                    <div class="detail-table">
                                        <div class="row-line">
                                            <div class="label">Transfusi Sebelumnya</div>
                                            <div class="colon">:</div>
                                            <div class="value text-bold">{{ lihat_target.transfusi_sebelumnya || '-' }}
                                            </div>
                                        </div>
                                        <div class="row-line" v-if="lihat_target.transfusi_sebelumnya === 'Ya'">
                                            <div class="label">Kapan</div>
                                            <div class="colon">:</div>
                                            <div class="value text-bold">{{ lihat_target.transfusi_kapan || '-' }}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Reaksi Transfusi -->
                                <div class="col-12 col-md-8">
                                    <div class="detail-table">
                                        <div class="row-line">
                                            <div class="label">Reaksi Transfusi</div>
                                            <div class="colon">:</div>
                                            <div class="value text-bold">{{ lihat_target.reaksi_transfusi || '-' }}
                                            </div>
                                        </div>
                                        <div class="row-line" v-if="lihat_target.reaksi_transfusi === 'Ya'">
                                            <div class="label">Gejala</div>
                                            <div class="colon">:</div>
                                            <div class="value text-bold">{{ lihat_target.gejala_transfusi || '-' }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Coombs / pemeriksaan ringkas -->
                        <div class="row q-col-gutter-md q-mt-md">
                            <div class="col-12 col-md-4">
                                <div class="detail-table">
                                    <div class="row-line">
                                        <div class="label">Coomb Test</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">{{ lihat_target.coomb_test || '-' }}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="detail-table">
                                    <div class="row-line">
                                        <div class="label">Tempat Coomb</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">{{ lihat_target.coomb_tempat || '-' }}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-md-4">
                                <div class="detail-table">
                                    <div class="row-line">
                                        <div class="label">Hasil Coomb</div>
                                        <div class="colon">:</div>
                                        <div class="value text-bold">{{ lihat_target.coomb_hasil || '-' }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Untuk pasien wanita -->
                        <div v-if="lihat_target && lihat_target.jenis_kelamin === 'P'" class="q-mt-md">
                            <q-separator spaced />
                            <div class="text-subtitle1 text-weight-medium q-mb-sm">Khusus Pasien Wanita</div>
                            <div class="row q-col-gutter-md">
                                <div class="col-12 col-md-4">
                                    <div class="detail-table">
                                        <div class="row-line">
                                            <div class="label">Jumlah Kehamilan</div>
                                            <div class="colon">:</div>
                                            <div class="value text-bold">{{ lihat_target.jumlah_kehamilan !== null ?
                                lihat_target.jumlah_kehamilan : '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-4">
                                    <div class="detail-table">
                                        <div class="row-line">
                                            <div class="label">Pernah Abortus</div>
                                            <div class="colon">:</div>
                                            <div class="value text-bold">{{ lihat_target.pernah_abortus || '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-4">
                                    <div class="detail-table">
                                        <div class="row-line">
                                            <div class="label">Pernah HDN</div>
                                            <div class="colon">:</div>
                                            <div class="value text-bold">{{ lihat_target.pernah_hdn || '-' }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Hasil Pemeriksaan UPD -->
                        <div v-if="lihat_target && Number(lihat_target.status) >= 3" class="q-mt-md">
                            <hr class="hrpagin2">
                            <q-separator spaced />
                            <div class="text-subtitle1 q-mb-sm text-bold text-center">Hasil Pemeriksaan UPD</div>

                            <!-- Tahap 1: Hasil Pemeriksaan -->
                            <div class="q-mb-md">
                                <div class="text-subtitle2 text-weight-medium q-mb-sm text-primary">Tahap 1: Hasil
                                    Pemeriksaan</div>
                                <div class="row q-col-gutter-md">
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Petugas Pemeriksa</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.petugas_pemeriksa ||
                                '-' }}</div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Tanggal Pemeriksaan</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.tanggal_pemeriksaan
                                ? UMUM.tglConvert(lihat_target.tanggal_pemeriksaan) : '-' }}</div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Golongan Darah</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.golongan_darah
                                || '-' }} {{ lihat_target.rhesus ? lihat_target.rhesus : '' }}
                                        </div>
                                    </div>
                                </div>
                                <div class="row q-col-gutter-md q-mt-sm">
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Crossmatch 1</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.crossmatch_1 || '-'
                                            }}</div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Crossmatch 2</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.crossmatch_2 || '-'
                                            }}</div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Crossmatch 3</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.crossmatch_3 || '-'
                                            }}</div>
                                    </div>
                                </div>
                                <div class="row q-col-gutter-md q-mt-sm">
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Jumlah Diberikan (Kantong)</div>
                                        <div class="text-body1 text-grey text-bold">{{
                                lihat_target.jumlah_darah_diberikan !== null ?
                                    lihat_target.jumlah_darah_diberikan + ' Kantong' : '-' }}</div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Jumlah Diberikan (cc)</div>
                                        <div class="text-body1 text-grey text-bold">{{
                                lihat_target.jumlah_darah_diberikan_cc !== null ?
                                    lihat_target.jumlah_darah_diberikan_cc + ' cc' : '-' }}</div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Nomor Kantong</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.nomor_kantong || '-'
                                            }}</div>
                                    </div>

                                </div>
                                <div class="row q-col-gutter-md q-mt-sm">


                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Tanggal Expired</div>
                                        <div class="text-body1 text-grey text-bold">{{ UMUM.tglConvert(lihat_target.exp
                                || '-') }}</div>
                                    </div>
                                    <div class="col-12 col-md-8">
                                        <div class="text-subtitle2">Catatan Tambahan Pemeriksa</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.catatan_tambahan ||
                                '-' }}</div>
                                    </div>
                                </div>


                            </div>

                            <!-- Tahap 2: Pengambilan -->
                            <div v-if="lihat_target && Number(lihat_target.status) == 4" class="q-mb-md">
                                <q-separator spaced />
                                <div class="text-subtitle2 text-weight-medium q-mb-sm text-teal">Tahap 2: Pengambilan
                                </div>
                                <div class="row q-col-gutter-md">
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Petugas Pengeluar</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.petugas_pengeluar ||
                                '-' }}</div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Penerima Darah</div>
                                        <div class="text-body1 text-grey text-bold">{{ lihat_target.penerima_darah ||
                                '-' }}</div>
                                    </div>
                                    <div class="col-12 col-md-4">
                                        <div class="text-subtitle2">Waktu Pengambilan</div>
                                        <div class="text-body1 text-grey text-bold">{{
                                UMUM.tglConvertx(lihat_target.tanggal_pengambilan, true) || '-' }}</div>
                                    </div>
                                </div>
                                <div class="q-mt-sm">
                                    <div class="text-subtitle2 q-mb-xs">Catatan Pengambilan</div>
                                    <div class="text-body1 text-grey text-bold">{{ lihat_target.catatan_pengambilan ||
                                '-' }}</div>
                                </div>
                            </div>
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

                    <!-- Tambahkan ini di q-card-actions modal detail (di sebelah tombol Tutup) -->

                    <q-btn v-if="(tipe === 2 || tipe === 1) && lihat_target && Number(lihat_target.status) === 3" dense
                        glossy class="q-ml-sm" color="warning" icon="undo" @click="openRevertModal(lihat_target)">
                        Edit dan Periksa Kembali
                        <q-tooltip content-class="bg-orange">Kembalikan permintaan ke status Diperiksa</q-tooltip>
                    </q-btn>

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
                                <span class="h_lable">Nama Pasien</span>
                                <q-input v-model="form_edit.nama_pasien" outlined square :dense="true"
                                    class="bg-white margin_btn" required />
                            </div>
                        </div>



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
                                    class="bg-white margin_btn" required />
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
                                    square :dense="true" class="bg-white margin_btn" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Rhesus</span>
                                <q-select v-model="form_edit.rhesus" :options="['+', '-']" outlined square :dense="true"
                                    class="bg-white margin_btn" />
                            </div>
                            <div class="col-12 col-md-4">
                                <span class="h_lable">Komponen</span>
                                <q-select v-model="form_edit.komponen_id" :options="list_komponen" option-value="id"
                                    option-label="nama_komponen" emit-value map-options outlined dense
                                    class="bg-white margin_btn" />
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
                            autogrow class="bg-white margin_btn" />

                        <span class="h_lable">Alasan Transfusi</span>
                        <q-input v-model="form_edit.alasan_transfusi" type="textarea" outlined square :dense="true"
                            autogrow class="bg-white margin_btn" />


                        <hr class="hrpagin2" />
                        <div class="text-subtitle1 q-mb-sm text-bold text-center">Riwayat Transfusi & Pemeriksaan
                            Serologi</div>

                        <div class="row q-col-gutter-md">
                            <!-- Transfusi Sebelumnya -->
                            <div class="col-12 col-md-6">
                                <span class="h_lable">Transfusi Sebelumnya</span>
                                <q-option-group v-model="form_edit.transfusi_sebelumnya"
                                    :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                    type="radio" inline />
                            </div>

                            <div class="col-12 col-md-6" v-show="form_edit.transfusi_sebelumnya === 'Ya'">
                                <span class="h_lable">Kapan (tanggal / keterangan)</span>
                                <q-input v-model="form_edit.transfusi_kapan" outlined square :dense="true"
                                    class="bg-white" placeholder="YYYY-MM-DD atau keterangan" />
                            </div>

                            <!-- Reaksi Transfusi -->
                            <div class="col-12 col-md-6 q-mt-sm">
                                <span class="h_lable">Reaksi Transfusi</span>
                                <q-option-group v-model="form_edit.reaksi_transfusi"
                                    :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                    type="radio" inline />
                            </div>

                            <div class="col-12 col-md-6" v-show="form_edit.reaksi_transfusi === 'Ya'">
                                <span class="h_lable">Gejala</span>
                                <q-input v-model="form_edit.gejala_transfusi" outlined square :dense="true"
                                    class="bg-white" placeholder="Jelaskan gejala reaksi" />
                            </div>

                            <!-- Coomb's test -->
                            <div class="col-12 col-md-6 q-mt-sm">
                                <span class="h_lable">Pernah diperiksa serologi (Coomb's test)?</span>
                                <q-option-group v-model="form_edit.coomb_test"
                                    :options="[{ label: 'Ya', value: 'Ya' }, { label: 'Tidak', value: 'Tidak' }]"
                                    type="radio" inline />
                            </div>

                            <div class="col-12 col-md-6" v-show="form_edit.coomb_test === 'Ya'">
                                <div class="row q-col-gutter-md">
                                    <div class="col-12 col-md-12">
                                        <span class="h_lable">Dimana (lab/rumah sakit)</span>
                                        <q-input v-model="form_edit.coomb_tempat" outlined square :dense="true"
                                            class="bg-white" />
                                    </div>
                                    <div class="col-12 col-md-6 q-mt-sm">
                                        <span class="h_lable">Kapan</span>
                                        <q-input v-model="form_edit.coomb_kapan" type="date" outlined square
                                            :dense="true" class="bg-white" />
                                    </div>
                                    <div class="col-12 col-md-6 q-mt-sm">
                                        <span class="h_lable">Hasil</span>
                                        <q-input v-model="form_edit.coomb_hasil" outlined square :dense="true"
                                            class="bg-white" placeholder="Negatif / Positif / Lainnya" />
                                    </div>
                                </div>
                            </div>
                        </div>

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
                <q-card-section class="bg-orange text-white row items-center justify-between">
                    <div class="text-h6 h_modalhead">Pemeriksaan UPD — Tahap 1</div>
                    <q-btn flat round dense icon="close" color="white" v-close-popup @click="closePeriksa"
                        aria-label="Tutup">
                        <q-tooltip content-class="bg-red">Tutup</q-tooltip>
                    </q-btn>
                </q-card-section>

                <q-card-section>
                    <div v-if="periksa_target">
                        <!-- Ringkasan singkat -->
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-md-6">
                                <div class="text-subtitle2">Nama Pasien</div>
                                <div class="text-body1 text-bold text-grey">{{ periksa_target.nama_pasien || '-' }}
                                </div>
                            </div>
                            <div class="col-12 col-md-6">
                                <div class="text-subtitle2">Komponen</div>
                                <div class="text-body1 text-bold text-grey">{{ periksa_target.nama_komponen || '-' }}
                                </div>
                            </div>
                        </div>

                        <q-separator spaced class="q-mt-md" />

                        <!-- <q-card-section> -->
                        <q-form @submit.prevent="saveStage1" ref="formStage1">
                            <div class="row q-col-gutter-md">
                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Petugas Pemeriksa</span>
                                    <q-input v-model="form1.petugas_pemeriksa" outlined square :dense="true" required
                                        class="bg-white" :rules="[v => !!v || 'Petugas harus diisi']" />
                                </div>

                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Tanggal Pemeriksaan</span>
                                    <!-- tampilkan tanggal yang di-format dari timestamp (read-only) -->
                                    <q-input outlined square :dense="true" class="bg-white" readonly
                                        :value="form1.tanggal_pemeriksaan ? formatDateFromTimestamp(form1.tanggal_pemeriksaan) : ''" />

                                </div>
                            </div>

                            <div class="row q-col-gutter-md">
                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Kadar Hb (g/dL)</span>
                                    <q-input v-model.number="form1.kadar_hb" type="number" outlined square :dense="true"
                                        class="bg-white" hint="Opsional (diisi jika tersedia)" />
                                </div>
                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Komponen Darah</span>
                                    <q-select v-model="form1.komponen_id" :options="list_komponen"
                                        option-label="nama_komponen" option-value="id" emit-value map-options outlined
                                        square :dense="true" class="bg-white" required />
                                </div>
                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Golongan Darah</span>
                                    <q-select v-model="form1.golongan_darah" :options="['A', 'B', 'O', 'AB']" outlined
                                        square dense class="bg-white" required />
                                </div>

                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Rhesus</span>
                                    <q-select v-model="form1.rhesus" :options="['+', '-']" outlined square dense
                                        class="bg-white" required />
                                </div>


                            </div>


                            <!-- Nomor Kantong + Exp berdampingan -->
                            <div class="row q-col-gutter-md q-mt-sm">
                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Jumlah Diberikan (Kantong)</span>
                                    <q-input v-model.number="form1.jumlah_darah_diberikan" type="number" outlined square
                                        :dense="true" class="bg-white" required />
                                </div>
                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Jumlah Diberikan (cc)</span>
                                    <q-input v-model.number="form1.jumlah_darah_diberikan_cc" type="number" outlined
                                        square :dense="true" class="bg-white" required />
                                </div>

                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Nomor Kantong</span>
                                    <q-input v-model.number="form1.nomor_kantong" outlined square :dense="true"
                                        class="bg-white" required />
                                </div>
                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Expired (exp)</span>
                                    <q-input v-model="form1.exp" required type="date" outlined square :dense="true"
                                        class="bg-white" />
                                </div>

                            </div>

                            <!-- Crossmatch 1-3 ditempatkan di bawah -->
                            <div class="row q-col-gutter-md q-mt-sm">
                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Crossmatch 1</span>
                                    <q-select v-model="form1.crossmatch_1" :options="['Cocok', 'Tidak', 'Emergency']"
                                        outlined square :dense="true" class="bg-white" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Crossmatch 2</span>
                                    <q-select v-model="form1.crossmatch_2" :options="['Cocok', 'Tidak', 'Emergency']"
                                        outlined square :dense="true" class="bg-white" />
                                </div>
                                <div class="col-12 col-md-4">
                                    <span class="h_lable">Crossmatch 3</span>
                                    <q-select v-model="form1.crossmatch_3" :options="['Cocok', 'Tidak', 'Emergency']"
                                        outlined square :dense="true" class="bg-white" />
                                </div>
                            </div>

                            <div class="col-12 q-mt-sm">
                                <span class="h_lable">Catatan Tambahan Pemeriksa</span>
                                <q-input outlined dense type="textarea" autogrow v-model="form1.catatan_tambahan"
                                    class="bg-white" required />
                            </div>

                            <!-- <div class="row items-center bg-grey-4 q-mt-md">
                                <q-space />
                                
                            </div> -->

                            <q-card-actions class="bg-grey-4 mdl-footer q-mt-md" align="right">
                                <q-btn label="Batal" color="negative" @click="closePeriksa" />
                                <q-btn :loading="loading1" color="primary" label="Simpan & Lanjut ke Tahap 2"
                                    type="submit" />
                            </q-card-actions>
                        </q-form>


                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>


        <!-- =========================
         Modal Pemeriksaan UPD - Tahap 2 (Pengambilan)
         muncul setelah Stage 1 sukses
         ========================= -->
        <!-- MODAL STAGE 2 (Pengambilan) — styled sama dengan form Add Data -->
        <q-dialog v-model="mdl_stage2" persistent>
            <q-card class="mdl-md">
                <q-card-section class="bg-teal text-white row items-center justify-between">
                    <div class="text-h6 h_modalhead">Pemeriksaan UPD — Tahap 2 (Pengambilan)</div>
                    <q-btn flat round dense icon="close" color="white" v-close-popup @click="closeStage2"
                        aria-label="Tutup">
                        <q-tooltip content-class="bg-red">Tutup</q-tooltip>
                    </q-btn>
                </q-card-section>

                <form @submit.prevent="saveStage2">
                    <q-card-section class="q-pt-none">
                        <hr class="hrpagin2" />
                        <div v-if="stage2_target">
                            <!-- header ringkas -->
                            <div class="text-subtitle2 q-mb-sm">Data Pengambilan (ID: {{ stage2_target.id || '-' }})
                            </div>

                            <q-separator spaced class="q-mt-sm" />

                            <div class="row q-col-gutter-md">
                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Petugas Pengeluar</span>
                                    <q-input outlined square :dense="true" v-model="form2.petugas_pengeluar"
                                        class="bg-white margin_btn"
                                        :rules="[v => !!v || 'Petugas pengeluar harus diisi']" />
                                </div>

                                <div class="col-12 col-md-6">
                                    <span class="h_lable">Penerima Darah</span>
                                    <q-input outlined square :dense="true" v-model="form2.penerima_darah"
                                        class="bg-white margin_btn" :rules="[v => !!v || 'Penerima harus diisi']" />
                                </div>
                            </div>

                            <div class="row q-col-gutter-md">
                                <div class="col-12">
                                    <span class="h_lable">Catatan Pengambilan (opsional)</span>
                                    <q-input outlined square :dense="true" type="textarea" autogrow
                                        v-model="form2.catatan_pengambilan" class="bg-white margin_btn" />
                                </div>
                            </div>

                        </div>
                    </q-card-section>

                    <hr class="hrpagin2" />

                    <q-card-actions class="bg-grey-4 mdl-footer" align="right">
                        <q-btn label="Batal" color="negative" @click="closeStage2" />
                        <q-btn :loading="loading2" color="teal" label="Simpan" type="submit" />
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
                        <q-input v-model="reject_reason" type="textarea" outlined square :dense="true" autogrow
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

        <!-- MODAL TAMPILKAN PENGAMBILAN (styled sama persis dengan mdl_hapus) -->
        <q-dialog v-model="mdl_taken" persistent>
            <q-card class="mdl-sm">
                <q-card-section class="q-pt-none text-center redGrad">
                    <div>
                        <br>
                        <img src="img/alert.png" alt="" width="75"> <br>

                        <!-- Judul -->
                        <div class="q-mt-sm">
                            <span class="h_notifikasi">DETAIL PENGAMBILAN DARAH</span>
                        </div>

                        <!-- Konten info -->
                        <div class="q-mt-md text-white" style="text-align:left; margin: 0 18px; margin-top: 18px">

                            <div class="q-mb-sm">
                                <strong>Petugas Pengeluar:</strong>
                                <div class="q-ml-sm" style="color:#fff;">
                                    {{ taken_target && taken_target.petugas_pengeluar ? taken_target.petugas_pengeluar :
                                '-' }}
                                </div>
                            </div>

                            <div class="q-mb-sm">
                                <strong>Penerima Darah:</strong>
                                <div class="q-ml-sm" style="color:#fff;">
                                    {{ taken_target && taken_target.penerima_darah ? taken_target.penerima_darah : '-'
                                    }}
                                </div>
                            </div>

                            <div class="q-mb-sm">
                                <strong>Catatan Pengambilan:</strong>
                                <div class="q-ml-sm" style="color:#fff; white-space:pre-wrap;">
                                    {{ taken_target && taken_target.catatan_pengambilan ?
                                taken_target.catatan_pengambilan : '-' }}
                                </div>
                            </div>

                            <div class="q-mb-sm">
                                <strong>Jumlah Kantong:</strong>
                                <div class="q-ml-sm" style="color:#fff; white-space:pre-wrap;">
                                    {{ taken_target && taken_target.jumlah_darah_diberikan ?
                                taken_target.jumlah_darah_diberikan : '-' }} Kantong {{ taken_target &&
                                taken_target.jumlah_darah_diberikan_cc ?
                                taken_target.jumlah_darah_diberikan_cc : '-' }}cc
                                </div>
                            </div>

                            <div class="q-mb-sm">
                                <strong>Tanggal Expired:</strong>
                                <div class="q-ml-sm" style="color:#fff;">
                                    {{ taken_target && taken_target.exp ?
                                UMUM.tglConvert(taken_target.exp) : '-' }}
                                </div>
                            </div>
                            <div class="q-mb-sm">
                                <strong>Tanggal & Jam Pengambilan:</strong>
                                <div class="q-ml-sm" style="color:#fff;">
                                    {{ taken_target && taken_target.tanggal_pengambilan ?
                                UMUM.tglConvertx(taken_target.tanggal_pengambilan, true) : '-' }}
                                </div>
                            </div>

                        </div>

                        <br>
                    </div>

                    <q-card-actions align="center">
                        <q-btn label="Tutup" size="sm" color="negative" v-close-popup @click="closeTaken" />
                        &nbsp;

                        <q-btn v-if="tipe === 3" label="Diterima" size="sm" color="primary" :loading="loadingTaken"
                            @click="confirmTaken" />
                    </q-card-actions>
                </q-card-section>
            </q-card>
        </q-dialog>


        <q-dialog v-model="mdl_taken_ruangan" persistent>
            <q-card class="mdl-sm">
                <q-card-section class="q-pt-none text-center hijauMudaGrad">
                    <div>
                        <br>
                        <img src="img/approve.png" alt="" width="75"> <br>

                        <!-- Judul -->
                        <div class="q-mt-sm">
                            <span class="h_notifikasi">PERMINTAAN DARAH SELESAI</span>
                        </div>

                        <!-- Konten info -->
                        <div class="q-mt-md text-white" style="text-align:left; margin: 0 18px; margin-top: 18px">


                            <div class="q-mb-sm text-center">
                                <strong>Tanggal & Jam Tiba diruangan:</strong>
                                <div class="q-mt-sm" style="color:#fff;">
                                    {{ taken_target && taken_target.updated_at ?
                                    UMUM.tglConvertx(taken_target.updated_at, true) : '-' }}
                                </div>
                            </div>

                        </div>

                        <br>
                    </div>

                    <!-- footer action (tengah) -->
                    <q-card-actions align="center">
                        <q-btn label="Tutup" size="sm" color="negative" v-close-popup @click="closeTaken" />
                        &nbsp;

                        <q-btn v-if="tipe === 3" label="Diterima" size="sm" color="primary" :loading="loadingTaken"
                            @click="confirmTaken" />
                    </q-card-actions>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- ================================================ MODAL KEMBALIKAN KE DIPERIKSA ================================================ -->
        <q-dialog v-model="mdl_revert" persistent>
            <q-card class="mdl-sm ">
                <q-card-section class="q-pt-none text-center orageGrad">
                    <form @submit.prevent="confirmRevert">
                        <br>
                        <img src="img/alert.png" alt="" width="75" /> <br>
                        <span class="h_notifikasi">APAKAH ANDA YAKIN INGIN MENGEMBALIKAN PERMINTAAN INI KE STATUS
                            DIPERIKSA (2)?</span>
                        <input type="submit" style="position: absolute; left: -9999px" />
                        <br><br>

                        <q-btn label="Batal" size="sm" color="negative" v-close-popup @click="revert_target = null" />
                        &nbsp;
                        <q-btn type="submit" label="Ya, Kembalikan" size="sm" color="primary" v-close-popup />

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
                jumlah_kehamilan: null,
                pernah_abortus: '',
                pernah_hdn: '',

                transfusi_sebelumnya: 'Tidak',
                transfusi_kapan: '',
                reaksi_transfusi: 'Tidak',
                gejala_transfusi: '',

                coomb_test: 'Tidak',
                coomb_tempat: '',
                coomb_kapan: '',
                coomb_hasil: '',

                golongan_darah: '',
                rhesus: '',
                komponen_id: null,
                jumlah_kantong: 1,
                jumlah_cc: '',
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
                jumlah_cc: '',
                diagnosis_klinis: '',
                alasan_transfusi: '',
                kadar_hb: null,
                status: 1,
                status_keterangan: '',
                transfusi_sebelumnya: 'Tidak',
                transfusi_kapan: '',
                reaksi_transfusi: 'Tidak',
                gejala_transfusi: '',
                coomb_test: 'Tidak',
                coomb_tempat: '',
                coomb_kapan: '',
                coomb_hasil: ''
            },

            // tambah di data()
            periksa_target: null, // dipakai di template untuk ringkasan sebelum periksa
            // form1 dipakai oleh template modal tahap 1 (sesuaikan struktur)
            form1: {
                id: null,
                petugas_pemeriksa: '',
                tanggal_pemeriksaan: null,
                komponen_id: null,
                // golongan_darah_hasil: '',
                golongan_darah: '',
                rhesus: '',
                exp: '',
                // rhesus_hasil: '',
                kadar_hb: null,
                catatan_tambahan: '',
                crossmatch_1: '',
                crossmatch_2: '',
                crossmatch_3: '',
                jumlah_darah_diberikan: null,
                jumlah_darah_diberikan_cc: null,
                nomor_kantong: ''
            },
            loading1: false, // jika dipakai sebagai v-loading pada tombol Simpan Tahap1




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
                { label: 'Semua', value: null },
                { label: 'Diajukan', value: 1 },
                { label: 'Diperiksa', value: 2 },
                { label: 'Siap Diambil', value: 3 },
                { label: 'Selesai', value: 4 },
                { label: 'Ditolak', value: 5 },
                { label: 'Telah Diambil', value: 6 }
            ],

            mdl_periksa: false,
            mdl_reject: false,
            btn_periksa: false,
            btn_reject: false,

            reject_reason: '',
            /* ===== Stage 2 (Pengambilan) state ===== */
            mdl_stage2: false,
            stage2_target: null,
            form2: {
                petugas_pengeluar: '',
                penerima_darah: '',

                catatan_pengambilan: ''
            },
            loading2: false,
            mdl_taken: false,
            mdl_taken_ruangan: false,
            taken_target: null,
            loadingTaken: false,

            mdl_revert: false,
            revert_target: null,
            loadingRevert: false


        }
    },

    methods: {

        openRevertModal(row) {
            this.revert_target = row;
            this.mdl_revert = true;
        },

        async confirmRevert() {
            if (!this.revert_target || !this.revert_target.id) {
                this.$q.notify({ type: 'negative', message: 'Data tidak valid' });
                this.mdl_revert = false;
                this.revert_target = null;
                return;
            }

            const row = this.revert_target;
            const payload = {
                id: row.id,
                previous_status: row.status,
                status: 2,
                status_keterangan: 'Dikembalikan ke Diperiksa oleh Admin UPD'
            };

            try {
                this.loadingRevert = true;

                const res = await this.updateStatusRequest(payload);

                if (res && res.success) {
                    this.$q.notify({
                        type: 'positive',
                        message: res.message || 'Berhasil mengembalikan ke Diperiksa'
                    });

                    row.status = 2;

                    if (this.lihat_target && this.lihat_target.id === row.id) {
                        this.lihat_target.status = 2;
                        this.lihat_target.status_keterangan = payload.status_keterangan;
                    }

                    this.mdl_revert = false;
                    this.revert_target = null;

                    await this.openPeriksaFor(row);
                } else {
                    this.$q.notify({
                        type: 'negative',
                        message: res?.message || 'Gagal mengubah status'
                    });

                    this.mdl_revert = false;
                    this.revert_target = null;
                }

            } catch (err) {
                console.error('confirmRevert error', err);
                this.$q.notify({
                    type: 'negative',
                    message: 'Terjadi kesalahan saat mengubah status'
                });
                this.mdl_revert = false;
                this.revert_target = null;
            } finally {
                this.loadingRevert = false;
            }
        },
        async handleRevertToPeriksa(row) {
            if (!row || !row.id) {
                this.$q.notify({ type: 'negative', message: 'Data tidak valid' });
                return;
            }

            // optional: konfirmasi singkat
            const ok = await this.$q.dialog({
                title: 'Konfirmasi',
                message: 'Kembalikan permintaan ini ke status Diperiksa (2) dan buka form Pemeriksaan UPD?',
                cancel: true,
                persistent: true
            }).onOk(() => true).onCancel(() => false).onDismiss(() => false);

            if (!ok) return;

            // payload untuk backend (sesuaikan field sesuai API Anda)
            const payload = {
                id: row.id,
                previous_status: row.status,
                status: 2,
                status_keterangan: 'Dikembalikan ke Diperiksa oleh Admin UPD'
            };

            try {
                this.$q.loading.show();
                const res = await this.updateStatusRequest(payload);
                if (res && res.success) {
                    this.$q.notify({ type: 'positive', message: res.message || 'Berhasil mengembalikan ke Diperiksa' });

                    // update lokal agar UI langsung reflektif
                    row.status = 2;
                    if (this.lihat_target && this.lihat_target.id === row.id) {
                        this.lihat_target.status = 2;
                        this.lihat_target.status_keterangan = payload.status_keterangan;
                    }

                    // buka modal pemeriksaan (Tahap 1) — ini sudah ada di file: openPeriksaFor
                    await this.openPeriksaFor(row);
                } else {
                    this.$q.notify({ type: 'negative', message: res?.message || 'Gagal mengubah status' });
                }
            } catch (err) {
                console.error('handleRevertToPeriksa error', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat mengubah status' });
            } finally {
                this.$q.loading.hide();
            }
        },


        statusColor(st) {
            const s = Number(st);
            if (s === 1) return 'orange';    // Diajukan
            if (s === 2) return 'info';      // Diperiksa
            if (s === 3) return 'secondary'; // Siap Diambil (gunakan warna berbeda)
            if (s === 4) return 'positive';  // Selesai (diambil)
            if (s === 5) return 'negative';  // Ditolak
            if (s === 6) return 'accent';  // Ditolak
            return 'grey';
        },
        getView() {
            const queryObj = {
                page: this.page_first,
                limit: this.page_limit,
                cari_value: this.cari_value || '',
                komponen_id: this.filter.komponen_id || '',
                golongan_darah: this.filter.golongan_darah || ''
            };

            // hanya kirim status jika ada isinya
            if (this.filter.status !== null && this.filter.status !== '') {
                queryObj.status = this.filter.status;
            }

            const query = new URLSearchParams(queryObj).toString();


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

        // getRuangan() {
        //     // ganti key URL sesuai store kamu; saya asumsikan ada this.$store.state.url.TENAGA_MEDIS
        //     const URL = this.$store.state.url.REGIS_MEDIS || (this.$store.state.url.BASE || '') + "getview/";
        //     fetch(URL + "getview", {
        //         method: "POST",
        //         headers: {
        //             "content-type": "application/json",
        //             authorization: "kikensbatara " + localStorage.token
        //         },
        //         body: JSON.stringify({})
        //     })
        //         .then(res => res.json())
        //         .then(res_data => {
        //             // server diharapkan mengembalikan array objek tenaga_medis dengan properti id dan nama_ruangan
        //             this.list_ruangan = res_data.data || []
        //         })
        //         .catch(err => console.error("Error getRuangan:", err))
        // },


        addData() {
            this.btn_add = true
            if (this.form.jenis_kelamin === 'P') {
                if (this.form.jumlah_kehamilan === null || this.form.jumlah_kehamilan === '') {
                    this.$q.notify({ type: 'negative', message: 'Jumlah kehamilan harus diisi untuk pasien wanita' });
                    return;
                }
            }

            if (this.form.transfusi_sebelumnya === 'Ya') {
                if (!this.form.transfusi_kapan || this.form.transfusi_kapan.trim() === '') {
                    this.$q.notify({ type: 'negative', message: 'Mohon isi tanggal/keterangan transfusi sebelumnya.' });
                    this.btn_add = false;
                    return;
                }
            }

            if (this.form.reaksi_transfusi === 'Ya') {
                if (!this.form.gejala_transfusi || this.form.gejala_transfusi.trim() === '') {
                    this.$q.notify({ type: 'negative', message: 'Mohon jelaskan gejala reaksi transfusi.' });
                    this.btn_add = false;
                    return;
                }
            }

            if (this.form.coomb_test === 'Ya') {
                if (!this.form.coomb_tempat || this.form.coomb_tempat.trim() === '' ||
                    !this.form.coomb_kapan || this.form.coomb_kapan.trim() === '' ||
                    !this.form.coomb_hasil || this.form.coomb_hasil.trim() === '') {
                    this.$q.notify({ type: 'negative', message: 'Mohon lengkapi data pemeriksaan serologi (Coomb\'s test): tempat, kapan, dan hasil.' });
                    this.btn_add = false;
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
            let ruanganId = null
            let rumahSakitId = 1

            try {
                const p = JSON.parse(localStorage.profile || '{}')
                if (p?.profile?.ruangan_id) {
                    ruanganId = Number(p.profile.ruangan_id)
                }
                if (p?.profile?.rumah_sakit_id) {
                    rumahSakitId = Number(p.profile.rumah_sakit_id)
                }
            } catch (e) { }
            this.form = {
                rumah_sakit_id: 1,
                ruangan_id: ruanganId,
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
                jumlah_cc: '',
                diagnosis_klinis: '',
                alasan_transfusi: '',
                kadar_hb: null,
                status: 1,
                status_keterangan: 'Menunggu Diperiksa oleh Admin UPD',
                transfusi_sebelumnya: 'Tidak',
                transfusi_kapan: '',
                reaksi_transfusi: 'Tidak',
                gejala_transfusi: '',
                coomb_test: 'Tidak',
                coomb_tempat: '',
                coomb_kapan: '',
                coomb_hasil: ''
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
                jumlah_cc: row.jumlah_cc || 1,
                diagnosis_klinis: row.diagnosis_klinis || '',
                alasan_transfusi: row.alasan_transfusi || '',
                kadar_hb: row.kadar_hb || null,
                status: row.status || 1,
                status_keterangan: row.status_keterangan || '',
                transfusi_sebelumnya: row.transfusi_sebelumnya || 'Tidak',
                transfusi_kapan: row.transfusi_kapan || '',
                reaksi_transfusi: row.reaksi_transfusi || 'Tidak',
                gejala_transfusi: row.gejala_transfusi || '',
                coomb_test: row.coomb_test || 'Tidak',
                coomb_tempat: row.coomb_tempat || '',
                coomb_kapan: row.coomb_kapan || '',
                coomb_hasil: row.coomb_hasil || ''
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
            // validation for additional fields
            if (this.form_edit.jenis_kelamin === 'P') {
                if (this.form_edit.jumlah_kehamilan === null || this.form_edit.jumlah_kehamilan === '') {
                    this.$q.notify({ type: 'negative', message: 'Jumlah kehamilan harus diisi untuk pasien wanita' });
                    return;
                }
            }

            if (this.form_edit.transfusi_sebelumnya === 'Ya') {
                if (!this.form_edit.transfusi_kapan || this.form_edit.transfusi_kapan.trim() === '') {
                    this.$q.notify({ type: 'negative', message: 'Mohon isi tanggal/keterangan transfusi sebelumnya.' });
                    return;
                }
            }

            if (this.form_edit.reaksi_transfusi === 'Ya') {
                if (!this.form_edit.gejala_transfusi || this.form_edit.gejala_transfusi.trim() === '') {
                    this.$q.notify({ type: 'negative', message: 'Mohon jelaskan gejala reaksi transfusi.' });
                    return;
                }
            }

            if (this.form_edit.coomb_test === 'Ya') {
                if (!this.form_edit.coomb_tempat || this.form_edit.coomb_tempat.trim() === '' ||
                    !this.form_edit.coomb_kapan || this.form_edit.coomb_kapan.trim() === '' ||
                    !this.form_edit.coomb_hasil || this.form_edit.coomb_hasil.trim() === '') {
                    this.$q.notify({ type: 'negative', message: 'Mohon lengkapi data pemeriksaan serologi (Coomb\'s test): tempat, kapan, dan hasil.' });
                    return;
                }
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

            this.btn_periksa = true;

            try {
                // set status = 2 (Diperiksa)
                const payload = { id: row.id, status: 2 };
                const res = await this.updateStatusRequest(payload);

                // update local UI
                row.status = 2;
                if (this.lihat_target && this.lihat_target.id === row.id) {
                    this.lihat_target.status = 2;
                    this.lihat_target.status_keterangan = 'Permintaan Sedang diperiksa';
                }

                // set periksa_target (dipakai di template)
                this.periksa_target = row;

                // isi form1 (prefill)
                this.form1 = {
                    id: row.id,
                    petugas_pemeriksa: row.petugas_pemeriksa || '',
                    komponen_id: row.komponen_id || null,
                    // set tanggal pemeriksaan sebagai TIMESTAMP (milidetik) lokal
                    tanggal_pemeriksaan: Date.now(),

                    exp: row.exp || new Date().toISOString().slice(0, 10),
                    golongan_darah: row.golongan_darah || '',
                    rhesus: row.rhesus || '',
                    kadar_hb: row.kadar_hb || null,
                    catatan_tambahan: row.catatan_tambahan || '',
                    crossmatch_1: row.crossmatch_1 || '',
                    crossmatch_2: row.crossmatch_2 || '',
                    crossmatch_3: row.crossmatch_3 || '',
                    jumlah_darah_diberikan: row.jumlah_darah_diberikan || null,
                    jumlah_darah_diberikan_cc: row.jumlah_darah_diberikan_cc || null,
                    nomor_kantong: row.nomor_kantong || ''
                };

                this.mdl_periksa = true;
                this.getView();
            } catch (err) {
                console.error('Error openPeriksaFor:', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memulai pemeriksaan' });
            } finally {
                this.btn_periksa = false;
            }
        },

        async saveStage1() {

            if (!this.form1.komponen_id) {
                this.$q.notify({
                    type: 'negative',
                    message: 'Komponen darah wajib diisi pada tahap pemeriksaan'
                });
                return;
            }
            // minimal validation
            if (!this.form1 || !this.form1.id) {
                this.$q.notify({ type: 'negative', message: 'Form pemeriksaan belum terisi dengan benar' });
                return;
            }
            if (!this.form1.petugas_pemeriksa) {
                this.$q.notify({ type: 'negative', message: 'Petugas pemeriksa harus diisi' });
                return;
            }

            this.loading1 = true;
            try {
                // payload untuk tahap 1 -> set status = 3 (Siap Diambil)
                const payload = {
                    id: this.form1.id,
                    status: 3,
                    status_keterangan: 'Siap diambil - Menunggu pengambilan oleh keluarga/ruangan',
                    komponen_id: this.form1.komponen_id,
                    petugas_pemeriksa: this.form1.petugas_pemeriksa,
                    golongan_darah: this.form1.golongan_darah,
                    rhesus: this.form1.rhesus,
                    rhesus: this.form1.rhesus || null,
                    exp: this.form1.exp || null,
                    catatan_tambahan: this.form1.catatan_tambahan || null,
                    crossmatch_1: this.form1.crossmatch_1 || null,
                    crossmatch_2: this.form1.crossmatch_2 || null,
                    crossmatch_3: this.form1.crossmatch_3 || null,
                    jumlah_darah_diberikan: this.form1.jumlah_darah_diberikan || null,
                    jumlah_darah_diberikan_cc: this.form1.jumlah_darah_diberikan_cc || null,
                    nomor_kantong: this.form1.nomor_kantong || null
                };

                const res = await this.updateStatusRequest(payload);
                if (!res || !res.success) {
                    this.$q.notify({ type: 'negative', message: res && res.message ? res.message : 'Gagal menyimpan hasil pemeriksaan' });
                    return;
                }

                this.$q.notify({ type: 'positive', message: res.message || 'Simpan tahap 1 berhasil. Lanjut ke Tahap 2.' });

                // update lihat_target (jika terbuka)
                if (this.lihat_target && this.lihat_target.id === this.form1.id) {
                    this.lihat_target.status = 3;
                    this.lihat_target.status_keterangan = payload.status_keterangan;
                    Object.assign(this.lihat_target, {
                        petugas_pemeriksa: payload.petugas_pemeriksa,
                        tanggal_pemeriksaan: payload.tanggal_pemeriksaan,
                        golongan_darah: payload.golongan_darah,
                        rhesus: payload.rhesus,
                        catatan_tambahan: payload.catatan_tambahan,
                        crossmatch_1: payload.crossmatch_1,
                        crossmatch_2: payload.crossmatch_2,
                        crossmatch_3: payload.crossmatch_3,
                        jumlah_darah_diberikan: payload.jumlah_darah_diberikan,
                        jumlah_darah_diberikan_cc: payload.jumlah_darah_diberikan_cc,
                        nomor_kantong: payload.nomor_kantong
                    });
                }

                this.$q.notify({ type: 'positive', message: 'Darah Siap diambil.' });
                this.mdl_periksa = false;
                this.getView();

            } catch (err) {
                console.error('saveStage1 error', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat menyimpan tahap 1' });
            } finally {
                this.loading1 = false;
            }
        },


        // Stage 2 (simpan pengambilan) -> status = 4 (Selesai)
        async saveStage2() {
            if (!this.stage2_target || !this.stage2_target.id) {
                this.$q.notify({ type: 'negative', message: 'Tidak ada permintaan yang dipilih untuk pengambilan' });
                return;
            }

            // validasi minimal
            if (!this.form2.petugas_pengeluar || !this.form2.penerima_darah) {
                this.$q.notify({ type: 'negative', message: 'Isi semua field wajib pengambilan' });
                return;
            }

            this.loading2 = true;

            try {
                const payload = {
                    id: this.stage2_target.id,
                    status: 6, // selesai / sudah diambil
                    status_keterangan: 'Sudah diambil',
                    petugas_pengeluar: this.form2.petugas_pengeluar,
                    penerima_darah: this.form2.penerima_darah,
                    catatan_pengambilan: this.form2.catatan_pengambilan || null
                };

                const res = await this.updateStatusRequest(payload);

                if (!res || !res.success) {
                    this.$q.notify({ type: 'negative', message: res && res.message ? res.message : 'Gagal menyimpan pengambilan' });
                    return;
                }

                this.$q.notify({ type: 'positive', message: res.message || 'Pengambilan berhasil disimpan. Permintaan selesai.' });

                // update local lihat_target jika relevan
                if (this.lihat_target && this.lihat_target.id === this.stage2_target.id) {
                    this.lihat_target.status = 4;
                    this.lihat_target.status_keterangan = payload.status_keterangan;
                    Object.assign(this.lihat_target, {
                        petugas_pengeluar: payload.petugas_pengeluar,
                        penerima_darah: payload.penerima_darah,
                        catatan_pengambilan: payload.catatan_pengambilan
                    });
                }

                // tutup modal stage2 dan refresh daftar
                this.mdl_stage2 = false;
                this.stage2_target = null;
                this.getView();

            } catch (err) {
                console.error('Error saveStage2:', err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat menyimpan pengambilan' });
            } finally {
                this.loading2 = false;
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
                status: 5,
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

        closePeriksa() {
            this.mdl_periksa = false;
            this.periksa_target = null;
            // reset form1 agar bersih
            this.form1 = {
                id: null,
                petugas_pemeriksa: '',
                tanggal_pemeriksaan: '',
                golongan_darah: '',
                rhesus: '',
                kadar_hb: null,
                catatan_tambahan: '',
                crossmatch_1: '',
                crossmatch_2: '',
                crossmatch_3: '',
                jumlah_darah_diberikan: null,
                jumlah_darah_diberikan_cc: null,
                nomor_kantong: ''
            };
            this.loading1 = false;
        },

        openStage2(row) {
            if (!row || !row.id) {
                this.$q.notify({ type: 'negative', message: 'Data permintaan tidak valid' });
                return;
            }

            const st = Number(row.status);

            if (st === 3) {
                // Buka modal Stage 2 untuk input pengambilan (seperti sebelumnya)
                this.stage2_target = { id: row.id };
                // prefill form2 bila ada data
                this.form2 = {
                    petugas_pengeluar: row.petugas_pengeluar || '',
                    penerima_darah: row.penerima_darah || '',
                    tanggal_pengambilan: row.tanggal_pengambilan || null,
                    jam_pengambilan: row.jam_pengambilan || null,
                    catatan_pengambilan: row.catatan_pengambilan || ''
                };
                this.mdl_stage2 = true;
                return;
            }

            if (st === 6) {
                // Buka modal read-only untuk data pengambilan
                this.taken_target = Object.assign({}, row);
                this.mdl_taken = true;
                return;
            }
            if (st === 4) {
                // Buka modal read-only untuk data pengambilan
                this.taken_target = Object.assign({}, row);
                this.mdl_taken_ruangan = true;
                return;
            }

            // fallback: jika bukan 3 atau 6, buka keterangan seperti biasa
            this.lihatKeterangan(row);
        },

        closeTaken() {
            this.mdl_taken = false;
            this.mdl_taken_ruangan = false;
            this.taken_target = null;
        },


        closeStage2() {
            this.mdl_stage2 = false;
            this.stage2_target = null;
            this.form2 = {
                petugas_pengeluar: '',
                penerima_darah: '',

                catatan_pengambilan: ''
            };
            this.loading2 = false;
        },

        async confirmTaken() {
            if (!this.taken_target || !this.taken_target.id) {
                this.$q.notify({ type: 'negative', message: 'Data tidak valid' });
                return;
            }

            this.loadingTaken = true;

            try {
                const payload = {
                    id: this.taken_target.id,
                    status: 4,                           // ubah status ke 4 (Diterima)
                    status_keterangan: "Darah telah diterima"
                };

                const res = await this.updateStatusRequest(payload);

                if (!res || !res.success) {
                    this.$q.notify({ type: 'negative', message: res?.message || 'Gagal mengubah status' });
                    return;
                }

                this.$q.notify({ type: 'positive', message: 'Status berhasil diubah menjadi Diterima' });

                // tutup modal dan refresh list
                this.mdl_taken = false;
                this.taken_target = null;
                this.getView();

            } catch (err) {
                console.error("Error confirmTaken:", err);
                this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat mengubah status' });
            } finally {
                this.loadingTaken = false;
            }
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
            if (c === 3) return 'Siap Diambil (Menunggu Pengambilan)'
            if (c === 4) return 'Permintaan Darah sudah Berhasil'
            if (c === 6) return 'Darah Telah di Ambil Petugas Ruangan/Keluarga Pasien'
            if (c === 5) return keterangan || 'Ditolak'
            return '-'
        },
        formatDateFromTimestamp(ts) {
            if (!ts) return '';
            const d = (typeof ts === 'number') ? new Date(ts) : new Date(Number(ts));
            const pad = n => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            // atau return human readable: `${pad(d.getDate())}-${d.toLocaleString('default',{month:'short'})}-${d.getFullYear()}`
        },

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
        // this.getRuangan()
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

.detail-table {
    display: table;
    width: 100%;
}

.row-line {
    display: table-row;
}

.label {
    display: table-cell;
    padding: 4px 0;
    font-weight: 600;
    white-space: nowrap;
    width: 140px;
    /* atur sesuai estetika */
}

.colon {
    display: table-cell;
    width: 10px;
    font-weight: 600;
}

.value {
    display: table-cell;
    padding-left: 6px;
    color: #777676 !important;
}
</style>
