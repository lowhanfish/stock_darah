import { createStore } from 'vuex'

var URL_APP = 'http://localhost:5088/'  

export default createStore({
  state: { 
    BASE_URL: URL_APP,  
    UPLOADS: URL_APP + 'uploads/',
    URL : {
      HOME: URL_APP + 'api/v1/publish/homeDarah/',
      JADWAL: URL_APP + 'api/v1/publish/jadwalPublish/',
      DONOR_PUBLISH : URL_APP +"api/v1/publish/pendonorPublish/",
      BERITA : URL_APP +"api/v1/publish/beritaPublish/",


    },
    
    
    
    auth: {
      token: localStorage.getItem('token') || null, 
      profile: localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')) : null,
      loading: false  
    },
    isVisible: false,  
  },
  getters: {
 
    isAuthenticated: (state) => !!state.auth.token,
    getProfile: (state) => state.auth.profile,
    getLoading: (state) => state.auth.loading,
    getBaseUrl: (state) => state.url.URL_APP,
  },
  mutations: {

    SET_TOKEN(state, token) {
      state.auth.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    SET_PROFILE(state, profile) {
      state.auth.profile = profile
      if (profile) {
        localStorage.setItem('profile', JSON.stringify(profile))
      } else {
        localStorage.removeItem('profile')
      }
    },
    SET_LOADING(state, loading) {
      state.auth.loading = loading
    },
   
  },
  actions: {
   
    async login({ commit, state }, { username, password }) {
      commit('SET_LOADING', true) 
      const body = { username, password }
      
      try {
        const response = await fetch(state.url.URL_APP + 'auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        })
        
        if (response.ok) {
          const result = await response.json()
          commit('SET_TOKEN', result.token)
          commit('SET_PROFILE', result.profile)
          return { success: true, data: result }
        } else {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Login gagal')
        }
      } catch (error) {
        console.error('Login action error:', error)
        throw error  // Throw ke component untuk handle error
      } finally {
        commit('SET_LOADING', false)  // Hide loading
      }
    },
    // Action logout (bonus, jika perlu nanti)
    logout({ commit }) {
      commit('SET_TOKEN', null)
      commit('SET_PROFILE', null)
      // Redirect atau clear state lain jika perlu
    },
    // Actions lama jika ada (kosong sekarang)
  },
  modules: {
  }
})
