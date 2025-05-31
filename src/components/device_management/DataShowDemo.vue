<script setup>
import { ref } from 'vue'
import DataShowPage from './DataShowPage.vue'

// 模拟设备数据
const mockDevice = ref({
  deviceId: 1,
  deviceName: '温度传感器A01',
  deviceMac: 'TP-12345678901234',
  state: 1
})

// 显示控制
const showDataPage = ref(false)

// 打开数据页面
const openDataPage = () => {
  showDataPage.value = true
}

// 返回设备列表
const backToList = () => {
  showDataPage.value = false
}
</script>

<template>
  <div class="demo-container">
    <div v-if="!showDataPage" class="demo-intro">
      <h2>传感器数据展示演示</h2>
      <div class="device-card-demo" @click="openDataPage">
        <div class="card-header">
          <span class="device-name">{{ mockDevice.deviceName }}</span>
          <span class="device-status online">在线</span>
        </div>
        <div class="card-body">
          <p class="device-mac">设备号: {{ mockDevice.deviceMac }}</p>
          <p class="demo-tip">💡 点击查看设备数据</p>
        </div>
      </div>
      
      <div class="feature-list">
        <h3>功能特点：</h3>
        <ul>
          <li>✅ 支持6种时间区间切换（1小时-3天）</li>
          <li>✅ 不同区间对应不同数据周期</li>
          <li>✅ 实时温度数据折线图</li>
          <li>✅ 传感器规格信息展示</li>
          <li>✅ 数据统计（最新值、最大值、最小值、平均值）</li>
          <li>✅ 响应式布局设计</li>
          <li>✅ 图表交互和工具栏</li>
        </ul>
      </div>
    </div>

    <div v-else class="data-page-wrapper">
      <div class="back-button-container">
        <button class="back-btn" @click="backToList">
          ← 返回设备列表
        </button>
      </div>
      <DataShowPage :device="mockDevice" />
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.demo-intro {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
}

.demo-intro h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
}

.device-card-demo {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 30px;
}

.device-card-demo:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.device-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.device-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.device-status.online {
  background-color: #67c23a;
  color: white;
}

.card-body {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.device-mac {
  color: #666;
  margin: 0 0 10px 0;
}

.demo-tip {
  color: #409eff;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

.feature-list {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.feature-list h3 {
  color: #333;
  margin-bottom: 15px;
}

.feature-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 8px 0;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
}

.feature-list li:last-child {
  border-bottom: none;
}

.data-page-wrapper {
  position: relative;
}

.back-button-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
}

.back-btn {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: #337ecc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-intro {
    padding: 20px;
  }
  
  .demo-intro h2 {
    font-size: 24px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style> 