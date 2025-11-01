import { createRouter, createWebHashHistory } from 'vue-router'


import Home from '../views/Home.vue'
import Pendonor from "../views/Pendonor.vue";
// import Berita from "../views/Berita.vue";
// import Beritaisi from "../views/Beritaisi.vue";



// ====================CSR==================

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
    path: '/Pendonor',
    name: 'Pendonor Aktif',
    component: Pendonor
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
