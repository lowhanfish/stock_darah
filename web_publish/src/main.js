import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  


import 'owl.carousel/dist/assets/owl.carousel.css'
import 'owl.carousel/dist/assets/owl.theme.default.css'
import 'owl.carousel'

const app = createApp(App)
app.use(router)
app.mount('#app')
