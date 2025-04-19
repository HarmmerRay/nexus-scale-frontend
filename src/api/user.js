import { axi } from '@/util/http'

export const get_code =(phone_number) =>{
    return axi({
        url: "/api/user/get_code",
        method: "GET",
        data:{
            phone_number: phone_number
        }
    })
}