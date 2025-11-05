<template>
    <div class="about" style="padding:15px">
      <q-card bordered class="my-card">
        <!-- ================= HEADER ================= -->
        <q-card-section class="main2 text-white">
          <div class="row">
            <div class="col-12 col-md-6">
              <div class="text-h6 h_titleHead">Transaksi Darah</div>
            </div>
            <div class="col-12 col-md-2"></div>
            <div class="col-12 col-md-4">
              <div class="row">
                <q-input v-model="cari_value" @keyup="cari_data()" outlined square :dense="true"
                         class="bg-white" style="width:90%" />
                <q-btn glossy class="main1x" @click="mdl_add = true" dense flat icon="add" style="width:10%">
                  <q-tooltip content-class="bg-blue-9" content-style="font-size: 13px">
                    Tambah Transaksi
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </q-card-section>
  
        <q-separator dark inset />
  
        <!-- ================= TABLE ================= -->
        <q-card-section>
          <div class="tbl_responsive">
            <table width="100%">
              <thead class="h_table_head main2x text-white">
                <tr>
                  <th width="5%" class="text-center">No</th>
                  <th width="10%">Golongan Darah</th>
                  <th width="5%" class="text-center">Rhesus</th>
                  <th width="15%">Komponen</th>
                  <th width="10%" class="text-center">Jumlah</th>
                  <th width="10%" class="text-center">Tipe</th>
                  <th width="15%">Tanggal</th>
                  <th width="20%">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(data, index) in list_data" :key="data.id_transaksi + '-' + index">
                  <td class="text-center">{{ indexing(index + 1) }}</td>
                  <td>{{ data.golongan_darah }}</td>
                  <td class="text-center">{{ data.rhesus }}</td>
                  <td>{{ data.nama_komponen }}</td>
                  <td class="text-center">{{ data.jumlah }}</td>
                  <td class="text-center">
                    <q-badge :color="data.tipe_transaksi === 'masuk' ? 'green' : 'red'">
                      {{ data.tipe_transaksi.toUpperCase() }}
                    </q-badge>
                  </td>
                  <td>{{ formatTanggal(data.tanggal) }}</td>
                  <td>{{ data.keterangan || '-' }}</td>
                </tr>
  
                <tr v-if="list_data.length === 0">
                  <td colspan="8" class="text-center text-grey">
                    Belum ada data transaksi.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Pagination -->
          <div class="flex flex-center q-mt-md">
            <q-pagination v-model="page_first" :max="page_last" @update:model-value="getView()" color="grey-6"
                          :max-pages="4" :direction-links="true" :boundary-links="true" />
          </div>
        </q-card-section>
      </q-card>
  
      <!-- ===================== MODAL ADD ===================== -->
      <q-dialog v-model="mdl_add" persistent>
        <q-card class="mdl-md">
          <q-card-section class="main2 text-white">
            <div class="text-h6 h_modalhead">Tambah Transaksi Darah</div>
          </q-card-section>
  
          <form @submit.prevent="addData">
            <q-card-section class="q-pt-none">
              <span class="h_lable">Golongan Darah</span>
              <q-select v-model="form.golongan_darah" outlined square :dense="true" class="bg-white margin_btn"
                        :options="['A','B','O','AB']" required />
  
              <span class="h_lable">Rhesus</span>
              <q-select v-model="form.rhesus" outlined square :dense="true" class="bg-white margin_btn"
                        :options="['+','-']" required />
  
              <span class="h_lable">Komponen Darah</span>
              <q-select v-model="form.komponen_id" outlined square :dense="true" class="bg-white margin_btn"
                        :options="list_komponen" option-value="id" option-label="nama_komponen" emit-value map-options required />
  
              <span class="h_lable">Jumlah (Kantong)</span>
              <q-input v-model.number="form.jumlah" type="number" outlined square :dense="true"
                       class="bg-white margin_btn" required />
  
              <span class="h_lable">Tipe Transaksi</span>
              <q-select v-model="form.tipe_transaksi" outlined square :dense="true"
                        class="bg-white margin_btn" :options="['masuk','keluar']" required />
  
              <span class="h_lable">Keterangan</span>
              <q-input v-model="form.keterangan" type="textarea" outlined square :dense="true"
                       class="bg-white margin_btn" />
  
            </q-card-section>
  
            <q-card-actions class="bg-grey-4 mdl-footer" align="right">
              <q-btn :loading="btn_add" color="primary" type="submit" label="Simpan" />
              <q-btn label="Batal" color="negative" v-close-popup />
            </q-card-actions>
          </form>
        </q-card>
      </q-dialog>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        form: {
          golongan_darah: '',
          rhesus: '',
          komponen_id: null,
          jumlah: 0,
          tipe_transaksi: '',
          keterangan: ''
        },
        list_data: [],
        list_komponen: [],
  
        page_first: 1,
        page_last: 0,
        page_limit: 10,
        jml_data: 0,
        total_data: 0,
        cari_value: '',
  
        mdl_add: false,
        btn_add: false
      }
    },
    methods: {
      getView() {
        const query = new URLSearchParams({
          page: this.page_first,
          limit: this.page_limit,
          sort_by: 't.tanggal',
          sort_dir: 'DESC'
        }).toString()
  
        fetch(this.$store.state.url.TRANSAKSI + "view?" + query, {
          method: "GET",
          headers: {
            "content-type": "application/json",
            authorization: "kikensbatara " + localStorage.token
          }
        })
          .then(res => res.json())
          .then(res_data => {
            this.list_data = res_data.data || []
            this.total_data = this.list_data.length
            this.page_last = Math.ceil(this.total_data / this.page_limit)
          })
          .catch(err => {
            console.error("Error fetching transaksi:", err)
            this.$q.notify({ type: "negative", message: "Gagal memuat data transaksi darah" })
          })
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
  
      addData() {
        this.btn_add = true
  
        fetch(this.$store.state.url.TRANSAKSI + "addData", {
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
              this.$q.notify({ type: "positive", message: res_data.message || "Transaksi berhasil ditambahkan" })
              this.mdl_add = false
              this.resetForm()
              this.getView()
            } else {
              this.$q.notify({ type: "negative", message: res_data.message || "Gagal menambah transaksi" })
            }
          })
          .catch(err => {
            console.error("Error addData:", err)
            this.$q.notify({ type: "negative", message: "Gagal menambah transaksi darah" })
          })
          .finally(() => {
            this.btn_add = false
          })
      },
  
      resetForm() {
        this.form = {
          golongan_darah: '',
          rhesus: '',
          komponen_id: null,
          jumlah: 0,
          tipe_transaksi: '',
          keterangan: ''
        }
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
      }
    },
  
    mounted() {
      this.getKomponen()
      this.getView()
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
  