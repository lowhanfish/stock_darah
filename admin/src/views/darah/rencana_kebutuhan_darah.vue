<template>
    <div class="about" style="padding:15px">
        <q-card bordered class="my-card">
            <q-card-section class="main2 text-white">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <div class="text-h6 h_titleHead">Rencana Kebutuhan Darah</div>
                        <div class="text-h8">Perencanaan Kebutuhan Darah Tahunan</div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="row items-center justify-end q-gutter-sm">
                            <q-select v-model="selectedTahun" :options="tahunOptions" outlined dense
                                class="bg-white" style="min-width: 130px;" label="Tahun"
                                @input="fetchMatrix" />
                            <q-btn glossy class="main4" @click="saveAll" dense icon="save" label="Simpan"
                                :loading="saving">
                                <q-tooltip content-class="bg-green-5" content-style="font-size: 13px">
                                    Simpan Rencana
                                </q-tooltip>
                            </q-btn>
                        </div>
                    </div>
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
                                    Golongan Darah — Rencana Tahun {{ selectedTahun }}
                                </th>
                                <th class="text-center" rowspan="2">TOTAL</th>
                            </tr>
                            <tr>
                                <th class="text-center" v-for="col in cols" :key="col" style="color: red;">{{ col
                                }}</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(row, idx) in matrix" :key="row.Komponen + '-' + idx" class="h_table_body">
                                <td>{{ row.Komponen }}</td>
                                <td v-for="col in cols" :key="col" class="text-center cell-input">
                                    <input type="number" v-model.number="row[col]"
                                        @change="recalcTotal(row)" min="0"
                                        class="input-rencana" />
                                </td>
                                <td class="text-right"><strong>{{ formatNumber(row.Total) }}</strong></td>
                            </tr>

                            <tr v-if="matrix.length === 0">
                                <td colspan="11" class="text-center text-grey">Belum ada data komponen —
                                    pastikan komponen darah sudah diisi di Data Master.</td>
                            </tr>

                            <!-- JUMLAH -->
                            <tr class="h_table_body">
                                <td class="main2x text-white text-bold text-center">JUMLAH</td>
                                <td class="text-center" colspan="2">
                                    <strong>{{ formatNumber(groupTotals.A) }}</strong>
                                </td>
                                <td class="text-center" colspan="2">
                                    <strong>{{ formatNumber(groupTotals.B) }}</strong>
                                </td>
                                <td class="text-center" colspan="2">
                                    <strong>{{ formatNumber(groupTotals.O) }}</strong>
                                </td>
                                <td class="text-center" colspan="2">
                                    <strong>{{ formatNumber(groupTotals.AB) }}</strong>
                                </td>
                                <td class="text-right">
                                    <strong>{{ formatNumber(groupTotals.Total) }}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="row q-mt-md">
                        <div class="col-10">
                            <p style="font-style: italic; font-size: 13px; line-height: 1.4;">
                                * Masukkan angka rencana kebutuhan darah dalam <strong>kantong</strong> untuk
                                masing-masing komponen, golongan darah, dan rhesus. <br>
                                Klik <strong>Simpan</strong> untuk menyimpan rencana tahun {{ selectedTahun }}.
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
            list_komponen: [],
            selectedTahun: new Date().getFullYear(),
            saving: false,
            loading: false
        }
    },

    computed: {
        tahunOptions() {
            const current = new Date().getFullYear();
            const options = [];
            for (let y = current - 2; y <= current + 5; y++) {
                options.push(y);
            }
            return options;
        },

        groupTotals() {
            const totals = { A: 0, B: 0, O: 0, AB: 0, Total: 0 }
            if (!Array.isArray(this.matrix)) return totals

            this.matrix.forEach(row => {
                const aPlus = Number(row['A+'] || 0)
                const aMin = Number(row['A-'] || 0)
                const bPlus = Number(row['B+'] || 0)
                const bMin = Number(row['B-'] || 0)
                const oPlus = Number(row['O+'] || 0)
                const oMin = Number(row['O-'] || 0)
                const abPlus = Number(row['AB+'] || 0)
                const abMin = Number(row['AB-'] || 0)

                totals.A += aPlus + aMin
                totals.B += bPlus + bMin
                totals.O += oPlus + oMin
                totals.AB += abPlus + abMin
                totals.Total += Number(row.Total || 0)
            })

            return totals
        }
    },

    methods: {
        // === Recalculate row total ===
        recalcTotal(row) {
            let total = 0;
            this.cols.forEach(col => {
                total += Number(row[col] || 0);
            });
            row.Total = total;
        },

        // === Ambil daftar komponen ===
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
                    this.buildMatrix()
                })
                .catch(err => console.error("Error getKomponen:", err))
        },

        // === Build matrix dari komponen, lalu overlay data rencana ===
        buildMatrix() {
            // Buat matrix kosong dari daftar komponen
            const map = {};
            this.list_komponen.forEach(k => {
                const key = k.nama_komponen;
                if (!map[key]) {
                    map[key] = { Komponen: key, komponen_id: k.id, Total: 0 };
                    this.cols.forEach(c => { map[key][c] = 0; });
                }
            });

            this.matrix = Object.values(map).sort((a, b) => a.Komponen.localeCompare(b.Komponen));

            // Fetch existing rencana dan overlay
            this.fetchRencana();
        },

        // === Ambil data rencana yang sudah ada ===
        fetchRencana() {
            this.loading = true;
            this.$store.commit("shoWLoading");

            const url = this.$store.state.url.RENCANA_KEBUTUHAN + "view?tahun=" + this.selectedTahun;

            fetch(url, {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                }
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success && Array.isArray(res_data.data)) {
                        // Overlay data rencana ke matrix
                        res_data.data.forEach(r => {
                            const gol = (r.golongan_darah || '').toString().trim().toUpperCase();
                            const rhes = (r.rhesus || '').toString().trim();
                            const colKey = `${gol}${rhes}`;
                            const komponen = r.nama_komponen || '';

                            const row = this.matrix.find(m => m.Komponen === komponen);
                            if (row && this.cols.includes(colKey)) {
                                row[colKey] = Number(r.jumlah || 0);
                            }
                        });

                        // Recalculate totals
                        this.matrix.forEach(row => this.recalcTotal(row));
                    }
                })
                .catch(err => {
                    console.error("fetchRencana error", err);
                })
                .finally(() => {
                    this.loading = false;
                    this.$store.commit("hideLoading");
                });
        },

        // === Trigger ulang saat ganti tahun ===
        fetchMatrix() {
            this.buildMatrix();
        },

        // === Simpan semua rencana ===
        saveAll() {
            this.saving = true;
            this.$store.commit("shoWLoading");

            const items = [];
            this.matrix.forEach(row => {
                this.cols.forEach(col => {
                    // Parse golongan dan rhesus dari col key
                    let gol, rhesus;
                    if (col.startsWith('AB')) {
                        gol = 'AB';
                        rhesus = col.substring(2);
                    } else {
                        gol = col.substring(0, 1);
                        rhesus = col.substring(1);
                    }

                    items.push({
                        golongan_darah: gol,
                        rhesus: rhesus,
                        komponen_id: row.komponen_id,
                        jumlah: Number(row[col] || 0)
                    });
                });
            });

            fetch(this.$store.state.url.RENCANA_KEBUTUHAN + "save", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: "kikensbatara " + localStorage.token
                },
                body: JSON.stringify({
                    tahun: this.selectedTahun,
                    items: items
                })
            })
                .then(res => res.json())
                .then(res_data => {
                    if (res_data.success) {
                        this.$q.notify({
                            type: "positive",
                            message: res_data.message || "Rencana kebutuhan darah berhasil disimpan"
                        });
                    } else {
                        this.$q.notify({
                            type: "negative",
                            message: res_data.message || "Gagal menyimpan rencana"
                        });
                    }
                })
                .catch(err => {
                    console.error("saveAll error", err);
                    this.$q.notify({
                        type: "negative",
                        message: "Terjadi kesalahan saat menyimpan rencana"
                    });
                })
                .finally(() => {
                    this.saving = false;
                    this.$store.commit("hideLoading");
                });
        },

        // === FORMAT ANGKA ===
        formatNumber(n) {
            const v = Number(n)
            return isNaN(v) ? (n ?? '-') : v.toLocaleString('id-ID')
        },
    },

    mounted() {
        this.getKomponen();
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

.cell-input {
    padding: 4px !important;
}

.input-rencana {
    width: 70px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px 4px;
    font-size: 14px;
    background: #fafafa;
    transition: border-color 0.2s;
}

.input-rencana:focus {
    outline: none;
    border-color: #1976d2;
    background: #fff;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
}

.input-rencana::-webkit-inner-spin-button,
.input-rencana::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.input-rencana {
    -moz-appearance: textfield;
}
</style>
