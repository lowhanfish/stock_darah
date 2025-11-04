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
                                <th class="text-left">KOMPONEN</th>
                                <th class="text-center" v-for="col in cols" :key="col">{{ col }}</th>
                                <th class="text-right">TOTAL</th>
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
                        </tbody>
                    </table>
                </div>
            </q-card-section>

            <q-separator />

           
        </q-card>

    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const cols = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const matrix = ref([])
const lastSync = ref(null)

onMounted(() => fetchMatrix())

async function fetchMatrix() {
    try {
        const res = await axios.get('/api/stok_darah/summary_matrix')
        // Pastikan backend mengembalikan array objek dengan key sesuai cols + 'Total' + 'Komponen'
        matrix.value = Array.isArray(res.data) ? res.data : (res.data?.rows || [])
        lastSync.value = new Date()
    } catch (err) {
        console.error('fetchMatrix error', err)
        matrix.value = []
    }
}

function formatNumber(n) {
    const v = Number(n)
    return isNaN(v) ? (n ?? '-') : v.toLocaleString('id-ID')
}

function formatDate(dt) {
    if (!dt) return '-'
    const d = new Date(dt)
    if (isNaN(d)) return dt
    return d.toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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