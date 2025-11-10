<template>
    <div>

        <section class="breadcrumb-header" style="background-image: url(assets/images/header/bgheader.png)">
            <div class="overlay"></div>
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="banner">
                            <h1>Stok Darah</h1>
                            <ul>
                                <li><a href="javascript:void(0);">Status ketersediaan darah</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <!-- :: Doctors Timetable -->
        <!-- :: Stok Darah (Publik, tanpa rhesus) -->
        <section class="doctors-timetable py-100">
            <div class="container">
                <div class="sec-title">
                    <div class="row">
                        <div class="col-lg-5">
                            <h2>Stok Darah</h2>
                            <h3>Informasi Ketersediaan Golongan Darah</h3>
                        </div>
                        <div class="col-lg-5">
                            <p class="sec-explain">
                                Berikut adalah jumlah ketersediaan darah berdasarkan golongan darah dan jenis komponen.
                                Data ditampilkan secara agregat tanpa membedakan rhesus.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-lg-12">
                        <div class="box-appointment-doctors">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th class="text-center" scope="col">KOMPONEN</th>
                                        <th class="text-center" scope="col">A</th>
                                        <th class="text-center" scope="col">B</th>
                                        <th class="text-center" scope="col">O</th>
                                        <th class="text-center" scope="col">AB</th>
                                        <th class="text-center" scope="col">TOTAL</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <!-- Baris per komponen -->
                                    <tr v-for="(row, idx) in matrix" :key="row.Komponen + '-' + idx">
                                        <td>{{ row.Komponen }}</td>
                                        <td class="text-center">{{ formatNumber(row.A) }}</td>
                                        <td class="text-center">{{ formatNumber(row.B) }}</td>
                                        <td class="text-center">{{ formatNumber(row.O) }}</td>
                                        <td class="text-center">{{ formatNumber(row.AB) }}</td>
                                        <td class="text-center"><strong>{{ formatNumber(row.Total) }}</strong></td>
                                    </tr>

                                    <!-- Empty state -->
                                    <tr v-if="matrix.length === 0">
                                        <td colspan="6" class="text-center text-muted">
                                            Belum ada data — silakan muat ulang.
                                        </td>
                                    </tr>

                                    <!-- Baris JUMLAH keseluruhan -->
                                    <tr>
                                        <td class="text-center"><strong>JUMLAH</strong></td>
                                        <td class="text-center"><strong>{{ formatNumber(groupTotals.A) }}</strong></td>
                                        <td class="text-center"><strong>{{ formatNumber(groupTotals.B) }}</strong></td>
                                        <td class="text-center"><strong>{{ formatNumber(groupTotals.O) }}</strong></td>
                                        <td class="text-center"><strong>{{ formatNumber(groupTotals.AB) }}</strong></td>
                                        <td class="text-center"><strong>{{ formatNumber(groupTotals.Total) }}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="text-muted mt-2" style="font-style: italic; font-size: 0.9rem;">
                                * Angka pada laman ini disajikan dalam  <strong>≈ kantong</strong> untuk kemudahan publik.<br>
                                Komponen berbasis <strong>cc</strong> dikonversi dengan asumsi <strong>1 kantong PRC ≈ 300 cc</strong> dan <strong>1 kantong FFP/FP ≈ 200 cc</strong>.<br>
                                Angka klinis rinci tersedia pada sistem internal.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </div>
</template>
<script>
// import { useStore } from "vuex"; // tidak perlu
export default {
    data() {
        return {
            colsSimple: ['A', 'B', 'O', 'AB'],
            matrix: [],
            lastSync: null,
            loading: false
        };
    },
    computed: {
        groupTotals() {
            const t = { A: 0, B: 0, O: 0, AB: 0, Total: 0 };
            this.matrix.forEach(r => {
                t.A += Number(r.A || 0); t.B += Number(r.B || 0);
                t.O += Number(r.O || 0); t.AB += Number(r.AB || 0);
                t.Total += Number(r.Total || 0);
            });
            return t;
        }
    },
    methods: {
        async fetchMatrix() {
            this.loading = true;
            // jika tidak punya mutation loading, lewati saja

            const query = new URLSearchParams({
                page: 1, limit: 10000, sort_by: 's.jumlah_stok', sort_dir: 'DESC'
            }).toString();

            // ✅ pakai path yang benar: state.URL.STOK (huruf besar)
            const base = this.$store.state.URL.STOK.replace(/\/+$/, ''); // .../api/v1/publish/stokPublish
            const url = `${base}/view?${query}`;                        // .../stokPublish/view?...

            console.log('[stok-darah] GET:', url);

            try {
                const res = await fetch(url, { method: 'GET' });
                const text = await res.text();
                const data = JSON.parse(text);          // pastikan balikannya JSON
                const rows = Array.isArray(data.data) ? data.data : (data.rows || []);

                const map = {};
                rows.forEach(r => {
                    const gol = String(r.golongan_darah || '').trim().toUpperCase(); // A|B|O|AB
                    const komponen = r.nama_komponen || `Komponen ${r.komponen_id}`;
                    const jumlah = Number(r.jumlah_stok || 0);

                    if (!map[komponen]) map[komponen] = { Komponen: komponen, A: 0, B: 0, O: 0, AB: 0, Total: 0 };
                    if (this.colsSimple.includes(gol)) map[komponen][gol] += jumlah;
                    map[komponen].Total += jumlah;
                });

                this.matrix = Object.values(map).sort((a, b) => b.Total - a.Total);
                this.lastSync = new Date();
            } catch (e) {
                console.error('fetchMatrix (publish) error', e);
                this.matrix = [];
            } finally {
                this.loading = false;
            }
        },
        formatNumber(n) {
            const v = Number(n); return isNaN(v) ? (n ?? '-') : v.toLocaleString('id-ID');
        }
    },
    mounted() { this.fetchMatrix(); }
};
</script>


<style scoped>
.paginasia {
    font-size: 8pt !important;
    height: 35px !important;
    width: 35px !important;
}

.pagination li {
    cursor: pointer;
}

.pagination li.disabled {
    pointer-events: none;
    opacity: 0.5;
}

.blog-item img {
    width: 100%;
    height: auto;
}

.news-item img {
    width: 100%;
    height: auto;
    margin-bottom: 10px;
}
</style>