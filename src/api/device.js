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
