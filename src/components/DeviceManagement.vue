<script setup>
import { ref, computed } from 'vue'
import {
  add_device,
  all_devices,
  batch_delete_devices,
  delete_device,
  search_device,
  update_device_name
} from '@/api/device.js'
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
    // 为每个device添加kv isEditing:false
    devices.value = res.data.data.map(device => ({
      ...device,
      isEditing: false // 为每个设备添加编辑状态
    }))
    console.log(res.data)
  } catch (error) {
    ElMessage.error('获取设备列表失败')
  }
}

const searchDevices = ref([])
// 搜索处理
const handleSearch = async () => {
  const keyword = searchText.value.trim()
  if (!keyword) {
    searchDevices.value = [] // 清空搜索结果
    return
  }

  try {
    const res = await search_device(keyword)
    searchDevices.value = res.data.data || []
    // 为每个device添加kv isEditing:false
    searchDevices.value = res.data.data.map(device => ({
      ...device,
      isEditing: false // 为每个设备添加编辑状态
    }))
  } catch (error) {
    ElMessage.error('搜索设备失败')
    searchDevices.value = []
  }
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
    devices.value = devices.value.filter(d => !selectedDevices.value.includes(d.deviceId))
    batch_delete_devices(selectedDevices.value).then((res) => {
      console.log(res.data)
    })
    selectedDevices.value = [] // 清空选中状态

    ElMessage.success('删除成功')
  } catch {
    // 用户取消操作
  }
}

// 单个删除
const handleSingleDelete = async (deviceId) => {
  try {
    await ElMessageBox.confirm('确定要删除该设备吗？', '警告', {
      type: 'warning'
    })
    devices.value = devices.value.filter(d => d.deviceId !== deviceId)
    delete_device(deviceId).then((res) => {
      console.log(res.data)
    })
    ElMessage.success('删除成功')
  } catch {
    // 用户取消
  }
}
// 控制对话框显示
const showDialog = ref(false)
const isTestMode = ref(true) // 测试环境标识

// 表单数据
const formData = ref({
  deviceName: '',
  deviceType: '',
  macAddress: ''
})

// Mac地址生成规则
const macPrefixMap = {
  temperature: 'TP',
  humidity: 'HM',
  air_component: 'AC',
  soil_NPK: 'NPK',
  soil_PH: 'PH',
  soil_trace_elements: 'TE',
  wind_speed: 'WS',
  wind_direction: 'WD',
  light_intensity: 'LI'
}

// 生成测试Mac地址
const generateMacAddress = async () => {
  const type = formData.value.deviceType
  if (type === '') {
    try {
      // 等待用户确认
      await ElMessageBox.confirm('请选择设备类型后再自动生成唯一标识', '警告', {
        type: 'warning'
      });
      return;
      // 用户点击确认后继续执行
    } catch (error) {
      // 用户点击取消，直接返回
      return;
    }
  }
  const prefix = macPrefixMap[type]
  // 生成时间戳部分（毫秒级）
  const timestamp = Date.now().toString();

// 生成8位随机数字部分
  const randomDigits = Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(8, '0');

// 组合两部分形成完整的随机字符串
  const randomPart = `${timestamp}${randomDigits}`;
  formData.value.macAddress = `${prefix}-${randomPart}`
}

// 表单提交处理
const handleSubmit = () => {
  // 这里添加实际的设备添加逻辑
  console.log('准备添加设备:', {
    ...formData.value,
    timestamp: new Date().toISOString()
  })
  add_device(formData.value.macAddress,formData.value.deviceName).then(res => {
    console.log(res.data)
  })
  // 重置表单并关闭对话框
  formData.value = { deviceName: '', deviceType: '', macAddress: '' }
  showDialog.value = false
}
// 新增设备（示例）
const handleAddDevice = () => {
  showDialog.value = true
  // 弹出对话框，添加一台设备
  // 对话框就是添加设备的对话框，有三个参数 设备名、设备种类、设备Mac号（本来应该用户自己输入，但是测试环境这个Mac号输入框后面跟一个测试生成按钮，自动根据设备种类生成一个）、
  console.log('打开新增设备界面')
}

const viewDeviceDetail = async (device) => {
  console.log("打开设备数据呈现页")
}
const handleSave = async (device) => {
  const res = await update_device_name(device.deviceId, device.deviceName)
  console.log(res.data)
  device.isEditing = false
}

const toggleEditMode = (device) => {
  device.isEditing = true
  $nextTick(() => {
    this.$refs.nameInput.focus()
  })
}
const popupVisible = ref(false)
const fullMac = ref('')
const showFullMac = (mac)=>{
  fullMac.value = mac;
  popupVisible.value = true;
  // 3秒后自动隐藏（可选）
  setTimeout(() => popupVisible.value = false, 3000);
}
// 初始化获取设备
fetchDevices()
</script>

