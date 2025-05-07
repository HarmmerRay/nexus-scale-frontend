import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vant from 'vant'  // showToast van-popup 都没有效果为什么? 没有引入 import 'vant/lib/index.css'  import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate' //页面刷新时能保留状态

import 'vant/lib/index.css'
import 'element-plus/dist/index.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(Vant)
app.use(ElementPlus)
app.mount('#app')
