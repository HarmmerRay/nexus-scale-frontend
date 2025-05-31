import { axi } from '@/util/http'

// 查询该用户所有的设备
export const all_devices =(user_id) =>{
    return axi({
        url: "/api/device/all_devices",
        method: "GET",
        params:{
            user_id:user_id,
        }
    })
}

// 添加设备
export const add_device =(deviceMac,deviceName) => {
    return axi({
        url: "/api/device/create_device",
        method: "POST",
        data:{
            deviceName:deviceName,
            deviceMac:deviceMac,
        }
    })
}
// 搜索设备
export const search_device =(searchKey) =>{
    return axi({
        url: "/api/device/search_device",
        method: "GET",
        params:{
            searchKey:searchKey,
        }
    })
}
// 普通用户搜索设备
export const search_devices_by_userId = (userId,searchKey) =>{
    return axi({
        url: "/api/device/search_devices_by_userid",
        method: "GET",
        params:{
            userId:userId,
            searchKey:searchKey
        }
    })
}

// 删除设备
export const delete_device =(deviceId) => {
    return axi({
        url: "/api/device/delete_device",
        method: "POST",
        params:{
            deviceId:deviceId,
        }
    })
}
// 批量删除设备
export const batch_delete_devices =(deviceIds) => {
    return axi({
        url: "/api/device/batch_delete_devices",
        method: "POST",
        data:deviceIds
    })
}
// 修改设备信息
export const update_device_name =(deviceId,deviceName) => {
    return axi({
        url: "/api/device/update_device_name",
        method: "POST",
        params:{
            deviceId:deviceId,
            deviceName:deviceName,
        }
    })
}

// 获取设备模板列表
export const search_device_templates = () => {
    return axi({
        url: "/api/device/search_device_templates",
        method: "GET"
    })
}