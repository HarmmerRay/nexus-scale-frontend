<template>
  <!-- 设备管理 -->
  <div class="device-grid">
    <div
        v-for="device in  devices"
        :key="device.id"
        class="device-card"
        @click="viewDeviceDetail(device)"
    >
      <h3>{{ device.deviceName }}</h3>
      <p>设备号: {{ device.deviceMac }}</p>
    </div>
  </div>

</template>

<script setup>
// 模拟设备数据
import {ref} from "vue";
import {all_devices} from "@/api/device.js";
import {defineProps} from 'vue';
const props = defineProps({ //获取父组件中的user变量，获取当前登录的用户的信息。
  user:{
    type: Object,
    required: true
  }
})
const devices = ref([
  { id: 1, deviceName: '温度传感器', deviceMac: 'TS-001' },
  { id: 2, deviceName: '压力监测仪', deviceMac: 'PM-002' },
  { id: 3, deviceName: '流量计', deviceMac: 'FM-003' },
  { id: 1, deviceName: '温度传感器', deviceMac: 'TS-001' },
  { id: 2, deviceName: '压力监测仪', deviceMac: 'PM-002' },
  { id: 3, deviceName: '流量计', deviceMac: 'FM-003' },
  { id: 1, deviceName: '温度传感器', deviceMac: 'TS-001' },
  { id: 2, deviceName: '压力监测仪', deviceMac: 'PM-002' },
  { id: 3, deviceName: '流量计', deviceMac: 'FM-003' },
  { id: 1, deviceName: '温度传感器', deviceMac: 'TS-001' },
  { id: 2, deviceName: '压力监测仪', deviceMac: 'PM-002' },
  { id: 3, deviceName: '流量计', deviceMac: 'FM-003' },
  { id: 1, deviceName: '温度传感器', deviceMac: 'TS-001' },
  { id: 2, deviceName: '压力监测仪', deviceMac: 'PM-002' },
  { id: 3, deviceName: '流量计', deviceMac: 'FM-003' }
])
// 请求后端设备数据

all_devices(props.user.userId).then(res => {
  // console.log("all_devices");
  // console.log(res.data);
  devices.value = res.data.data;
  console.log(res.data.data);
})

const viewDeviceDetail = (device) => {
  // 后续实现设备详情页跳转
  console.log('查看设备:', device)
}
</script>



<style scoped>

.device-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.device-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.device-card:hover {
  transform: translateY(-2px);
}
</style>