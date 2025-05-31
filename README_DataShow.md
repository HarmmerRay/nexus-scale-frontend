# 传感器数据展示组件 - DataShowPage.vue

## 功能概述

这是一个基于 Vue 3 和 ECharts 的传感器数据可视化组件，专门用于展示各种传感器的时序数据。目前以温度传感器为例实现，支持多种时间区间切换和数据统计功能。

## 核心功能

### 📊 数据可视化
- **折线图展示**：使用ECharts绘制平滑的温度变化曲线
- **面积填充**：半透明面积填充增强视觉效果
- **交互提示**：鼠标悬停显示具体时间和数值
- **工具栏**：支持图片保存等工具功能

### ⏰ 时间区间切换
支持6种预设时间区间，每种区间对应不同的数据采样周期：

| 时间区间 | 数据周期 | 数据点数量 |
|---------|---------|-----------|
| 过去1小时 | 1分钟 | ~60个点 |
| 过去3小时 | 1分钟 | ~180个点 |
| 过去6小时 | 1分钟 | ~360个点 |
| 过去12小时 | 5分钟 | ~144个点 |
| 过去1天 | 10分钟 | ~144个点 |
| 过去3天 | 30分钟 | ~144个点 |

### 📈 数据统计
实时计算并显示：
- **最新值**：当前最新的传感器读数
- **最大值**：时间区间内的最高温度
- **最小值**：时间区间内的最低温度
- **平均值**：时间区间内的平均温度

### 📋 传感器信息
动态显示传感器规格：
- **单位**：测量单位（如 °C）
- **测量范围**：传感器工作范围（如 -40~85）
- **精度**：测量精度（如 ±0.1）
- **数据周期**：当前选中区间的采样周期

## 组件使用方法

### 基本用法

```vue
<template>
  <DataShowPage :device="deviceInfo" />
</template>

<script setup>
import DataShowPage from '@/components/device_management/DataShowPage.vue'

const deviceInfo = {
  deviceId: 1,
  deviceName: '温度传感器A01',
  deviceMac: 'TP-12345678901234',
  state: 1
}
</script>
```

### 属性参数

| 参数 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| device | Object | ✅ | 设备信息对象 |

#### device 对象结构
```javascript
{
  deviceId: Number,    // 设备ID
  deviceName: String,  // 设备名称
  deviceMac: String,   // 设备MAC地址
  state: Number        // 设备状态（1:在线, 0:离线）
}
```

## 数据格式说明

### 传感器配置格式
```javascript
{
  "temperature": {
    "unit": "°C",        // 单位
    "range": "-40~85",   // 测量范围
    "accuracy": "±0.1"   // 精度
  }
}
```

### 模拟数据生成
当前版本使用算法生成模拟温度数据：
- **基础温度**：22°C
- **波动模式**：正弦波 + 随机噪声
- **数据范围**：18°C - 26°C 左右
- **时间格式**：根据区间自动调整显示格式

## 技术架构

### 依赖库
- **Vue 3**：组合式API和响应式系统
- **ECharts**：专业图表库，提供丰富的可视化功能
- **JavaScript Date API**：时间处理和格式化

### 核心方法

#### `generateMockData()`
根据选中的时间区间生成模拟数据
- 计算数据点数量
- 生成时间序列
- 模拟温度变化

#### `initChart()`
初始化ECharts图表实例
- 配置图表选项
- 设置样式和交互
- 绑定响应式事件

#### `updateChart()`
更新图表数据
- 刷新X轴时间数据
- 更新Y轴温度数据
- 保持图表配置

## 扩展性设计

### 支持多种传感器类型
组件设计为可扩展架构，可轻松添加其他传感器类型：

```javascript
// 湿度传感器示例
const sensorConfig = {
  humidity: {
    unit: "%RH",
    range: "0~100",
    accuracy: "±2"
  }
}

// 气压传感器示例
const sensorConfig = {
  pressure: {
    unit: "kPa",
    range: "80~110", 
    accuracy: "±0.1"
  }
}
```

### 后端接口对接
预留接口对接功能，只需替换 `generateMockData()` 方法：

```javascript
// 将来对接真实API
const fetchRealData = async () => {
  const response = await api.getSensorData({
    deviceId: props.device.deviceId,
    timeRange: selectedTimeRange.value,
    interval: selectedTimeRange.value.interval
  })
  return response.data
}
```

## 响应式设计

- **桌面端**：完整功能展示，500px图表高度
- **平板端**：调整控件布局，400px图表高度
- **手机端**：单列布局，优化触摸操作

## 性能优化

- **图表复用**：复用ECharts实例，避免重复创建
- **内存管理**：组件卸载时正确清理图表实例
- **懒加载**：按需加载图表数据
- **防抖处理**：时间区间切换时的加载状态管理

## 演示组件

项目包含 `DataShowDemo.vue` 演示组件，提供：
- 功能介绍页面
- 交互式演示
- 返回导航功能

可在路由中直接使用该组件进行功能预览和测试。 