# 设备模板功能实现说明

## 📋 功能概述

将原来硬编码的设备类型改为从数据库动态获取，实现了设备模板的管理功能。

## 🛠️ 实现内容

### 1. 数据库结构

**device_template 表结构：**
- `dt_id`: 主键ID (自增)
- `show_name`: 显示名称（中文）
- `en_name`: 英文名称（用于程序逻辑）
- `template`: JSON格式的数据模板
- `create_time`: 创建时间
- `update_time`: 更新时间
- `mac_pre`: MAC地址前缀

### 2. 新增API接口

**src/api/device.js:**
```javascript
// 获取设备模板列表
export const search_device_templates = () => {
    return axi({
        url: "/api/device/device_templates",
        method: "GET"
    })
}
```

### 3. 前端页面改进

**src/components/device_management/DevicesPage.vue:**

- 添加了 `deviceTemplates` 状态管理
- 新增 `fetchDeviceTemplates()` 方法获取模板数据
- 动态生成设备类型选择器
- 智能MAC地址生成（基于模板前缀）
- 移除硬编码的设备类型和MAC前缀

### 4. 插入的设备模板数据

| ID | 显示名称 | 英文名称 | MAC前缀 | 数据模板 |
|----|----------|----------|---------|----------|
| 1 | 温度传感器 | temperature | TP | 温度数据(°C) |
| 2 | 湿度传感器 | humidity | HM | 湿度数据(%RH) |
| 3 | 空气成分传感器 | air_component | AC | CO2/O2/PM2.5 |
| 4 | 土壤氮磷钾传感器 | soil_NPK | NPK | 氮磷钾含量 |
| 5 | PH值传感器 | soil_PH | PH | pH值数据 |
| 6 | 微量元素传感器 | soil_trace_elements | TE | 铁锌铜锰含量 |
| 7 | 风速传感器 | wind_speed | WS | 风速数据(m/s) |
| 8 | 风向传感器 | wind_direction | WD | 风向数据(°) |
| 9 | 光照强度传感器 | light_intensity | LI | 光照强度(lux) |

## 🚀 功能特点

### 1. **动态数据源**
- 设备类型选项从数据库实时获取
- 支持后台动态添加新的设备类型
- 无需前端代码修改即可扩展

### 2. **智能MAC生成**
- 根据选择的设备类型自动匹配MAC前缀
- 生成规则：`前缀-时间戳8位+随机数6位`
- 例如：`TP-1234567890123456`

### 3. **JSON数据模板**
- 每种设备类型都有对应的数据结构模板
- 包含单位、量程、精度等信息
- 便于后续数据验证和展示

### 4. **用户体验优化**
- 加载状态提示
- 错误处理和用户反馈
- 初始化时自动获取模板数据

## 📝 使用方式

1. **添加新设备类型**：
   ```sql
   INSERT INTO device_template (show_name, en_name, template, mac_pre) 
   VALUES ('新传感器', 'new_sensor', '{"data": "template"}', 'NS');
   ```

2. **前端自动适配**：
   - 重新加载页面或调用 `fetchDeviceTemplates()`
   - 新的设备类型会自动出现在下拉列表中

3. **MAC地址生成**：
   - 选择设备类型后点击"生成测试Mac"
   - 系统会自动使用对应的前缀生成唯一标识

## 🔧 后端接口要求

需要实现以下接口：
```
GET /api/device/search_device_templates
```

**响应格式：**
```json
{
  "data": {
    "state": 200,
    "data": [
      {
        "dtId": 1,
        "showName": "温度传感器",
        "enName": "temperature",
        "template": "{\"temperature\": {\"unit\": \"°C\"}}",
        "macPre": "TP"
      }
    ]
  }
}
```

## 🎯 优势

1. **可扩展性**：新增设备类型无需修改前端代码
2. **数据一致性**：统一的数据模板确保数据格式标准化
3. **维护性**：集中管理设备类型和模板
4. **用户友好**：智能化的MAC地址生成减少用户输入错误

## 📋 待完善

1. 后端接口实现 `/api/device/device_templates`
2. 设备模板的增删改查管理界面
3. 数据模板的验证逻辑
4. 国际化支持（多语言设备名称） 