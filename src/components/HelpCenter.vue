<template>
  <div class="help-center">
    <h1 class="title">帮助中心</h1>

    <!-- 问题列表 -->
    <ul class="faq-list">
      <li
          v-for="(item, index) in faqList"
          :key="index"
          class="faq-item"
          @click="showModal = true, currentFaq = item"
      >
        {{ item.question }}
      </li>
    </ul>

    <!-- 弹窗 -->
    <transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ currentFaq.question }}</h2>
            <button class="close-btn" @click="showModal = false">×</button>
          </div>
          <div class="modal-body">
            <ol class="steps">
              <li v-for="(step, i) in currentFaq.steps" :key="i">
                <span class="step-number">{{ i + 1 }}</span>
                {{ step }}
              </li>
            </ol>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 常见问题数据
const faqList = ref([
  {
    question: '如何注册账号？',
    steps: [
      '打开官网首页，点击右上角『注册』按钮。',
      '填写用户名、邮箱和密码，点击『下一步』。',
      '检查邮箱中的验证邮件并点击链接完成验证。'
    ]
  },
  {
    question: '忘记密码怎么办？',
    steps: [
      '点击登录页面的『忘记密码』链接。',
      '输入注册邮箱，系统将发送重置链接至邮箱。',
      '点击邮件中的链接并按照提示重置密码。'
    ]
  },
  {
    question: '如何修改个人资料？',
    steps: [
      '登录后进入『个人中心』页面。',
      '点击『编辑资料』按钮，修改相关信息并保存。'
    ]
  }
])

// 控制弹窗和当前问题
const showModal = ref(false)
const currentFaq = ref({})
</script>

<style scoped>
.help-center {
  max-width: 800px;
  margin: 40px auto;

  padding: 0 20px;
  font-family: 'Segoe UI', sans-serif;
}

.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 30px;
  color: #333;
}

.faq-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.faq-item {
  background-color: #f9f9f9;
  padding: 15px 20px;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.faq-item:hover {
  background-color: #e0e0e0;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  background-color: #fff;
  padding: 25px;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  font-size: 16px;
  line-height: 1.6;
}

.steps {
  list-style: none;
  padding-left: 0;
}

.steps li {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.step-number {
  width: 24px;
  height: 24px;
  background-color: #42b883;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: bold;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>