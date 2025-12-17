<template>
  <div class="about" style="padding:15px">
    <q-card bordered class="my-card">
      <!-- Header -->
      <q-card-section class="main2 text-white">
        <div class="text-h6 h_titleHead">HOME</div>
        <div class="text-h8">DASHBOARD PINDARA</div>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section class="biruSangatmudaGrad">
        <div class="row q-col-gutter-md items-start">
          <div class="col-12 col-md-12 column">
            <!-- Widget Status -->
            <div class="row q-col-gutter-md">
              <!-- Total Kegiatan -->
              <div class="col-12 col-md-5th">
                <div class="row shadow-3 frWidgetSub" style="min-height:80px">
                  <div class="col-4 frWidgetSub1 text-center main1 row items-center justify-center">
                    <q-icon name="view_list" size="28px" color="white" />
                  </div>
                  <div class="col-8 frWidgetSub2 main1x">
                    <span class="frWidgetText1">Permintaan Darah</span><br>
                    <span class="frWidgetText2">{{ widgetStatus.total_permintaan || 0 }}</span>
                  </div>
                </div>
              </div>

              <!-- CSR Baru -->
              <div class="col-12 col-md-5th">
                <div class="row shadow-3 frWidgetSub" style="min-height:80px">
                  <div class="col-4 frWidgetSub1 text-center widgetdashboardCSR row items-center justify-center">
                    <q-icon name="fiber_new" size="28px" color="white" />
                  </div>
                  <div class="col-8 frWidgetSub2 widgetdashboardCSRNilai">
                    <span class="frWidgetText1">Permintaan Baru</span><br>
                    <span class="frWidgetText2">{{ widgetStatus.permintaan_baru }}</span>
                  </div>
                </div>
              </div>

              <!-- Dalam Pengerjaan -->
              <div class="col-12 col-md-5th">
                <div class="row shadow-3 frWidgetSub" style="min-height:80px">
                  <div class="col-4 frWidgetSub1 text-center widgetdashboardProsesIcon row items-center justify-center">
                    <q-icon name="block_flipped" size="28px" color="white" />
                  </div>
                  <div class="col-8 frWidgetSub2 widgetdashboardProsesNilai">
                    <span class="frWidgetText1">Ditolak</span><br>
                    <span class="frWidgetText2">{{ widgetStatus.ditolak }}</span>
                  </div>
                </div>
              </div>

              <!-- Pengerjaan Sebagian -->
              <div class="col-12 col-md-5th">
                <div class="row shadow-3 frWidgetSub" style="min-height:80px">
                  <div class="col-4 frWidgetSub1 text-center widgetdashboardSebagian row items-center justify-center">
                    <q-icon name="volunteer_activism" size="28px" color="white" />
                  </div>
                  <div class="col-8 frWidgetSub2 widgetdashboardSebagianNilai">
                    <span class="frWidgetText1">Darah Siap diambil</span><br>
                    <span class="frWidgetText2">{{ widgetStatus.siap_ambil }}</span>
                  </div>
                </div>
              </div>

              <!-- Selesai -->
              <div class="col-12 col-md-5th">
                <div class="row shadow-3 frWidgetSub" style="min-height:80px">
                  <div class="col-4 frWidgetSub1 text-center widgetdashboardTerimaIcon row items-center justify-center">
                    <q-icon name="check_circle_outline" size="28px" color="white" />
                  </div>
                  <div class="col-8 frWidgetSub2 widgetdashboardTerimaNilai">
                    <span class="frWidgetText1">Selesai</span><br>
                    <span class="frWidgetText2">{{ widgetStatus.selesai }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <hr class="hrpagin2">

        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-12 col-md-6">
            <div class="frameChart shadow-5">
              <div id="chartPie" style="width:100%; height:400px;"></div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="frameChart shadow-5 q-pa-md">

              <!-- Filter Tahun -->
              <div class="row items-center q-mb-sm">
                <div class="col-12 col-md-6">
                  <q-select dense outlined label="Tahun" v-model="selectedYear" :options="yearOptions" />
                </div>
              </div>

              <!-- Chart Line -->
              <div id="chartByPermintaanDarah" style="width:100%; height:400px;"></div>

            </div>
          </div>

          <div class="col-12 col-md-6">
            <div class="col-12 col-md-6">
              <div class="frameChart shadow-5 q-pa-md">

                <div id="chartPendonorGender" style="width:100%; height:400px;"></div>
              </div>
            </div>

          </div>
          <div class="col-12 col-md-6">
            <div class="frameChart shadow-5 q-pa-md">

              <div id="chartPermintaanRuangan" style="width:100%; height:400px;"></div>
            </div>

          </div>
          <div class="col-12 col-md-6">
            <div class="frameChart shadow-5 q-pa-md">
              <div class="text-h6 q-mb-md text-center">Jumlah Partisipasi Pendonor Darah</div>
              <table style="width:100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #F87C7C;">
                    <th width="80%" style="text-align:left; padding: 8px; color: aliceblue;">Jenis Kelamin</th>
                    <th width="20%" style="text-align:right; padding: 8px; color: aliceblue;">Jumlah Pendonor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in listJk" :key="item.jk_pendonor"
                    :style="{ backgroundColor: listJk.indexOf(item) % 2 === 0 ? '#f9f9f9' : 'white' }">
                    <td width="80%" style="padding: 8px;">{{ item.jk_pendonor }}</td>
                    <td width="20%" style="padding: 8px; text-align:right;">{{ item.jumlah }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
          <div class="col-12 col-md-6">
            <div class="frameChart shadow-5 q-pa-md text-center">
              <div class="text-h6 q-mb-md">
                Jumlah Permintaan Darah dari Ruangan BLUD RS
              </div>

              <!-- WRAPPER SCROLL -->
              <div style="max-height: 150px; overflow-y: auto;">
                <table style="width:100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #F87C7C;">
                      <th width="70%" style="text-align:left; padding: 8px; color: aliceblue;">Nama Ruangan</th>
                      <th width="30%" style="text-align:right; padding: 8px; color: aliceblue;">Jumlah Permintaan Darah
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in listBidangUsaha" :key="item.bidang_id"
                      :style="{ backgroundColor: listBidangUsaha.indexOf(item) % 2 === 0 ? '#f9f9f9' : 'white' }">
                      <td style="padding: 8px;">{{ item.nama_bidang }}</td>
                      <td style="padding: 8px; text-align:right;">{{ item.jumlah }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>


          </div>




        </div>

      </q-card-section>
      <q-card-section class="biruSangatmudaGrad">


      </q-card-section>
    </q-card>


  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedYear: new Date().getFullYear(),
      yearOptions: [
        2025,
        2026,
        2027,
        2028,
      ],
      chartGolonganData: [],
      tipe: null,
      widgetStatus: {
        total_kegiatan: 0,
        permintaan_baru: 0,
        ditolak: 0,
        siap_ambil: 0,
        selesai: 0
      },

      listJk: [],
      listBidangUsaha: [],


    }
  },

  methods: {



    async loadWidgetDashboard() {
      try {
        const raw = JSON.parse(localStorage.profile);
        const role = Number(raw.profile?.stokdarah_konut);
        const ruangan_id = raw.profile?.ruangan_id;

        let url = `statusDashboard?stokdarah_konut=${role}`;

        // HANYA role ruangan
        if (role === 3 && ruangan_id) {
          url += `&ruangan_id=${ruangan_id}`;
        }

        const res = await fetch(
          this.$store.state.url.DASHBOARD + url,
          {
            headers: {
              authorization: 'kikensbatara ' + localStorage.token
            }
          }
        );

        const json = await res.json();
        if (json.data) {
          this.widgetStatus = json.data;
        }

        this.$nextTick(() => {
          this.chartPie();
        });

      } catch (err) {
        console.error('Gagal load dashboard:', err);
      }
    },



    chartPie() {
      Highcharts.chart('chartPie', {
        chart: { type: 'pie', backgroundColor: 'transparent' },
        title: { text: 'Status Permintaan Darah' },
        tooltip: { pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>' },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: { enabled: false },
            showInLegend: true
          }
        },
        series: [{
          name: 'Jumlah',
          colorByPoint: true,
          data: [
            { name: 'Permintaan Baru', y: this.widgetStatus.permintaan_baru, color: '#1e88e5' },
            { name: 'Ditolak', y: this.widgetStatus.ditolak, color: '#ffb300' },
            { name: 'Darah Siap Ambil', y: this.widgetStatus.siap_ambil, color: '#f57c00' },
            { name: 'Selesai', y: this.widgetStatus.selesai, color: '#43a047' }
          ]
        }]
      });
    },


    renderChartGolongan() {
      const bulanLabel = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];

      // siapkan 12 bulan kosong
      const template = () => Array(12).fill(0);

      const seriesMap = {
        A: template(),
        B: template(),
        AB: template(),
        O: template()
      };

      // isi dari API
      this.chartGolonganData.forEach(item => {
        const idx = item.bulan - 1;
        if (seriesMap[item.golongan_darah]) {
          seriesMap[item.golongan_darah][idx] = item.jumlah;
        }
      });

      Highcharts.chart('chartByPermintaanDarah', {
        chart: {
          type: 'line',
          backgroundColor: 'transparent'
        },
        title: {
          text: `Permintaan Darah Terpakai Tahun ${this.selectedYear}`
        },
        subtitle: {
          text: 'Berdasarkan golongan darah'
        },
        xAxis: {
          categories: bulanLabel
        },
        yAxis: {
          title: {
            text: 'Jumlah Permintaan'
          },
          allowDecimals: false
        },
        tooltip: {
          shared: true,
          valueSuffix: ' Kantong'
        },
        plotOptions: {
          line: {
            dataLabels: { enabled: true }
          }
        },
        series: [
          { name: 'Golongan A', data: seriesMap.A },
          { name: 'Golongan B', data: seriesMap.B },
          { name: 'Golongan AB', data: seriesMap.AB },
          { name: 'Golongan O', data: seriesMap.O }
        ]
      });
    },


    async loadPermintaanDarahByGolongan() {
      try {
        const res = await fetch(
          this.$store.state.url.DASHBOARD +
          `permintaanDarahByGolongan?year=${this.selectedYear}`,
          {
            headers: {
              authorization: 'kikensbatara ' + localStorage.token
            }
          }
        );

        const json = await res.json();
        this.chartGolonganData = json.data || [];

        this.$nextTick(() => {
          this.renderChartGolongan();
        });

      } catch (err) {
        console.error('Gagal load permintaan darah:', err);
      }
    },

    async loadPendonorByGender() {
      try {
        const res = await fetch(
          this.$store.state.url.DASHBOARD + 'pendonorByGender',
          {
            headers: {
              authorization: 'kikensbatara ' + localStorage.token
            }
          }
        );

        const json = await res.json();

        this.renderPendonorGenderChart(json.data || []);

      } catch (err) {
        console.error('Gagal load pendonor by gender:', err);
      }
    },

    renderPendonorGenderChart(seriesData) {
      Highcharts.chart('chartPendonorGender', {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent'
        },
        title: {
          text: "Pendonor Berdasarkan Jenis Kelamin"
        },
        subtitle: {
          text: 'Perempuan & Laki-laki'
        },
        tooltip: {
          pointFormat: '<b>{point.y}</b> pendonor ({point.percentage:.1f}%)'
        },
        plotOptions: {
          pie: {
            innerSize: '60%', // 👉 DONUT
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b><br>{point.percentage:.1f} %'
            }
          }
        },
        series: [{
          name: 'Jumlah Pendonor',
          colorByPoint: true,
          data: seriesData
        }]
      });
    },

    async loadPendonorGenderTable() {
      try {
        const res = await fetch(
          this.$store.state.url.DASHBOARD + 'pendonorByGenderTable',
          {
            headers: {
              authorization: 'kikensbatara ' + localStorage.token
            }
          }
        );

        const json = await res.json();
        this.listJk = json.data || [];

      } catch (err) {
        console.error('Gagal load tabel pendonor:', err);
      }
    },

    async loadPermintaanByRuanganPie() {
      try {
        const res = await fetch(
          this.$store.state.url.DASHBOARD + 'permintaanByRuanganPie',
          {
            headers: {
              authorization: 'kikensbatara ' + localStorage.token
            }
          }
        );

        const json = await res.json();
        this.renderPermintaanRuanganPie(json.data || []);

      } catch (err) {
        console.error('Gagal load pie ruangan:', err);
      }
    },

    renderPermintaanRuanganPie(seriesData) {
      Highcharts.chart('chartPermintaanRuangan', {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent'
        },
        title: {
          text: "Permintaan Darah per Ruangan"
        },
        subtitle: {
          text: null
        },
        tooltip: {
          pointFormat: '<b>{point.y}</b> permintaan ({point.percentage:.1f}%)'
        },
        plotOptions: {
          pie: {
            innerSize: '60%', // DONUT
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b><br>{point.percentage:.1f}%'
            }
          }
        },
        series: [
          {
            name: 'Jumlah Permintaan',
            colorByPoint: true,
            data: seriesData
          }
        ]
      });
    },


    async loadPermintaanByRuanganTable() {
      try {
        const res = await fetch(
          this.$store.state.url.DASHBOARD + 'permintaanByRuanganTable',
          {
            headers: {
              authorization: 'kikensbatara ' + localStorage.token
            }
          }
        );

        const json = await res.json();
        this.listBidangUsaha = json.data || [];

      } catch (err) {
        console.error('Gagal load tabel ruangan:', err);
      }
    },








  },

  mounted() {
    const get_profile = JSON.parse(localStorage.profile);

    this.tipe = Number(get_profile.profile.db_csrkonsel);

    this.mitra = {
      id: get_profile._id,
      nama: get_profile.profile.nama,
      username: get_profile.username,
      email: get_profile.email,
      telp: get_profile.profile.telp,
      alamat: get_profile.profile.alamat,
      pic: get_profile.profile.pic,
      file_name: get_profile.profile.file_name // logo perusahaan
    };

    // this.getMitra(get_profile._id);

    this.loadWidgetDashboard();
    this.loadPermintaanDarahByGolongan();
    this.loadPendonorByGender();
    this.loadPendonorGenderTable();
    this.loadPermintaanByRuanganPie();
    this.loadPermintaanByRuanganTable();
  },

  watch: {
    selectedYear() {
      this.loadPermintaanDarahByGolongan();
    }
  },


}
</script>
