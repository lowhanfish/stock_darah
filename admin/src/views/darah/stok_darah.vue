<template>


    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Stok Darah</div>
                    </div>
                    <div class="col-12 col-md-2"></div>

                </div>
            </q-card-section>

            <q-separator dark inset />



            <q-card-section>
                <div class="tbl_responsive">
                    <table width="100%">
                        <thead class="h_table_head main2x text-white">
                            <tr>
                                <th class="text-center" rowspan="2">KOMPONEN</th>
                                <th class="text-center" colspan="8">
                                    Golongan Darah
                                </th>
                                <th class="text-center" rowspan="2">TOTAL</th>
                            </tr>
                            <tr>

                                <th class="text-center" v-for="col in cols" :key="col" style="color: red;">{{ col }}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(row, idx) in matrix" :key="row.Komponen + '-' + idx" class="h_table_body">
                                <td>{{ row.Komponen }}</td>
                                <td v-for="col in cols" :key="col" class="text-center">{{ formatNumber(row[col]) }}</td>
                                <td class="text-right"><strong>{{ formatNumber(row.Total) }}</strong></td>
                            </tr>

                            <tr v-if="matrix.length === 0">
                                <td colspan="11" class="text-center text-grey">Belum ada data — silakan klik Refresh.
                                </td>
                            </tr>
                            <!-- Ganti baris JUMLAH lama dengan ini -->
                            <tr class="h_table_body">
                                <td class="main2x text-white text-bold text-center">JUMLAH</td>

                                <!-- A (A+ + A-) -->
                                <td class="text-center" colspan="2"><strong>{{ formatNumber(groupTotals.A) }}</strong>
                                </td>

                                <!-- B (B+ + B-) -->
                                <td class="text-center" colspan="2"><strong>{{ formatNumber(groupTotals.B) }}</strong>
                                </td>

                                <!-- O (O+ + O-) -->
                                <td class="text-center" colspan="2"><strong>{{ formatNumber(groupTotals.O) }}</strong>
                                </td>

                                <!-- AB (AB+ + AB-) -->
                                <td class="text-center" colspan="2"><strong>{{ formatNumber(groupTotals.AB) }}</strong>
                                </td>

                                <!-- TOTAL keseluruhan -->
                                <td class="text-right"><strong>{{ formatNumber(groupTotals.Total) }}</strong></td>
                            </tr>

                        </tbody>
                    </table>
                    <div class="row q-mt-md">
                        <div class="col-10">
                            <p style="font-style: italic; font-size: 13px; line-height: 1.4;">
                                * Angka pada laman ini disajikan dalam <strong>≈ kantong</strong> untuk kemudahan
                                publik. <br>
                                Komponen berbasis <strong>cc</strong> dikonversi dengan asumsi
                                <strong>1 kantong PRC ≈ 300 cc</strong> dan
                                <strong>1 kantong FFP/FP ≈ 200 cc</strong>. <br>
                                Angka klinis rinci tersedia pada sistem internal.
                            </p>
                        </div>
                    </div>
                </div>
            </q-card-section>

            <q-separator />


        </q-card>

    </div>
</template>
<script>
export default {
    data() {
        return {
            cols: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
            matrix: [],
            lastSync: null,
            loading: false
        }
    },

    computed: {
        // Hitung total gabungan per golongan (A, B, O, AB) dan grand total
        groupTotals() {
            const totals = { A: 0, B: 0, O: 0, AB: 0, Total: 0 }

            // pastikan matrix terisi
            if (!Array.isArray(this.matrix)) return totals

            this.matrix.forEach(row => {
                // ambil nilai tiap rhesus (bisa 0 atau undefined)
                const aPlus = Number(row['A+'] || 0)
                const aMin = Number(row['A-'] || 0)
                const bPlus = Number(row['B+'] || 0)
                const bMin = Number(row['B-'] || 0)
                const oPlus = Number(row['O+'] || 0)
                const oMin = Number(row['O-'] || 0)
                const abPlus = Number(row['AB+'] || 0)
                const abMin = Number(row['AB-'] || 0)
                const rowTotal = Number(row['Total'] || 0)

                totals.A += aPlus + aMin
                totals.B += bPlus + bMin
                totals.O += oPlus + oMin
                totals.AB += abPlus + abMin
                totals.Total += rowTotal
            })

            return totals
        }
    },


    methods: {
        // === AMBIL DATA DARI BACKEND ===
        fetchMatrix: function () {
            this.loading = true
            this.$store.commit("shoWLoading")

            // Buat parameter query
            const query = new URLSearchParams({
                page: 1,
                limit: 10000,
                sort_by: "s.jumlah_stok",
                sort_dir: "DESC"
            }).toString()

            const url = this.$store.state.url.STOK + "view?" + query

            fetch(url, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    console.log("stok_darah view:", res_data)
                    const rows = Array.isArray(res_data.data)
                        ? res_data.data
                        : (res_data.rows || [])

                    const map = {}

                    rows.forEach(r => {
                        const gol = (r.golongan_darah || '').toString().trim().toUpperCase()
                        const rhes = (r.rhesus || '').toString().trim()
                        const komponen = r.nama_komponen || `Komponen ${r.komponen_id}`
                        const colKey = `${gol}${rhes}`

                        if (!map[komponen]) {
                            map[komponen] = { Komponen: komponen, Total: 0 }
                            this.cols.forEach(c => { map[komponen][c] = 0 })
                        }

                        const jumlah = Number(r.jumlah_stok || 0)
                        if (this.cols.includes(colKey)) map[komponen][colKey] += jumlah
                        map[komponen].Total += jumlah
                    })

                    this.matrix = Object.values(map).sort((a, b) => b.Total - a.Total)
                    this.lastSync = new Date()
                })
                .catch(err => {
                    console.error("fetchMatrix error", err)
                    this.matrix = []
                })
                .finally(() => {
                    this.loading = false
                    this.$store.commit("hideLoading")
                })
        }
        ,

        // === FORMAT ANGKA ===
        formatNumber(n) {
            const v = Number(n)
            return isNaN(v) ? (n ?? '-') : v.toLocaleString('id-ID')
        },

        // === FORMAT TANGGAL ===
        formatDate(dt) {
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
        }
    },

    mounted() {
        this.fetchMatrix()
    }
}
</script>

<style scoped>
.tbl_responsive {
    overflow: auto
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