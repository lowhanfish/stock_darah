<template>
  <div id="app">
    <Header />
    <router-view />
    <Footer />
  </div>
</template>

<script>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export default {
  mounted() {
    fetch('https://server-pindara.bludrs-konut.id/api/v1/publish/visitor/hit', {
      method: 'POST'
    }).catch(() => {})
  },
  components: { Header, Footer }
}
</script>
