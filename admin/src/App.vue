<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="glossy main1" v-if="!checkLogin">
      <q-toolbar>
        <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu" icon="menu" />
        <q-toolbar-title>
          PINDARA - BLUD RS Konawe Utara
        </q-toolbar-title>
        <div>
          <q-btn style="color:white" flat color="white" @click="$q.fullscreen.toggle()"
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'" />

          <q-btn dense round :color="audioUnlocked ? 'green-6' : 'grey-6'"
            :icon="audioUnlocked ? 'notifications_active' : 'notifications_off'" @click="unlockAudio" />

        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above content-class="bg-grey-2 shadow-up-4" v-if="!checkLogin">
      <SideBar />
    </q-drawer>


    <q-page-container class="bg-grey-2">
      <router-view />
    </q-page-container>

    <audio ref="notifSound" src="/sound/notif.mp3"></audio>


  </q-layout>
</template>

<script>


import { AppFullscreen } from 'quasar'
import HelloWorld from './components/HelloWorld.vue'
import io from 'socket.io-client'

export default {
  name: 'LayoutDefault',

  components: {
    HelloWorld
  },

  data() {
    return {
      leftDrawerOpen: false,
      text: '',
      dense: true,

      notifUnread: 0,
      isMuted: false,
      socket: null,
      audioUnlocked: false // ⬅️ WAJIB
    }
  },
  methods: {

    unlockAudio () {
    if (this.audioUnlocked) return

    const audio = this.$refs.notifSound
    if (!audio) return

    audio.volume = 0
    audio.play().then(() => {
      audio.pause()
      audio.currentTime = 0
      audio.volume = 1

      this.audioUnlocked = true
      localStorage.setItem('audioUnlocked', '1')

      this.$q.notify({
        type: 'positive',
        message: 'Notifikasi suara aktif'
      })
    }).catch(() => {})
  },

    playNotifSound () {
  if (!this.audioUnlocked) return

  const audio = this.$refs.notifSound
  audio.currentTime = 0
  audio.play().catch(() => {})
}



  },
  computed: {
    checkLogin() {
      if (this.$route.name === 'login') {
        return true;
      } else {
        return false;
      }
    }
  },

  mounted() {
    var get_profile = JSON.parse(localStorage.profile);

    // console.log(get_profile.profile)

    this.$store.state.unit_kerja = get_profile.profile.unit_kerja
    this.$store.state.unit_kerja_nama = get_profile.profile.unit_kerja_nama
    // ================= ROLE =================
    const tipe = Number(get_profile?.profile?.stokdarah_konut)

    const role =
      tipe === 1 || tipe === 2 ? 'admin_upd' :
        tipe === 3 ? 'admin_ruangan' :
          null

    if (!role) return

    // ================= SOCKET =================
    this.socket = io('https://server-pindara.bludrs-konut.id/', {
      transports: ['websocket', 'polling']
    })

    // PENTING: tunggu connect dulu
    this.socket.on('connect', () => {
      console.log('✅ SOCKET CONNECTED:', this.socket.id)

      // join room SETELAH connect
      this.socket.emit('join_role', role)
    })

    // ================= LISTENER NOTIFIKASI =================
    this.socket.on('permintaan_status_update', (payload) => {
      console.log('🔔 NOTIF DITERIMA:', payload)

      this.notifUnread++
      this.playNotifSound()

      this.$q.notify({
        type: 'info',
        message: payload.pesan,
        position: 'top-right',
        timeout: 2500
      })
    })

    this.audioUnlocked = localStorage.getItem('audioUnlocked') === '1'

  },
}
</script>

<style></style>
