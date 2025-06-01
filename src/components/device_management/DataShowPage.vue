<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { get_device_data } from '@/api/device'

const props = defineProps({
  device: {
    type: Object,
    required: false,
    default: () => ({})
  }
})

// 防御性编程：确保设备信息存在
const safeDevice = computed(() => {
  console.log('DataShowPage: 接收到的device prop', props.device)
  
  const safe = {
    deviceId: props.device?.deviceId || null,
    deviceName: props.device?.deviceName || '未知设备',
    deviceMac: props.device?.deviceMac || '未知设备号',
    ...props.device
  }
  
  console.log('DataShowPage: 安全的设备对象', safe)
  return safe
})

// 时间区间配置
const timeRanges = [
  { label: '过去1小时', value: 1, unit: 'hour', interval: 1, intervalUnit: 'minute' },
  { label: '过去3小时', value: 3, unit: 'hour', interval: 1, intervalUnit: 'minute' },
  { label: '过去6小时', value: 6, unit: 'hour', interval: 1, intervalUnit: 'minute' },
  { label: '过去12小时', value: 12, unit: 'hour', interval: 5, intervalUnit: 'minute' },
  { label: '过去1天', value: 1, unit: 'day', interval: 10, intervalUnit: 'minute' },
  { label: '过去3天', value: 3, unit: 'day', interval: 30, intervalUnit: 'minute' }
]

// 当前选中的时间区间
const selectedTimeRange = ref(timeRanges[0])

// 图表实例
let chartInstance = null
const chartRef = ref()

// 传感器数据配置（示例：温度传感器）
const sensorConfig = ref({
  temperature: {
    unit: "°C",
    range: "-40~85", 
    accuracy: "±0.1"
  }
})

// 图表数据
const chartData = ref({
  times: [],
  values: []
})

// 安全的图表数据访问
const safeChartData = computed(() => ({
  times: chartData.value?.times || [],
  values: chartData.value?.values || []
}))

// 加载状态
const loading = ref(true)

// 获取设备数据
const fetchDeviceData = async () => {
  try {
    // 检查设备ID是否存在
    if (!safeDevice.value.deviceId) {
      console.warn('设备ID不存在，使用模拟数据')
      return generateMockData()
    }

    const range = selectedTimeRange.value
    let timePeriodHours = 0
    
    // 将时间段转换为小时
    if (range.unit === 'hour') {
      timePeriodHours = range.value
    } else if (range.unit === 'day') {
      timePeriodHours = range.value * 24
    }
    
    // 调用API获取数据
    const response = await get_device_data(
      safeDevice.value.deviceId, // 设备ID
      timePeriodHours,            // 过去时段（小时）
      range.interval              // 数据采样间隔（分钟）
    )
    console.log("response.data:",response.data)
    
    // 后端返回的数据格式：{ msg, data: { times, values }, state }
    // 我们需要的是 response.data.data
    const apiData = response.data.data
    
    // 确保返回的数据结构正确
    return {
      times: apiData?.times || [],
      values: apiData?.values || []
    }
    
  } catch (error) {
    console.error('获取设备数据失败:', error)
    // 如果API调用失败，返回生成的假数据作为fallback
    return generateMockData()
  }
}

// 生成假数据（作为fallback）
const generateMockData = () => {
  const data = {
    times: [],
    values: []
  }
  
  const now = new Date()
  const range = selectedTimeRange.value
  let totalMinutes = 0
  
  // 计算总时间（分钟）
  if (range.unit === 'hour') {
    totalMinutes = range.value * 60
  } else if (range.unit === 'day') {
    totalMinutes = range.value * 24 * 60
  }
  
  // 计算数据点数量
  const dataPoints = Math.floor(totalMinutes / range.interval)
  
  // 生成时间序列和对应的温度数据
  for (let i = dataPoints; i >= 0; i--) {
    const timeOffset = i * range.interval * 60 * 1000 // 转换为毫秒
    const time = new Date(now.getTime() - timeOffset)
    
    // 格式化时间显示
    let timeStr = ''
    if (range.value <= 12 && range.unit === 'hour') {
      // 小时内显示：HH:mm
      timeStr = time.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    } else {
      // 天级别显示：MM-DD HH:mm
      timeStr = time.toLocaleString('zh-CN', { 
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }
    
    // 生成模拟温度数据（基础温度22°C，添加随机波动）
    const baseTemp = 22
    const variation = Math.sin(i * 0.1) * 3 + Math.random() * 2 - 1
    const temperature = Math.round((baseTemp + variation) * 10) / 10
    
    data.times.push(timeStr)
    data.values.push(temperature)
  }
  
  return data
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return
  
  // 销毁已存在的图表实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    title: {
      text: `${safeDevice.value.deviceName} - 温度数据`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const param = params[0]
        return `${param.name}<br/>温度: ${param.value}${sensorConfig.value.temperature.unit}`
      }
    },
    legend: {
      data: ['温度'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {
          title: '保存图片'
        }
      },
      right: 20
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: safeChartData.value.times,
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: `温度 (${sensorConfig.value.temperature.unit})`,
      axisLabel: {
        formatter: `{value}${sensorConfig.value.temperature.unit}`
      }
    },
    series: [
      {
        name: '温度',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2
        },
        areaStyle: {
          opacity: 0.1
        },
        data: safeChartData.value.values,
        itemStyle: {
          color: '#409eff'
        }
      }
    ]
  }
  
  chartInstance.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    if (chartInstance) {
      chartInstance.resize()
    }
  })
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance) return
  
  chartInstance.setOption({
    xAxis: {
      data: safeChartData.value.times
    },
    series: [{
      data: safeChartData.value.values
    }]
  })
}

