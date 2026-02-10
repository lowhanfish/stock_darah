<template>
  <footer class="footer">
    <div class="copyright">
      <div class="container footer-center">
        <p>
          © 2025 BLUD RS KONAWE UTARA.
          <br />
          <small v-if="totalVisitor !== null">
            Jumlah Pengunjung: <strong>{{ formatNumber(totalVisitor) }}</strong>
          </small>
        </p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',

  data() {
    return {
      totalVisitor: null
    }
  },

  mounted() {
    fetch('https://server-pindara.bludrs-konut.id/api/v1/publish/visitor/total')
      .then(res => res.json())
      .then(data => {
        this.totalVisitor = data.total
      })
      .catch(() => {
        this.totalVisitor = null
      })
  },

  methods: {
    formatNumber(n) {
      return Number(n).toLocaleString('id-ID')
    }
  }
}
</script>

<style scoped>
small {
  display: block;
  margin-top: 4px;
  font-size: 0.85rem;
  opacity: 0.8;
}
</style>
