import { createRouter, createWebHashHistory } from 'vue-router'


import Home from '../views/Home.vue'
import Pendonor from "../views/Pendonor.vue";
import berita from "../views/berita.vue";
import beritaisi from "../views/beritaisi.vue";
import stokdarah from "../views/stokdarah.vue";
import foto from "../views/foto.vue";





import login from "../views/login/login.vue";



const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },

  
  {
    path: '/login',
    name: 'login',
    component: login
  },
  {
    path: '/berita',
    name: 'Berita',
    component: berita
  },
  {
    path: '/beritaisi/:id',
    name: 'beritaisi',
    component: beritaisi
  },
  {
    path: '/Pendonor',
    name: 'Pendonor Aktif',
    component: Pendonor
  },
  
  {
    path: '/stokdarah',
    name: 'stokdarah',
    component: stokdarah
  },
  {
    path: '/foto',
    name: 'foto',
    component: foto
  },
  
 
]

const router = createRouter({
  // eslint-disable-next-line no-unused-vars
  scrollBehavior(to, from, savedPosition) {
    return {
      top: 0,
      behavior: 'smooth'
     }
  },
  history: createWebHashHistory(),
  routes,
})

export default router
