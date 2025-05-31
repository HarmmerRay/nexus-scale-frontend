<script setup>
import { ref, computed } from 'vue'
import {
  add_device,
  all_devices,
  batch_delete_devices,
  delete_device,
  search_device,
  search_devices_by_userId,
  update_device_name,
  search_device_templates,
  change_sensor_state
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
    // console.log(props.user)
    // console.log(props.user.userId)
    const res = await all_devices(props.user.userId)
    if (res.data.data === null) {
      devices.value = []
      ElMessage.warning('您还未创建设备')
      return
    }
    devices.value = res.data.data
    // 为每个device添加kv isEditing:false
    devices.value = res.data.data.map(device => ({
      ...device,
      isEditing: false, // 为每个设备添加编辑状态
      fullMac: false, // 为每个设备添加整个mac呈现状态
      state: device.state !== undefined ? device.state : 1 // 设备状态：1在线，0离线，默认为1
    }))
    // console.log(res.data)
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
    const res = await search_devices_by_userId(props.user.userId,keyword)
    searchDevices.value = res.data.data || []
    // 为每个device添加kv isEditing:false
    searchDevices.value = res.data.data.map(device => ({
      ...device,
      isEditing: false, // 为每个设备添加编辑状态
      fullMac: false, // 为每个设备添加整个mac呈现状态
      state: device.state !== undefined ? device.state : 1 // 设备状态：1在线，0离线，默认为1
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
const isSubmitting = ref(false) // 提交状态

// 表单数据
const formData = ref({
  deviceName: '',
  deviceType: '',
  macAddress: ''
})

// 设备模板数据
const deviceTemplates = ref([])

// 获取设备模板
const fetchDeviceTemplates = async () => {
  try {
    const res = await search_device_templates()
    // console.log('设备模板接口响应:', res)
    // 修正数据结构访问路径
    if (res.data.state === 200) {  
      deviceTemplates.value = res.data.data || []
      // console.log('设备模板数据:', deviceTemplates.value)
    } else {
      ElMessage.error('获取设备模板失败')
    }
  } catch (error) {
    // console.error('获取设备模板错误:', error)
    ElMessage.error('获取设备模板失败')
  }
}



// 生成测试Mac地址
const generateMacAddress = async () => {
  const type = formData.value.deviceType
  if (type === '') {
    ElMessage.warning('请先选择设备类型')
    return
  }
  
  // 从设备模板中找到对应的MAC前缀
  const selectedTemplate = deviceTemplates.value.find(template => template.enName === type)
  if (!selectedTemplate || !selectedTemplate.macPre) {
    ElMessage.error('未找到该设备类型的MAC前缀配置')
    return
  }
  
  const prefix = selectedTemplate.macPre
  // 生成时间戳部分（毫秒级）
  const timestamp = Date.now().toString().slice(-8); // 取后8位

  // 生成6位随机数字部分
  const randomDigits = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');

  // 组合形成完整的MAC地址
  formData.value.macAddress = `${prefix}-${timestamp}${randomDigits}`
}

// 表单提交处理
const handleSubmit = async () => {
  if (isSubmitting.value) return // 防止重复提交
  
  // 验证是否选择了设备类型
  if (!formData.value.deviceType) {
    ElMessage.warning('请选择设备类型')
    return
  }
  
  // 获取选中设备模板的dtId
  const selectedTemplate = deviceTemplates.value.find(template => template.enName === formData.value.deviceType)
  if (!selectedTemplate) {
    ElMessage.error('未找到选中的设备模板')
    return
  }
  
  isSubmitting.value = true
  try {
    // 调用添加设备API，传递dtId
    const res = await add_device(formData.value.macAddress, formData.value.deviceName, selectedTemplate.dtId)
    
    if (res.data.state === 200 || res.data.code === 200) {
      // 成功提示
      ElMessage.success('设备添加成功')
      
      // 重置表单并关闭对话框
      formData.value = { deviceName: '', deviceType: '', macAddress: '' }
      showDialog.value = false
      
      // 刷新设备列表
      await fetchDevices()
    } else {
      ElMessage.error(res.data.message || res.data.msg || '添加设备失败')
    }
  } catch (error) {
    console.error('添加设备错误:', error)
    ElMessage.error('添加设备失败，请检查网络连接')
  } finally {
    isSubmitting.value = false
  }
}
// 新增设备（示例）
const handleAddDevice = () => {
  // 重置表单和状态
  formData.value = { deviceName: '', deviceType: '', macAddress: '' }
  isSubmitting.value = false
  // 确保设备模板已加载
  if (deviceTemplates.value.length === 0) {
    ElMessage.warning('设备模板加载中，请稍后再试')
    fetchDeviceTemplates()
    return
  }
  showDialog.value = true
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
const showFullMac = (device)=>{
  device.fullMac = true;
  // 3秒后自动隐藏（可选）
  setTimeout(() => device.fullMac = false, 3000);
}

// 切换设备状态
const toggleDeviceState = async (device) => {
  const newState = device.state === 1 ? 0 : 1
  try {
    const res = await change_sensor_state(device.deviceId, newState)
    if (res.data.state === 200 || res.data.code === 200) {
      device.state = newState
      ElMessage.success(`设备已${newState === 1 ? '开启' : '关闭'}`)
    } else {
      ElMessage.error('状态切换失败')
    }
  } catch (error) {
    console.error('切换设备状态失败:', error)
    ElMessage.error('状态切换失败，请检查网络连接')
  }
}

// 初始化获取数据
fetchDevices()
fetchDeviceTemplates()
// 父子组件通信，向父组件发送事件
const emit = defineEmits(['device-selected']);

</script>

<template>
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
                    <option 
                      v-for="template in deviceTemplates" 
                      :key="template.dtId" 
                      :value="template.enName"
                    >
                      {{ template.showName }}
                    </option>
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
                  <button type="submit" class="submit-btn" :disabled="isSubmitting">
                    {{ isSubmitting ? '添加中...' : '确认添加' }}
                  </button>
                  <button type="button" class="cancel-btn" @click="showDialog = false" :disabled="isSubmitting">取消</button>
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
          @click="$emit('device-selected', device)"
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
          <div class="header-actions">
            <button 
              class="state-toggle-btn" 
              :class="{ 'online': device.state === 1, 'offline': device.state === 0 }"
              @click.stop="toggleDeviceState(device)"
              :title="device.state === 1 ? '点击关闭设备' : '点击开启设备'"
            >
              {{ device.state === 1 ? '在线' : '离线' }}
            </button>
            <button class="delete-icon" @click.stop="handleSingleDelete(device.deviceId)">×</button>
          </div>
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
              @click="showFullMac(device)"
          >
            设备号: {{ device.deviceMac }}
          </p>
          <!-- 弹出层 -->
          <div v-if="device.fullMac " class="popup">
            {{ device.deviceMac  }}
          </div>
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
          class="device-card">
        <!-- 保持设备卡片代码不变 -->
        <div class="card-header">
          <input
              type="checkbox"
              v-model="selectedDevices"
              :value="device.deviceId"
              class="device-checkbox"
              @click.stop
          >
          <div class="header-actions">
            <button 
              class="state-toggle-btn" 
              :class="{ 'online': device.state === 1, 'offline': device.state === 0 }"
              @click.stop="toggleDeviceState(device)"
              :title="device.state === 1 ? '点击关闭设备' : '点击开启设备'"
            >
              {{ device.state === 1 ? '在线' : '离线' }}
            </button>
            <button class="delete-icon" @click.stop="handleSingleDelete(device.deviceId)">×</button>
          </div>
        </div>
        <div @click="$emit('device-selected', device)">
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
              @click="showFullMac(device)"
          >
            设备号: {{ device.deviceMac }}
          </p>
          <!-- 弹出层 -->
          <div v-if="device.fullMac" class="popup">
            {{ device.deviceMac }}
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-checkbox {
  width: 16px;
  height: 16px;
}

.state-toggle-btn {
  padding: 2px 8px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;
  text-align: center;
}

.state-toggle-btn.online {
  background-color: #67c23a;
  color: white;
}

.state-toggle-btn.offline {
  background-color: #f56c6c;
  color: white;
}

.state-toggle-btn:hover {
  opacity: 0.8;
  transform: scale(1.05);
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

.submit-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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

.cancel-btn:hover:not(:disabled) {
  background-color: #d32f2f;
}

.cancel-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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