<template>
  <div class="device-management">
    <!-- 首页、设备收集数据呈现页    -->
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
        <!-- 新增设备对话框 -->
        <transition name="fade">
          <div v-if="showDialog" class="dialog-overlay" @click.self="showDialog = false">
            <div class="dialog-content">
              <div class="dialog-header">
                <h3>新增设备</h3>
                <button class="close-btn" @click="showDialog = false">×</button>
              </div>

              <div class="dialog-body">
                <form @submit.prevent="handleSubmit" class="device-form">
                  <!-- 设备名称 -->
                  <div class="form-group">
                    <label>设备名称</label>
                    <input
                        v-model="formData.deviceName"
                        type="text"
                        placeholder="请输入设备名称(建议与设备相关)"
                        required
                    />
                  </div>

                  <!-- 设备类型 -->
                  <div class="form-group">
                    <label>设备类型</label>
                    <select v-model="formData.deviceType" required>
                      <option value="">请选择类型</option>
                      <option value="temperature">温度传感器</option>
                      <option value="humidity">湿度传感器</option>
                      <option value="air_component">空气成分传感器</option>
                      <option value="soil_NPK">土壤氮磷钾传感器</option>
                      <option value="soil_PH">PH值传感器</option>
                      <option value="soil_trace_elements">微量元素传感器</option>
                      <option value="wind_speed">风速传感器</option>
                      <option value="wind_direction">风向传感器</option>
                      <option value="light_intensity">光照强度传感器</option>
                    </select>
                  </div>

                  <!-- Mac地址 -->
                  <div class="form-group">
                    <label>设备Mac地址</label>
                    <div class="mac-container">
                      <input
                          v-model="formData.macAddress"
                          type="text"
                          placeholder="设备上的唯一标识号"
                      />
                      <button
                          v-if="isTestMode"
                          type="button"
                          class="generate-btn"
                          @click="generateMacAddress"
                      >
                        生成测试Mac
                      </button>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="form-actions">
                    <button type="submit" class="submit-btn">确认添加</button>
                    <button type="button" class="cancel-btn" @click="showDialog = false">取消</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <!-- 搜索结果区域 -->
    <div v-if="searchDevices.length > 0" class="search-results">
      <h3 class="grid-title">搜索结果</h3>
      <div class="device-grid">
        <div
            v-for="device in searchDevices"
            :key="device.deviceId"
            class="device-card"
        >
          <!-- 保持设备卡片代码不变 -->
          <div class="card-header">
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
            <h3>{{device.deviceName}}</h3>
            <input
                type="text"
                v-model="device.deviceName"
                class="device-name-input"
                @blur="handleSave(device)"
            >
            <p style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">
              设备号: {{ device.deviceMac }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- 所有设备区域 -->
    <div class="all-devices">
      <h3 class="grid-title">所有设备</h3>
      <div class="device-grid">
        <div
            v-for="device in devices"
            :key="device.deviceId"
            class="device-card"
        >
          <!-- 保持设备卡片代码不变 -->
          <div class="card-header">
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
            <!-- 设备名称输入框，双向绑定 device.deviceName -->
            <h3
                v-if="!device.isEditing"
                @dblclick="toggleEditMode(device)"
                class="cursor-pointer"
            >{{ device.deviceName }}</h3>

            <div v-else class="relative">
              <input
                  type="text"
                  v-model="device.deviceName"
                  class="device-name-input w-full"
                  @blur="handleSave(device)"
                  @keyup.enter="handleSave(device)"
                  ref="nameInput"
              >
            </div>
            <p
                class="device-mac"
                @click="showFullMac(device.deviceMac)"
            >
              设备号: {{ device.deviceMac }}
            </p>
            <!-- 弹出层 -->
            <div v-if="popupVisible" class="popup">
              {{ fullMac }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.device-management {
  max-width: 100%;
  margin: 20px auto;
}

.add-device-btn {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-device-btn:hover {
  background-color: #45a049;
}

/* 对话框样式 */
.dialog-overlay {
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

.dialog-content {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
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

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

/* 表单样式 */
.device-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-weight: 500;
  color: #555;
}

input[type="text"], select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.mac-container {
  display: flex;
  gap: 8px;
}

.generate-btn {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.generate-btn:hover {
  background-color: #1976D2;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #45a049;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #d32f2f;
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
.device-mac {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  cursor: pointer;
}

.popup {
  position: fixed;
  padding: 8px 12px;
  background: #333;
  color: white;
  border-radius: 4px;
  font-size: 14px;
  z-index: 1000;
}
.device-name-input {
  /* 继承 h3 的基础样式 */
  all: unset;
  font-size: 1.17em;
  font-weight: bold;
}

.device-name-input:focus {
  border-bottom: 2px solid #409eff; /* 聚焦时显示下划线 */
}
</style>

