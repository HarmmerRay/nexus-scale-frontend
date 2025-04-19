import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Van from 'vant'  // showToast

const app = createApp(App)
app.use(router)
app.use(Van)
app.mount('#app')
