<template>
    <div>
      <!-- :: Breadcrumb Header -->
      <section class="breadcrumb-header" style="background-image: url(assets/images/header/bgheader.png)">
        <div class="overlay"></div>
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <div class="banner">
                <h1>Galeri Kegiatan & Aksi Sosial</h1>
                <ul>
                  <li>
                    <a href="javascript:void(0);">Informasi dokumentasi kegiatan pelayanan, donor darah, dan aksi sosial.</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- :: Gallery -->
      <section class="gallery gallery-2 py-100-70">
        <div class="container">
          <div class="sec-title sec-title-2">
            <div class="row">
              <div class="col-lg-6">
                <h2>Galeri Kegiatan & Aksi Sosial</h2>
                <h3>Potret Pengabdian Kami untuk Kesehatan dan Kemanusiaan</h3>
              </div>
              <div class="col-lg-6">
                <p class="sec-explain">
                  Setiap foto di galeri ini menyimpan cerita tentang dedikasi, kepedulian, dan kerja sama kami dalam
                  memberikan pelayanan terbaik bagi masyarakat. Mulai dari kegiatan donor darah, bakti sosial, hingga
                  kampanye kesehatan — semua menjadi bukti komitmen kami.
                </p>
              </div>
            </div>
          </div>
  
          <!-- Grid gallery -->
          <div class="row">
            <div
              class="col-6 col-md-4 col-lg-3"
              v-for="(img, idx) in galleryImages"
              :key="img.id || idx"
            >
              <div class="gallery-item-card">
                <div class="img-box" @click="openModal(imgFullUrl(img))" role="button" tabindex="0">
                  <img
                    class="gallery-item-img"
                    :src="imgFullUrl(img)"
                    :alt="img.nama_kegiatan || 'Gallery image ' + (idx + 1)"
                    loading="lazy"
                    @error="onImageError"
                  />
                </div>
  
                <div class="card-body">
                  <h4 class="card-title">{{ img.nama_kegiatan }}</h4>
                  <div class="meta">
                    <small>{{ formatDate(img.created_at) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- No data -->
          <div v-if="galleryImages.length === 0" class="no-data">
            Belum ada foto untuk ditampilkan.
          </div>
  
          <div class="row" v-if="totalPages > 1">
          <div class="col">
            <div class="pagination-area">
              <ul class="pagination">
                <li :class="{ disabled: currentPage === 1 }" @click="changePage(currentPage - 1)">
                  Prev
                </li>
                <li
                  v-for="page in totalPages"
                  :key="page"
                  :class="{ active: page === currentPage }"
                  @click="changePage(page)"
                >
                  {{ page }}
                </li>
                <li :class="{ disabled: currentPage === totalPages }" @click="changePage(currentPage + 1)">
                  Next
                </li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </section>
  
      <!-- Modal Preview -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 style="color: aliceblue!important;">{{ truncateText(selectedTitle, 15) }}</h3>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>
          <div class="modal-body">
            <img :src="modalImage" alt="Preview" class="modal-img" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "GalleryPage",
    data() {
      return {
        galleryImages: [],
        currentPage: 1,
        pageLimit: 12, 
        totalItems: 0,
        totalPages: 0,
        showModal: false,
        modalImage: null,
        selectedTitle: null,
        placeholder: "/assets/images/placeholder.png"
      };
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      async fetchData() {
        try {
          const payload = {
            data_ke: this.currentPage,
            page_limit: this.pageLimit
            // tidak memasukkan cari_value karena publish ingin semua foto
          };
  
          const res = await fetch(this.$store.state.URL.FOTO + "getview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
  
          if (!res.ok) throw new Error("Gagal mengambil data gallery");
  
          const json = await res.json();
  
          if (json && json.success) {
            this.galleryImages = Array.isArray(json.data) ? json.data : [];
            // backend mengirim { success:true, data: rows, total: total }
            this.totalItems = typeof json.total === "number" ? json.total : (json.total && parseInt(json.total)) || 0;
            this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageLimit));
          } else {
            // fallback
            this.galleryImages = [];
            this.totalItems = 0;
            this.totalPages = 0;
          }
        } catch (err) {
          console.error("❌ Error fetchData:", err);
          this.galleryImages = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
      },
      imgFullUrl(img) {
        // Pastikan store menyediakan base uploads; jika tidak, gunakan UPLOADS_DIR relative
        const base = this.$store?.state?.UPLOADS || "/uploads/";
        const fname = img.file_name || "";
        // trim slash if any duplicates
        return base.replace(/\/+$/, "") + "/" + fname.replace(/^\/+/, "");
      },
      onImageError(e) {
        e.target.src = this.placeholder;
      },
      openModal(src) {
        this.modalImage = src;
        const found = this.galleryImages.find(i => (this.$store?.state?.UPLOADS || "/uploads/") + (i.file_name || "") === src);
        this.selectedTitle = found ? found.nama_kegiatan : null;
        this.showModal = true;
      },
      closeModal() {
        this.showModal = false;
        this.modalImage = null;
        this.selectedTitle = null;
      },
      truncateText(text, len = 60) {
        if (!text) return "";
        return text.length > len ? text.substring(0, len).trim() + "…" : text;
      },
      formatDate(date) {
        if (!date) return "-";
        try {
          const d = new Date(date);
          return d.toLocaleDateString("id-ID");
        } catch {
          return date;
        }
      },
      changePage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.fetchData();
        // scroll to top of gallery (opsional)
        window.scrollTo({ top: 200, behavior: "smooth" });
      }
    },
    computed: {
      // Buat range halaman yang terlihat (misal max 7 tombol)
      visiblePageNumbers() {
        const total = this.totalPages;
        const current = this.currentPage;
        const maxButtons = 7;
        if (total <= maxButtons) {
          return Array.from({ length: total }, (_, i) => i + 1);
        }
        let start = Math.max(1, current - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;
        if (end > total) {
          end = total;
          start = total - maxButtons + 1;
        }
        const arr = [];
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
      }
    }
  };
  </script>
  
  <style scoped>
  /* Gallery card */
  .gallery-item-card {
    margin: 12px 0;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }
  .gallery-item-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.09);
  }
  
  .img-box {
    width: 100%;
    aspect-ratio: 1 / 1; /* membuat kotak persegi responsif */
    overflow: hidden;
    background: #f2f2f2;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .gallery-item-img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* crop dan isi area tanpa distorsi */
    display: block;
    transition: transform 0.4s ease;
  }
  
  .gallery-item-card:hover .gallery-item-img {
    transform: scale(1.05);
  }
  
  /* card body */
  .card-body {
    padding: 12px;
  }
  .card-title {
    margin: 6px 0 4px;
    font-size: 14px;
    line-height: 1.3;
    color: #1a2b4a;
  }
  .tags a {
    font-size: 12px;
    color: #13ade5;
    text-transform: capitalize;
    text-decoration: none;
  }
  
  /* pagination */
  .pagination-wrap {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
    margin-top: 28px;
    flex-wrap: wrap;
  }
  .page-btn,
  .page-number {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #e6e6e6;
    background: #fff;
    cursor: pointer;
    min-width: 44px;
  }
  .page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .page-number.active {
    background: #13ade5;
    color: white;
    border-color: #13ade5;
  }
  
  /* no data */
  .no-data {
    text-align: center;
    padding: 40px 0;
    color: #777;
  }
  
  /* modal */
  .modal-overlay {
    position: fixed;
    z-index: 1200;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .modal-content {
    background: white;
    border-radius: 8px;
    width: 95%;
    max-width: 900px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  }
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #ff6565;
    color: #fff;
  }
  .modal-body {
    padding: 16px;
    text-align: center;
    background: #fff;
  }
  .modal-img {
    max-width: 100%;
    max-height: 75vh;
    object-fit: contain;
  }
  .close-btn {
    background: transparent;
    border: none;
    font-size: 24px;
    color: #fff;
    cursor: pointer;
  }
  </style>
  