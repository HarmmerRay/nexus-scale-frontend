import { axi } from '@/util/http'

export const get_code =(phone_number) =>{
    return axi({
        url: "/api/user/get_code",
        method: "GET",
        params:{
            phone_number: phone_number
        }
    })
}

export const login_register = (phone_number,code) => {
    return axi({
        url: "/api/user/register",
        method: "POST",
        params:{
            phone_number: phone_number,
            code: code
        }
    })
}

export const verify_token = () => {
    return axi({
        url: "/api/user/verify_token",
        method: "POST",
    })
}
