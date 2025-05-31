<script setup>
import {nextTick, ref} from 'vue';
import { customer_service } from '@/api/user.js';
import { useUserStore } from '@/store/userStore.js';

// 从Pinia store获取用户信息
const userStore = useUserStore();
const user = userStore.getUser;
const userId = ref(user?.userId);

// 模拟聊天记录
const messages = ref([
  { text: '您好！有什么可以帮助您的？', isBot: true },
  { text: '我们的工作时间是：周一至周五 9:00-18:00', isBot: true },
  { text: '客服电话：400-123-4567', isBot: true },
  { text: '紧急问题请联系：emergency@example.com', isBot: true },
  { text: '请问一下如何绑定设备？', isBot: false }
]);

// 下载二维码处理
const downloadQRCode = () => {
  const link = document.createElement('a');
  link.href = '/src/assets/wechat-qrcode.png'; // 替换为实际路径
  link.download = 'wechat-customer-service.png';
  link.click();
};

const messageText = ref("")
const isLoading = ref(false)

const chatContainer = ref(null);
// 滚动到底部函数
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const sendMessage = async () => {
  if (!messageText.value.trim() || isLoading.value) return
  
  // 检查用户是否已登录
  if (!user || !userId.value) {
    messages.value.push({
      text: '请先登录后再使用客服功能',
      isBot: true
    });
    await nextTick();
    scrollToBottom();
    return;
  }

  const userMessage = messageText.value;
  
  // 添加用户消息（右侧显示）
  messages.value.push({
    text: userMessage,
    isBot: false  // 确保这个值为false
  })
  
  // 清空输入框
  messageText.value = '';
  isLoading.value = true;
  
  // 确保DOM更新后滚动到底部
  await nextTick();
  scrollToBottom();

  // 添加正在输入的提示
  messages.value.push({
    text: '客服正在输入中...',
    isBot: true,
    isTyping: true
  });
  
  await nextTick();
  scrollToBottom();

  try {
    // 调用真实的客服API
    const response = await customer_service(userId.value, userMessage);
    console.log(response.data)
    // 移除正在输入的提示
    messages.value = messages.value.filter(msg => !msg.isTyping);
    
    // 添加客服回复（左侧显示）
    messages.value.push({
      text: response.data.data || '客服已收到您的消息，稍后会为您处理',
      isBot: true
    });
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
    
  } catch (error) {
    console.error('发送消息失败:', error);
    
    // 移除正在输入的提示
    messages.value = messages.value.filter(msg => !msg.isTyping);
    
    // 添加错误提示消息
    messages.value.push({
      text: '抱歉，消息发送失败，请稍后重试或联系客服电话：400-123-4567',
      isBot: true
    });
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="contact-container">
    <!-- 左边聊天区 -->
    <!-- 对话记录区 -->
    <div class="chat-section">
      <div class="chat-header">
        <h2>在线客服</h2>
        <p>我们将尽快回复您的咨询</p>
      </div>

      <div class="chat-messages" ref="chatContainer">
        <div
            v-for="(msg, index) in messages"
            :key="index"
            :class="['message', {
            'bot-message': msg.isBot,
            'user-message': !msg.isBot,
            'typing-message': msg.isTyping
          }]"
        >
          {{ msg.text }}
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <textarea
            v-model="messageText"
            placeholder="输入消息..."
            @keyup.enter.exact="sendMessage"
            rows="1"
        ></textarea>
        <button @click="sendMessage" class="send-btn" :disabled="isLoading">
          {{ isLoading ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>

    <!-- 右边联系信息 -->
    <div class="contact-section">
      <div class="qr-code-card">
        <h3>微信客服</h3>
        <img
            src="@/assets/wechat-qrcode.jpg"
            alt="微信二维码"
            class="qr-code"
        >
        <button @click="downloadQRCode" class="download-btn">
          下载二维码
        </button>
      </div>

      <div class="contact-info">
        <h3>其他联系方式</h3>
        <ul>
          <li>📞 客服电话：400-123-4567</li>
          <li>📧 客服邮箱：support@example.com</li>
          <li>📍 公司地址：天津市津南区XX路123号</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-container {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
}

/* 左边聊天区样式 */
.chat-section {
  flex: 3;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 25px;
}

.chat-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.chat-header h2 {
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.chat-header p {
  color: #7f8c8d;
  margin: 0;
}

.chat-messages {
  height: 500px;
  overflow-y: auto;
  padding-right: 15px;
  display: flex;
  flex-direction: column; /* 垂直排列消息 */
}

.message {
  padding: 10px;
  margin: 8px 0;
  border-radius: 8px;
  max-width: 80%;
  word-wrap: break-word;
  display: inline-flex; /* 根据内容调整宽度 */
}

.bot-message {
  background-color: #f1f0f0; /* 浅灰色背景 */
  color: #333;
  align-self: flex-start; /* 左对齐 */
}

.user-message {
  background-color: #0084ff; /* 蓝色背景 */
  color: white;
  align-self: flex-end; /* 右对齐 */
}

.typing-message {
  background-color: #e8f4fd; /* 更浅的背景色 */
  color: #666;
  font-style: italic;
  opacity: 0.8;
}

/* 右边联系信息样式 */
.contact-section {
  flex: 1;
  min-width: 300px;
}

.qr-code-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  padding: 25px;
  text-align: center;
  margin-bottom: 25px;
}

.qr-code {
  width: 100%;
  max-width: 200px;
  margin: 15px 0;
  border: 1px solid #eee;
  padding: 10px;
}

.download-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.download-btn:hover {
  background: #219a52;
}

.contact-info {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.contact-info h3 {
  color: #2c3e50;
  margin-top: 0;
}

.contact-info ul {
  list-style: none;
  padding: 0;
}

.contact-info li {
  padding: 10px 0;
  color: #34495e;
  border-bottom: 1px solid #eee;
}

.contact-info li:last-child {
  border-bottom: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .contact-container {
    flex-direction: column;
    padding: 15px;
  }

  .chat-section {
    margin-bottom: 25px;
  }
}

/* 新增聊天输入样式 */
.chat-section {
  display: flex;
  flex-direction: column;
  height: 70vh; /* 控制聊天区域高度 */
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  background: #f8f9fa;
}

.chat-input {
  border-top: 1px solid #eee;
  padding: 15px;
  background: white;
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  max-height: 120px;
  overflow-y: auto;
  font-family: inherit;
}

.send-btn {
  background: #07c160;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #06ad56;
}

.send-btn:disabled {
  background: #95d5b2;
  cursor: not-allowed;
}

/* 优化消息样式 */
.message {
  max-width: 70%;
  padding: 10px 15px;
  margin-bottom: 15px;
  border-radius: 5px;
  word-break: break-word;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}
</style>