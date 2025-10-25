import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter);

function loggedInRedirectDashboard(to, from, next) {
  if (localStorage.token) {
    next('/');
  } else {
    next();
  }
}


function isLoggedIn(to, from, next) {
  if (localStorage.token) {
    next()
  } else {
    next('/login');
  }
}




const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/login.vue'),
    beforeEnter: loggedInRedirectDashboard,
  },


  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: isLoggedIn,
  },

  {
    path: '/berita',
    name: 'Berita',
    component: () => import('../views/informasi/berita.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/jadwal_donor',
    name: 'Jadwal Donor',
    component: () => import('../views/informasi/jadwal_donor.vue'),
    beforeEnter: isLoggedIn,
  },


  {
    path: '/menuList',
    name: 'menuList',
    component: () => import('../views/dataMaster/menuList.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/klpUsers',
    name: 'klpUsers',
    component: () => import('../views/dataMaster/klpUsers.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/registrasi',
    name: 'registrasi',
    component: () => import('../views/dataMaster/registrasi.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/regisTenagaMedis',
    name: 'regisTenagaMedis',
    component: () => import('../views/dataMaster/regisTenagaMedis.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/regisPendonor',
    name: 'regisPendonor',
    component: () => import('../views/dataMaster/regisPendonor.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/regisMasy',
    name: 'regisMasy',
    component: () => import('../views/dataMaster/regisMasy.vue'),
    beforeEnter: isLoggedIn,
  },
  {
    path: '/regisAdmin',
    name: 'regisAdmin',
    component: () => import('../views/dataMaster/regisAdmin.vue'),
    beforeEnter: isLoggedIn,
  },

  {
    path: '/subidcsr',
    name: 'subidcsr',
    component: () => import('../views/dataMaster/subidcsr.vue'),
    beforeEnter: isLoggedIn,
  },


  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    beforeEnter: isLoggedIn,
  },


]

const router = new VueRouter({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes
})

export default router
