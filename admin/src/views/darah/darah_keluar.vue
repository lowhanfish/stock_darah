<template>
    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <!-- ================= HEADER ================= -->
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Darah Keluar</div>
                        <div class="text-h8">Laporan Detail Darah Keluar</div>
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="row">
                            <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true"
                                class="bg-white" style="width:100%"
                                placeholder="Cari nama pasien, No RM, No kantong..." />
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <hr class="hrpagin2">

        <!-- ================= FILTER ================= -->
        <div class="row q-col-gutter-md">
            <div class="col-6 col-md-2">
                <span class="h_lable">Bulan</span>
                <q-select v-model="filter.bulan" :options="bulanOptions" option-label="label" option-value="value"
                    emit-value map-options outlined dense class="bg-white" @input="applyFilter" clearable />
            </div>
            <div class="col-6 col-md-2">
                <span class="h_lable">Tahun</span>
                <q-select v-model="filter.tahun" :options="tahunOptions" outlined dense class="bg-white"
                    @input="applyFilter" clearable />
            </div>
            <div class="col-6 col-md-2">
                <span class="h_lable">Golongan Darah</span>
                <q-select v-model="filter.golongan_darah" :options="['A', 'B', 'O', 'AB']" outlined dense
                    class="bg-white" @input="applyFilter" clearable />
            </div>
            <div class="col-6 col-md-3">
                <span class="h_lable">Komponen</span>
                <q-select v-model="filter.komponen_id" :options="list_komponen" option-label="nama_komponen"
                    option-value="id" emit-value map-options outlined dense class="bg-white" @input="applyFilter"
                    clearable />
            </div>
            <div class="col-12 col-md-3">
                <span class="h_lable">Ruangan</span>
                <q-select v-model="filter.ruangan_id" :options="list_ruangan" option-label="nama_ruangan"
                    option-value="id" emit-value map-options outlined dense class="bg-white" @input="applyFilter"
                    clearable />
            </div>
        </div>

        <hr class="hrpagin2" />

        <!-- ================= REKAP RINGKASAN ================= -->
        <q-card bordered class="q-mb-md" v-if="rekap.length > 0">
            <q-card-section class="q-pa-sm">
                <div class="text-subtitle2 q-mb-sm text-bold">
                    <q-icon name="bar_chart" color="primary" class="q-mr-xs" />
                    Rekapitulasi Darah Keluar
                    <span v-if="filter.bulan"> — {{ getBulanLabel(filter.bulan) }}</span>
                    <span v-if="filter.tahun"> {{ filter.tahun }}</span>
                </div>
                <div class="tbl_responsive">
                    <table width="100%">
                        <thead class="h_table_head main2x text-white">
                            <tr>
                                <th class="text-center" rowspan="2">KOMPONEN</th>
                                <th class="text-center" colspan="8">Golongan Darah</th>
                                <th class="text-center" rowspan="2">TOTAL</th>
                            </tr>
                            <tr>
                                <th class="text-center" v-for="col in colsRekap" :key="col" style="color: red;">{{ col
                                }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, idx) in rekapMatrix" :key="row.Komponen + '-' + idx" class="h_table_body">
                                <td>{{ row.Komponen }}</td>
                                <td v-for="col in colsRekap" :key="col" class="text-center">
                                    {{ formatNumber(row[col]) }}
                                </td>
                                <td class="text-right"><strong>{{ formatNumber(row.Total) }}</strong></td>
                            </tr>
                            <tr class="h_table_body" v-if="rekapMatrix.length > 0">
                                <td class="main2x text-white text-bold text-center">JUMLAH</td>
                                <td class="text-center" colspan="2">
                                    <strong>{{ formatNumber(rekapGroupTotals.A) }}</strong>
                                </td>
                                <td class="text-center" colspan="2">
                                    <strong>{{ formatNumber(rekapGroupTotals.B) }}</strong>
                                </td>
                                <td class="text-center" colspan="2">
                                    <strong>{{ formatNumber(rekapGroupTotals.O) }}</strong>
                                </td>
                                <td class="text-center" colspan="2">
                                    <strong>{{ formatNumber(rekapGroupTotals.AB) }}</strong>
                                </td>
                                <td class="text-right">
                                    <strong>{{ formatNumber(rekapGroupTotals.Total) }}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </q-card-section>
        </q-card>

        <!-- ================= TABEL DETAIL ================= -->
        <div class="tbl_responsive">
            <table width="100%">
                <thead class="h_table_head main2x text-white">
                    <tr>
                        <th width="4%" class="text-center">No</th>
                        <th width="12%">Tanggal Keluar</th>
                        <th width="10%">No. Kantong</th>
                        <th width="5%" class="text-center">Gol</th>
                        <th width="4%" class="text-center">Rh</th>
                        <th width="12%">Komponen</th>
                        <th width="5%" class="text-center">Jml</th>
                        <th width="14%">Nama Pasien</th>
                        <th width="8%">No. RM</th>
                        <th width="12%">Ruangan</th>
                        <th width="10%">Petugas</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, index) in list_data" :key="data.id + '-' + index" class="h_table_body">
                        <td class="text-center">{{ indexing(index + 1) }}</td>
                        <td>{{ formatTanggal(data.tanggal_keluar) }}</td>
                        <td>
                            <q-badge color="blue-grey-7">{{ data.nomor_kantong || '-' }}</q-badge>
                        </td>
                        <td class="text-center">
                            <strong>{{ data.golongan_darah || '-' }}</strong>
                        </td>
                        <td class="text-center">{{ data.rhesus || '-' }}</td>
                        <td>{{ data.nama_komponen || '-' }}</td>
                        <td class="text-center">{{ data.jumlah || '-' }}</td>
                        <td><strong>{{ data.nama_pasien || '-' }}</strong></td>
                        <td>{{ data.nomor_rm || '-' }}</td>
                        <td>{{ data.nama_ruangan || '-' }}</td>
                        <td>{{ data.petugas_pengeluar || '-' }}</td>
                    </tr>

                    <tr v-if="list_data.length === 0">
                        <td colspan="11" class="text-center text-grey">
                            Belum ada data darah keluar untuk filter yang dipilih.
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

        <!-- Info total -->
        <div class="q-mt-sm text-center text-caption text-grey-7" v-if="total_data > 0">
            Menampilkan {{ list_data.length }} dari {{ total_data }} data darah keluar
        </div>

    </div>
