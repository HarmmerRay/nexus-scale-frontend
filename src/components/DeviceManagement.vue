<template>
  <div class="device-management">
    <!-- 标签页导航 -->
    <div class="tab-nav">
      <div
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-item', { active: activeTab === tab.name }]"
          @click="activateTab(tab.name)"
          :title="tab.fullName"
      >
        {{ tab.displayName }}
        <span v-if="tab.closable" class="close-btn" @click.stop="removeTab(tab)">×</span>
      </div>
    </div>

    <!-- 动态组件容器 -->
    <component 
      :is="activeComponent" 
      v-if="activeComponent" 
      :user="user" 
      :device="currentDevice"
      @device-selected="handleDeviceSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUpdated, onUnmounted } from 'vue'
import DevicesPage from "@/components/device_management/DevicesPage.vue"
import DataShowPage from "@/components/device_management/DataShowPage.vue"
// 从父组件传过来的user数据  从 Home.vue中
const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})
const user = props.user
// console.log(user)
// 组件映射表
const componentMap = {
  DevicesPage,
  DataShowPage
}

// 标签页数据
const tabs = ref([
  { id: 1, name: "设备页", fullName: "设备页", displayName: "设备页", closable: false, component: 'DevicesPage' }
])
const activeTab = ref("设备页")
const currentDeviceId = ref(null)
const deviceStorage = ref(new Map()) // 存储设备信息

// 动态计算标签页显示名称
const computeTabDisplayNames = () => {
  const tabContainer = document.querySelector('.tab-nav')
  if (!tabContainer) return

  const containerWidth = tabContainer.clientWidth
  const tabCount = tabs.value.length
  
  if (tabCount === 0) return
  
  // 计算每个标签页的基础空间（包括padding、margin、关闭按钮等）
  const tabBasicSpace = 50 // 基础内边距、边距等
  const closeButtonSpace = 24 // 关闭按钮占用空间
  
  let availableWidthPerTab = (containerWidth - tabCount * 4) / tabCount // 减去margin
  
  tabs.value.forEach(tab => {
    const hasCloseBtn = tab.closable
    const usedSpace = tabBasicSpace + (hasCloseBtn ? closeButtonSpace : 0)
    const availableTextWidth = Math.max(40, availableWidthPerTab - usedSpace)
    
    // 根据可用宽度计算字符数（中文字符约14px，英文字符约8px）
    const avgCharWidth = 12 // 平均字符宽度
    const maxCharsPerTab = Math.floor(availableTextWidth / avgCharWidth)
    
    if (tab.fullName.length > maxCharsPerTab && maxCharsPerTab > 3) {
      tab.displayName = tab.fullName.substring(0, maxCharsPerTab - 1) + '...'
    } else {
      tab.displayName = tab.fullName
    }
  })
}

// 监听标签页变化
watch(tabs, () => {
  setTimeout(computeTabDisplayNames, 0)
}, { deep: true })

// 计算当前激活的组件类型
const activeComponent = computed(() => {
  const activeTabInfo = tabs.value.find(tab => tab.name === activeTab.value)
  return activeTabInfo ? componentMap[activeTabInfo.component] : null
})

// 计算当前设备信息
const currentDevice = computed(() => {
  const activeTabInfo = tabs.value.find(tab => tab.name === activeTab.value)
  console.log('DeviceManagement: 当前激活标签页', activeTabInfo)
  
  if (activeTabInfo && activeTabInfo.deviceId) {
    const device = deviceStorage.value.get(activeTabInfo.deviceId)
    console.log('DeviceManagement: 获取到设备信息', device)
    return device
  }
  
  console.log('DeviceManagement: 无设备信息')
  return null
})

// 处理设备选择事件
const handleDeviceSelect = (device) => {
  console.log('DeviceManagement: 接收到设备选择事件', device)
  
  const tabName = device.deviceName
  const deviceId = device.deviceId

  // 存储设备信息
  deviceStorage.value.set(deviceId, device)
  console.log('DeviceManagement: 设备信息已存储', { deviceId, device })

  // 检查是否已存在相同设备ID的标签页
  if (!tabs.value.some(tab => tab.deviceId === deviceId)) {
    tabs.value.push({
      id: Date.now(),
      name: tabName,
      fullName: tabName,
      displayName: tabName,
      deviceId: deviceId,
      closable: true,
      component: 'DataShowPage'
    })
    console.log('DeviceManagement: 创建新标签页', tabName)
  }

  activateTab(tabName)
}

// 激活指定标签页
const activateTab = (tabName) => {
  activeTab.value = tabName
}

// 删除标签页
const removeTab = (tab) => {
  const index = tabs.value.indexOf(tab)
  tabs.value.splice(index, 1)

  // 如果删除的是当前激活页，切换到下一个存在的标签页
  if (activeTab.value === tab.name) {
    const nextTab = tabs.value[index] || tabs.value[index - 1]
    if (nextTab) {
      activateTab(nextTab.name)
    } else {
      activateTab("设备页")
    }
  }
}

// 组件挂载后计算标签页名称
onMounted(() => {
  computeTabDisplayNames()
  window.addEventListener('resize', computeTabDisplayNames)
})

onUpdated(() => {
  computeTabDisplayNames()
})

onUnmounted(() => {
  window.removeEventListener('resize', computeTabDisplayNames)
})
</script>

<style scoped>
.device-management {
  max-width: 100%;
  margin: 20px auto;
}

.tab-nav {
  display: flex;
  border-bottom: 1px solid #ccc;
  margin-bottom: 10px;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-item {
  padding: 8px 12px;
  cursor: pointer;
  position: relative;
  border-bottom: 2px solid transparent;
  flex-shrink: 0;
  min-width: 80px;
  max-width: 200px;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #f5f5f5;
  margin-right: 2px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  transition: all 0.3s ease;
}

.tab-item:hover {
  background: #e8e8e8;
}

.tab-item.active {
  border-bottom-color: #42b883;
  background: white;
}

.close-btn {
  margin-left: 8px;
  color: #999;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #fff;
  background: #ff4444;
}
</style>