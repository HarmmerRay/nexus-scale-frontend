<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="logo-area">
        <img :src="logo" class="logo" />
        <span class="title">NexusScale</span>
      </div>

      <div class="user-info">
        <div class="greeting-section">
          <span class="greeting-text">{{ currentTimeGreeting }}</span>
          <span class="greeting-username">{{ user.userName }}</span>
        </div>
        <img :src="user.avatarUrl" alt="用户头像" class="avatar" />
        <span class="username">{{user.userName}}</span>
        <div class="dropdown" @click="showMenu = !showMenu">
          <span>▼</span>
          <ul v-show="showMenu" class="dropdown-menu">
            <li @click="showProfileModal = true">个人信息</li>
            <li @click="handleLogout">退出登录</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左侧菜单 -->
      <div class="side-menu">
        <ul>
          <li
            v-for="item in menuItems"
            :key="item.name"
            :class="{ 'active': activeMenu === item.name }"
            @click="activeMenu = item.name"
          >
            {{ item.label }}
          </li>
        </ul>
      </div>

      <!-- 右侧内容 -->
      <div class="content-area">
<!--        父子组件通信 -->
        <component :is="activeComponent" :user="user"></component>
      </div>

      <!-- 个人信息弹窗 -->
      <div v-if="showProfileModal" class="modal-overlay" @click.self="showProfileModal = false">
        <div class="modal-content">
          <h3>编辑个人信息</h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>头像</label>
              <div class="avatar-upload">
                <img :src="form.avatarUrl.value" class="avatar-preview"  alt="用户头像"/>
                <input type="file" accept="image/*" @change="handleAvatarChange" />
              </div>
            </div>

            <div class="form-group">
              <label>用户名</label>
              <input
                  type="text"
                  v-model="form.userName"
                  required
                  maxlength="20"
              />
            </div>

            <div class="form-group">
              <label>电话</label>
              <input
                  type="tel"
                  v-model="form.phoneNumber"
                  pattern="^1[3-9]\d{9}$"
                  placeholder="请输入11位手机号"
                  required
              />
            </div>

            <div class="form-actions">
              <button type="button" @click="showProfileModal = false">取消</button>
              <button type="submit">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, onMounted, onUnmounted, watch} from 'vue'
import { useRouter } from 'vue-router'
import logo from '@/assets/logo-transparent.png'
import {useUserStore} from "@/store/userStore.js";
import {showToast} from "vant";
import DeviceManagement from "@/components/DeviceManagement.vue";
import UserManagement from "@/components/UserManagement.vue";
import ServerMonitor from "@/components/ServerMonitor.vue";
import LogManagement from "@/components/LogManagement.vue";
import HelpCenter from "@/components/HelpCenter.vue";
import ConnectUs from "@/components/ConnectUs.vue";
import ContactPrivacy from "@/components/ContactPrivacy.vue";
import {change_avatar, change_phone_number, change_user_name, upload_avatar} from "@/api/user.js";
import {ElMessage} from "element-plus";

const showMenu = ref(false)
const activeMenu = ref('device')

// 问候语相关
const currentTimeGreeting = ref('')
let timeUpdateInterval = null

// 根据当前时间计算问候语
const updateGreeting = () => {
  const hour = new Date().getHours()
  let timeOfDay = ''
  
  if (hour >= 0 && hour < 12) {
    timeOfDay = '上午好!'
  } else if (hour >= 12 && hour < 18) {
    timeOfDay = '下午好!'
  } else {
    timeOfDay = '晚上好!'
  }
  
  currentTimeGreeting.value = `欢迎回来，${timeOfDay}`
}

const router = useRouter()

const userStore = useUserStore();
const user = userStore.getUser
console.log(user)
// console.log(user)
// console.log(user.avatarUrl)
// 菜单项根据用户权限动态生成
const menuItems = computed(() => {
  const commonItems = [
    { name: 'device', label: '设备管理' },
    { name: 'help', label: '帮助中心' },
    { name: 'connect', label: '联系我们' },
    { name: 'contact', label: '协议政策' }
  ]
  
  // 管理员权限菜单项
  const adminItems = [
    { name: 'device', label: '设备管理' },
    { name: 'user', label: '用户管理' },
    { name: 'server', label: '服务器监控' },
    { name: 'log', label: '日志管理' },
    { name: 'help', label: '帮助中心' },
    { name: 'connect', label: '联系我们' },
    { name: 'contact', label: '协议政策' }
  ]
  
  // 根据用户level返回对应菜单项
  // level 0: 管理员，显示所有菜单
  // level 1: 普通用户，只显示基础菜单
  return user.level === 0 ? adminItems : commonItems
})