</template>

<script>
export default {
    data() {
        return {
            list_data: [],
            list_komponen: [],
            list_ruangan: [],
            rekap: [],
            rekapMatrix: [],
            colsRekap: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],

            page_first: 1,
            page_last: 0,
            page_limit: 15,
            total_data: 0,
            cari_value: '',

            filter: {
                bulan: new Date().getMonth() + 1,
                tahun: new Date().getFullYear(),
                golongan_darah: '',
                komponen_id: '',
                ruangan_id: ''
            },

            bulanOptions: [
                { label: 'Januari', value: 1 },
                { label: 'Februari', value: 2 },
                { label: 'Maret', value: 3 },
                { label: 'April', value: 4 },
                { label: 'Mei', value: 5 },
                { label: 'Juni', value: 6 },
                { label: 'Juli', value: 7 },
                { label: 'Agustus', value: 8 },
                { label: 'September', value: 9 },
                { label: 'Oktober', value: 10 },
                { label: 'November', value: 11 },
                { label: 'Desember', value: 12 }
            ]
        }
    },

    computed: {
        tahunOptions() {
            const current = new Date().getFullYear();
            const options = [];
            for (let y = current - 3; y <= current + 3; y++) {
                options.push(y);
            }
            return options;
        },

        rekapGroupTotals() {
            const totals = { A: 0, B: 0, O: 0, AB: 0, Total: 0 }
            if (!Array.isArray(this.rekapMatrix)) return totals

            this.rekapMatrix.forEach(row => {
                totals.A += Number(row['A+'] || 0) + Number(row['A-'] || 0)
                totals.B += Number(row['B+'] || 0) + Number(row['B-'] || 0)
                totals.O += Number(row['O+'] || 0) + Number(row['O-'] || 0)
                totals.AB += Number(row['AB+'] || 0) + Number(row['AB-'] || 0)
                totals.Total += Number(row.Total || 0)
            })

            return totals
        }
    },

    methods: {
        getView() {
            const query = new URLSearchParams({
                page: this.page_first,
                limit: this.page_limit,
                cari_value: this.cari_value || '',
                bulan: this.filter.bulan || '',
                tahun: this.filter.tahun || '',
                golongan_darah: this.filter.golongan_darah || '',
                komponen_id: this.filter.komponen_id || '',
                ruangan_id: this.filter.ruangan_id || ''
            }).toString()

            fetch(this.$store.state.url.DARAH_KELUAR + "view?" + query, {
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
                        if (this.page_first > this.page_last) this.page_first = this.page_last || 1
                    } else {
                        this.$q.notify({ type: 'negative', message: res_data.message || 'Gagal memuat data darah keluar' })
                    }
                })
                .catch(err => {
                    console.error('Error fetching darah keluar:', err)
                    this.$q.notify({ type: 'negative', message: 'Terjadi kesalahan saat memuat data' })
                })
        },

        getRekap() {
            const query = new URLSearchParams({
                bulan: this.filter.bulan || '',
                tahun: this.filter.tahun || ''
            }).toString()

            fetch(this.$store.state.url.DARAH_KELUAR + "rekap?" + query, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.rekap = res_data.data || []
                        this.buildRekapMatrix()
                    }
                })
                .catch(err => {
                    console.error('Error fetching rekap:', err)
                })
        },

        buildRekapMatrix() {
            const map = {};
            this.rekap.forEach(r => {
                const gol = (r.golongan_darah || '').toString().trim().toUpperCase();
                const rhes = (r.rhesus || '').toString().trim();
                const colKey = `${gol}${rhes}`;
                const komponen = r.nama_komponen || `Komponen ${r.komponen_id}`;

                if (!map[komponen]) {
                    map[komponen] = { Komponen: komponen, Total: 0 };
                    this.colsRekap.forEach(c => { map[komponen][c] = 0; });
                }

                const jumlah = Number(r.total_kantong || 0);
                if (this.colsRekap.includes(colKey)) map[komponen][colKey] += jumlah;
                map[komponen].Total += jumlah;
            });

            this.rekapMatrix = Object.values(map).sort((a, b) => b.Total - a.Total);
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

        getRuangan() {
            fetch(this.$store.state.url.DARAH_KELUAR + "ruangan-list", {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.list_ruangan = res_data.data || []
                    }
                })
                .catch(err => console.error("Error getRuangan:", err))
        },

        getBulanLabel(value) {
            const opt = this.bulanOptions.find(b => b.value === value);
            return opt ? opt.label : '';
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

        formatNumber(n) {
            const v = Number(n)
            return isNaN(v) ? (n ?? '-') : v.toLocaleString('id-ID')
        },

        cari_data() {
            this.page_first = 1
            this.getView()
        },

        applyFilter() {
            this.page_first = 1;
            this.getView();
            this.getRekap();
        },
    },

    mounted() {
        this.getKomponen()
        this.getRuangan()
        this.getView()
        this.getRekap()
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