// 切换时间区间
const handleTimeRangeChange = async () => {
  loading.value = true
  
  try {
    // 获取真实数据
    chartData.value = await fetchDeviceData()
    updateChart()
  } catch (error) {
    console.error('更新数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  handleTimeRangeChange()
}

// 组件挂载时初始化
onMounted(async () => {
  await nextTick()
  
  try {
    // 获取初始数据
    chartData.value = await fetchDeviceData()
    
    // 初始化图表
    initChart()
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    loading.value = false
  }
})

// 监听时间区间变化
watch(selectedTimeRange, () => {
  handleTimeRangeChange()
}, { deep: true })

// 组件卸载时清理
const cleanup = () => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', () => {})
}

// 暴露清理方法
defineExpose({
  cleanup
})
</script>

<template>
  <div class="data-show-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="device-info">
        <h2>{{ safeDevice.deviceName }}</h2>
        <span class="device-mac">设备号: {{ safeDevice.deviceMac }}</span>
      </div>
      
      <!-- 操作区域 -->
      <div class="controls">
        <div class="time-range-selector">
          <label>时间范围:</label>
          <select v-model="selectedTimeRange" class="time-select">
            <option 
              v-for="range in timeRanges" 
              :key="range.label" 
              :value="range"
            >
              {{ range.label }}
            </option>
          </select>
        </div>
        
        <button class="refresh-btn" @click="refreshData" :disabled="loading">
          <span v-if="loading">刷新中...</span>
          <span v-else>🔄 刷新</span>
        </button>
      </div>
    </div>

    <!-- 数据信息卡片 -->
    <div class="sensor-info">
      <div class="info-card">
        <h4>传感器信息</h4>
        <div class="info-details">
          <div class="info-item">
            <span class="label">单位:</span>
            <span class="value">{{ sensorConfig.temperature.unit }}</span>
          </div>
          <div class="info-item">
            <span class="label">测量范围:</span>
            <span class="value">{{ sensorConfig.temperature.range }}</span>
          </div>
          <div class="info-item">
            <span class="label">精度:</span>
            <span class="value">{{ sensorConfig.temperature.accuracy }}</span>
          </div>
          <div class="info-item">
            <span class="label">数据周期:</span>
            <span class="value">{{ selectedTimeRange.interval }}{{ selectedTimeRange.intervalUnit === 'minute' ? '分钟' : '小时' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表容器 -->
    <div class="chart-container">
      <div 
        ref="chartRef" 
        class="chart"
        :class="{ 'loading': loading }"
      ></div>
      
      <!-- 加载提示 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>正在加载数据...</p>
      </div>
    </div>

    <!-- 数据统计 -->
    <div class="data-stats" v-if="!loading && safeChartData.values.length > 0">
      <div class="stats-card">
        <h4>数据统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">最新值</span>
            <span class="stat-value">{{ safeChartData.values[safeChartData.values.length - 1] }}{{ sensorConfig.temperature.unit }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最大值</span>
            <span class="stat-value">{{ Math.max(...safeChartData.values).toFixed(1) }}{{ sensorConfig.temperature.unit }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最小值</span>
            <span class="stat-value">{{ Math.min(...safeChartData.values).toFixed(1) }}{{ sensorConfig.temperature.unit }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均值</span>
            <span class="stat-value">{{ (safeChartData.values.reduce((a, b) => a + b, 0) / safeChartData.values.length).toFixed(1) }}{{ sensorConfig.temperature.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-show-page {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.device-info h2 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 24px;
}

.device-mac {
  color: #666;
  font-size: 14px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-range-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-range-selector label {
  font-weight: 500;
  color: #555;
}

.time-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

.refresh-btn {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #337ecc;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.sensor-info {
  margin-bottom: 20px;
}

.info-card, .stats-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-card h4, .stats-card h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.info-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item .label {
  color: #666;
  font-weight: 500;
}

.info-item .value {
  color: #333;
  font-weight: bold;
}

.chart-container {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.chart {
  width: 100%;
  height: 500px;
  transition: opacity 0.3s;
}

.chart.loading {
  opacity: 0.5;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.data-stats {
  margin-top: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 12px;
  margin-bottom: 5px;
  text-transform: uppercase;
  font-weight: 500;
}

.stat-value {
  display: block;
  color: #333;
  font-size: 18px;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .chart {
    height: 400px;
  }
  
  .info-details {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .data-show-page {
    padding: 10px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>