const activeComponent = computed(()=> {
  switch (activeMenu.value) {
    case 'device':
      return DeviceManagement;
    case 'user':
      return UserManagement;
    case 'server':
      return ServerMonitor;
    case 'log':
      return LogManagement;
    case 'help':
      return HelpCenter;
    case 'connect':
      return ConnectUs;
    case 'contact':
      return ContactPrivacy;
    default:
      return DeviceManagement;
  }
})
const handleLogout = () => {
  userStore.clearUser()  // 清空userStore
  // 清空名为"token"的Cookie
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  router.push('/login')
}
const showProfileModal = ref(false)
const form = {
  avatarUrl: ref(user.avatarUrl),
  userName: user.userName,
  phoneNumber: user.phoneNumber
}
const handleSubmit = () =>{
  change_avatar(user.userId,form.avatarUrl.value)
  change_user_name(user.userId,form.userName)
  change_phone_number(user.userId,form.phoneNumber)
  showProfileModal.value = false
  user.avatarUrl = form.avatarUrl.value
  user.userName = form.userName
  user.phoneNumber = form.phoneNumber
  userStore.setUser(user)
  ElMessage.success("修改个人信息成功")
}
const handleAvatarChange = (event) =>{
  const file = event.target.files[0];
  if (!file) return; // 如果没有选择文件则返回
  const formData = new FormData();
  formData.append('image', file);
  // 在这里可以调用API将图片上传到服务器
  upload_avatar(formData).then((res) => {
    console.log("res.data.data",res.data.data)
    form.avatarUrl.value = res.data.data;
    // change_avatar(user.userId, user.avatarUrl);
  })
  // console.log()
//   更换头像
}

// 检查当前菜单项是否有效，如果无效则切换到默认菜单
const validateActiveMenu = () => {
  const currentMenuNames = menuItems.value.map(item => item.name)
  if (!currentMenuNames.includes(activeMenu.value)) {
    activeMenu.value = 'device' // 默认切换到设备管理页面
  }
}

// 监听菜单项变化，当权限变化时重新验证当前菜单
watch(menuItems, () => {
  validateActiveMenu()
}, { deep: true })

// 组件挂载时设置定时器
onMounted(() => {
  updateGreeting() // 立即更新一次
  validateActiveMenu() // 验证当前菜单项是否有效
  // 每分钟更新一次问候语，以防跨越时间段
  timeUpdateInterval = setInterval(updateGreeting, 60000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval)
  }
})
</script>

<style scoped>
.home-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
}

.logo-area {
  display: flex;
  align-items: center;
}

.logo {
  width: 40px;
  height: 40px;
  margin-right: 15px;
}

.title {
  font-size: 20px;
  font-weight: 600;
  color: #1e90ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.greeting-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 10px;
}

.greeting-text {
  font-size: 14px;
  color: #666;
  font-weight: 400;
  line-height: 1.2;
}

.greeting-username {
  font-size: 16px;
  color: #333;
  font-weight: 600;
  margin-top: 2px;
}

.username {
  display: none; /* 桌面端隐藏，移动端显示 */
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
}

.dropdown {
  position: relative;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 25px;
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px 0;
  min-width: 120px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.dropdown-menu li {
  padding: 8px 15px;
  transition: background 0.3s;
}

.dropdown-menu li:hover {
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  display: flex;
}

.side-menu {
  width: 200px;
  background: #fff;
  border-right: 1px solid #eee;
  padding: 20px 0;
}

.side-menu ul {
  list-style: none;
  padding: 0;
}

.side-menu li {
  padding: 12px 25px;
  cursor: pointer;
  transition: background 0.3s;
}

.side-menu li:hover,
.side-menu li.active {
  background: #f0f6ff;
  color: #1e90ff;
}

.content-area {
  flex: 1;
  height: calc(100vh - 60px);
  padding: 30px;
  background: #f8f9fa;
  overflow-y: auto;
}

/* 模态框背景层 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* 确保覆盖其他内容 */
}

/* 模态框内容容器 */
.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.3s ease-in-out;
}

/* 模态框标题 */
.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
  text-align: center;
}

/* 表单组样式 */
.form-group {
  margin-bottom: 1.5rem;
}

/* 表单标签 */
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

/* 输入框样式 */
.form-group input[type="text"],
.form-group input[type="tel"] {
  width: 90%;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

/* 输入框悬停/聚焦效果 */
.form-group input[type="text"]:focus,
.form-group input[type="tel"]:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

/* 头像上传区域 */
.avatar-upload {
  position: relative;
  text-align: center;
  margin-bottom: 1rem;
}

/* 头像预览图 */
.avatar-upload .avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ddd;
  margin: 0 auto 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 文件上传输入框（隐藏原生样式） */
.avatar-upload input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* 操作按钮容器 */
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* 取消按钮样式 */
.form-actions button[type="button"] {
  flex: 1;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
}

/* 取消按钮悬停效果 */
.form-actions button[type="button"]:hover {
  background-color: #e9ecef;
  border-color: #aaa;
}

/* 保存按钮样式 */
.form-actions button[type="submit"] {
  flex: 1;
  padding: 0.75rem;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 保存按钮悬停效果 */
.form-actions button[type="submit"]:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* 响应式设计 - 移动端适配 */
@media (max-width: 768px) {
  .header {
    padding: 0 20px;
  }
  
  .greeting-section {
    display: none; /* 在小屏幕上隐藏问候语，节省空间 */
  }
  
  .user-info {
    gap: 10px;
  }
  
  .user-info .username {
    display: block; /* 在小屏幕上重新显示用户名 */
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .logo-area .title {
    font-size: 16px;
  }
  
  .avatar {
    width: 40px !important;
    height: 40px !important;
  }
}
</style>