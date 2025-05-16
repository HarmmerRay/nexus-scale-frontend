<template>
  <div class="device-management">
    <!-- 标签页导航 -->
    <div class="tab-nav">
      <div
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-item', { active: activeTab === tab.name }]"
          @click="activateTab(tab.name)"
      >
        {{ tab.name }}
        <span v-if="tab.closable" class="close-btn" @click.stop="removeTab(tab)">×</span>
      </div>
    </div>

    <!-- 动态组件容器 -->
    <component :is="activeComponent" v-if="activeComponent" :user="user" @device-selected="handleDeviceSelect"/>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
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
  { id: 1, name: "设备页", closable: false, component: 'DevicesPage' }
])
const activeTab = ref("设备页")
const currentDeviceId = ref(null)

// 计算当前激活的组件类型
const activeComponent = computed(() => {
  const activeTabInfo = tabs.value.find(tab => tab.name === activeTab.value)
  return activeTabInfo ? componentMap[activeTabInfo.component] : null
})

// 处理设备选择事件
const handleDeviceSelect = (deviceId) => {
  const tabName = `设备详情-${deviceId}`

  // 检查是否已存在相同设备ID的标签页
  if (!tabs.value.some(tab => tab.name === tabName)) {
    tabs.value.push({
      id: Date.now(),
      name: tabName,
      closable: true,
      component: 'DataShowPage'
    })
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
}

.tab-item {
  padding: 8px 12px;
  cursor: pointer;
  position: relative;
  border-bottom: 2px solid transparent;
}

.tab-item.active {
  border-bottom-color: #42b883;
}

.close-btn {
  margin-left: 8px;
  color: red;
  cursor: pointer;
  font-weight: bold;
}
</style>