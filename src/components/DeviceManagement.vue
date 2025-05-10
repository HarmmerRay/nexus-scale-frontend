<template>
  <div class="device-management">
    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="left-actions">
        <input
            v-model="searchText"
            type="text"
            placeholder="输入设备名称或编号搜索"
            class="search-input"
            @keyup.enter="handleSearch"
        >
        <button class="btn search-btn" @click="handleSearch">搜索</button>
      </div>
      <div class="right-actions">
        <button class="btn delete-btn" @click="handleBatchDelete">批量删除</button>
        <button class="btn add-btn" @click="handleAddDevice">新增设备</button>
      </div>
    </div>

    <!-- 设备网格 -->
    <div class="device-grid">
      <div
          v-for="device in filteredDevices"
          :key="device.deviceId"
          class="device-card"
      >
        <div class="card-header">
          <!--@click.stop 不会让父组件接收到该元素点击的 这一事件 -->
          <input
              type="checkbox"
              v-model="selectedDevices"
              :value="device.deviceId"
              class="device-checkbox"
              @click.stop
          >

          <button class="delete-icon" @click.stop="handleSingleDelete(device.deviceId)">×</button>
        </div>
        <div @click="viewDeviceDetail(device)">
          <h3>{{ device.deviceName }}</h3>
          <p>设备号: {{ device.deviceMac }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-management {
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 15px;
}

.left-actions {
  display: flex;
  gap: 10px;
  flex-grow: 1;
  max-width: 500px;
}

.right-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: opacity 0.2s;
}

.btn:hover {
  opacity: 0.8;
}

.search-btn {
  background: #409eff;
  color: white;
}

.delete-btn {
  background: #f56c6c;
  color: white;
}

.add-btn {
  background: #67c23a;
  color: white;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.device-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.device-checkbox {
  width: 16px;
  height: 16px;
}

.delete-icon {
  cursor: pointer;
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  padding: 0 5px;
}

.delete-icon:hover {
  color: #f56c6c;
}
</style>

<script setup>
  import { ref, computed } from 'vue'
  import { all_devices } from '@/api/device.js'
  import { ElMessage, ElMessageBox } from 'element-plus'

  const props = defineProps({
    user: {
      type: Object,
      required: true
    }
  })

  // 设备数据
  const devices = ref([
    { deviceId: 2, deviceName: '压力监测仪', deviceMac: 'PM-002' },
    { deviceId: 3, deviceName: '流量计', deviceMac: 'FM-003' },
    { deviceId: 4, deviceName: '温度传感器2', deviceMac: 'TS-004' },
    { deviceId: 5, deviceName: '压力监测仪2', deviceMac: 'PM-005' },
    { deviceId: 6, deviceName: '流量计2', deviceMac: 'FM-006' }
  ])
  const selectedDevices = ref([])
  const searchText = ref('')

  // 过滤后的设备列表
  const filteredDevices = computed(() => {
    if (!searchText.value) return devices.value
    const search = searchText.value.toLowerCase()
    return devices.value.filter(d =>
        d.deviceName.toLowerCase().includes(search) ||
        d.deviceMac.toLowerCase().includes(search)
    )
  })

  // 获取设备数据
  const fetchDevices = async () => {
    try {
      const res = await all_devices(props.user.userId)
      devices.value = res.data.data
      console.log(res.data)
    } catch (error) {
      ElMessage.error('获取设备列表失败')
    }
  }

  // 搜索处理
  const handleSearch = () => {
    // 实际项目中这里可以调用接口搜索
    console.log('执行搜索:', searchText.value)
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedDevices.value.length === 0) {
      return ElMessage.warning('请先选择要删除的设备')
    }

    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedDevices.value.length} 台设备吗？`, '警告', {
        type: 'warning'
      })

      // 过滤保留未选中的设备
      devices.value = devices.value.filter(d => !selectedDevices.value.includes(d.id))
      selectedDevices.value = [] // 清空选中状态
      ElMessage.success('删除成功')
    } catch {
      // 用户取消操作
    }
  }

  // 单个删除
  const handleSingleDelete = async (id) => {
    try {
      await ElMessageBox.confirm('确定要删除该设备吗？', '警告', {
        type: 'warning'
      })
      devices.value = devices.value.filter(d => d.id !== id)
      ElMessage.success('删除成功')
    } catch {
      // 用户取消
    }
  }

  // 新增设备（示例）
  const handleAddDevice = () => {
    // 弹出对话框，添加一台设备
    // 对话框的页面描述：
    console.log('打开新增设备界面')
  }

  const viewDeviceDetail = async (device) => {
    console.log("打开设备数据呈现页")
  }
  // 初始化获取设备
  fetchDevices()
</script>