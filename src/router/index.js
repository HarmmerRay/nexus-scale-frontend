import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import DataShowDemo from '@/components/device_management/DataShowDemo.vue'
import {check_auth} from "@/util/auth.js";
import {verify_token} from "@/api/user.js";

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/demo',
    name: 'DataShowDemo',
    component: DataShowDemo,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
// 前端页面跳转权限校验拦截器
router.beforeEach((to, from, next) => {
  // console.log("to.path",to.path)
  if (to.meta.requiresAuth) {
    verify_token().then((res) => {
      if (res.data.state === 200 ) {
        if (to.path === '/login') {
          next('/home')
        }else{
          next()
        }
      } else {
        if (to.path === '/login') {
          next()
        }else{
          next('/login')
        }
      }
    })// 检查用户是否已登录
  } else {
    next()
  }
})