<script setup>
import { ref, onMounted } from 'vue'

const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const grafanaUrl = 'http://192.168.56.10:3000/'

// 处理iframe加载完成
const handleIframeLoad = () => {
  isLoading.value = false
  hasError.value = false
}

// 处理iframe加载错误
const handleIframeError = () => {
  isLoading.value = false
  hasError.value = true
  errorMessage.value = '无法加载Grafana页面，请检查服务是否正常运行'
}

// 重新加载
const reloadIframe = () => {
  isLoading.value = true
  hasError.value = false
  // 重新设置iframe的src来触发重新加载
  const iframe = document.getElementById('grafana-iframe')
  if (iframe) {
    iframe.src = iframe.src
  }
}

// 打开新窗口
const openInNewWindow = () => {
  window.open(grafanaUrl, '_blank')
}

onMounted(() => {
  // 设置超时处理，如果15秒内没有加载完成，显示错误
  setTimeout(() => {
    if (isLoading.value) {
      handleIframeError()
      errorMessage.value = 'Grafana页面加载超时，可能是网络问题或服务未启动'
    }
  }, 15000)
})
</script>

<template>
  <div class="server-monitor">
    <div class="monitor-header">
      <h2>服务器监控 - Grafana Dashboard</h2>
      <div class="header-actions">
        <button @click="reloadIframe" class="btn reload-btn" :disabled="isLoading">
          {{ isLoading ? '加载中...' : '刷新' }}
        </button>
        <button @click="openInNewWindow" class="btn external-btn">
          在新窗口打开
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载Grafana监控面板...</p>
      <p class="loading-tip">如果长时间无法加载，请确认Grafana服务已启动</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>无法加载Grafana页面</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-tips">
        <h4>可能的解决方案：</h4>
        <ul>
          <li>确认Grafana服务正在运行 ({{ grafanaUrl }})</li>
          <li>检查网络连接是否正常</li>
          <li>确认Grafana配置允许iframe嵌入</li>
          <li>检查防火墙和端口设置</li>
        </ul>
      </div>
      <div class="error-actions">
        <button @click="reloadIframe" class="btn retry-btn">重试加载</button>
        <button @click="openInNewWindow" class="btn external-btn">在新窗口打开</button>
      </div>
    </div>

    <!-- Grafana iframe -->
    <div v-else class="iframe-container">
      <iframe
        id="grafana-iframe"
        :src="grafanaUrl"
        @load="handleIframeLoad"
        @error="handleIframeError"
        frameborder="0"
        allowfullscreen
        class="grafana-iframe"
      ></iframe>
    </div>

    <!-- 配置提示 -->
    <div class="config-tips">
      <details>
        <summary>如果页面无法显示，请配置Grafana允许iframe嵌入</summary>
        <div class="tips-content">
          <p>在Grafana配置文件中添加以下设置：</p>
          <pre><code>[security]
allow_embedding = true
cookie_samesite = none
cookie_secure = false</code></pre>
          <p>然后重启Grafana服务</p>
        </div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.server-monitor {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.monitor-header {
  background: white;
  padding: 15px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.monitor-header h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.reload-btn {
  background: #409eff;
  color: white;
}

.reload-btn:hover:not(:disabled) {
  background: #367cd6;
}

.reload-btn:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.external-btn {
  background: #67c23a;
  color: white;
}

.external-btn:hover {
  background: #5daf34;
}

.retry-btn {
  background: #e6a23c;
  color: white;
}

.retry-btn:hover {
  background: #cf9236;
}

/* 加载状态样式 */
.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-tip {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

/* 错误状态样式 */
.error-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  padding: 40px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-container h3 {
  color: #f56c6c;
  margin-bottom: 10px;
}

.error-message {
  color: #666;
  margin-bottom: 20px;
}

.error-tips {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: left;
  max-width: 500px;
}

.error-tips h4 {
  margin-top: 0;
  color: #333;
}

.error-tips ul {
  margin: 10px 0;
  padding-left: 20px;
}

.error-tips li {
  margin-bottom: 5px;
  color: #666;
}

.error-actions {
  display: flex;
  gap: 10px;
}

/* iframe容器样式 */
.iframe-container {
  flex: 1;
  background: white;
  position: relative;
}

.grafana-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

/* 配置提示样式 */
.config-tips {
  background: #fff9e6;
  border-top: 1px solid #e0e0e0;
  padding: 10px 20px;
}

.config-tips details {
  cursor: pointer;
}

.config-tips summary {
  color: #e6a23c;
  font-size: 12px;
  outline: none;
}

.tips-content {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.tips-content pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 10px 0;
}

.tips-content code {
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .monitor-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .error-container {
    padding: 20px;
  }

  .error-tips {
    padding: 15px;
  }
}
</style>