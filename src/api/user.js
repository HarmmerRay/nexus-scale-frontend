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

export const user_load_data = (currentPage,pageSize,searchKeyWord) => {
    return axi({
        url: "/api/user/search_users",
        method: "GET",
        params:{
            currentPage: currentPage,
            pageSize: pageSize,
            keyword: searchKeyWord
        }
    })
}
export const upload_avatar = (formData) => {
    return axi({
        url: '/api/user/upload_avatar',
        method: 'POST',
        data: formData
    })
}

export const create_user = (user_name,phone_number,level,avatarUrl) => {
    return axi({
        url: "/api/user/create_user",
        method: "POST",
        params:{
            phoneNumber: phone_number,
            level: level,
            userName: user_name,
            avatarUrl: avatarUrl
        }
    })
}
export const deleteUser = (id) => {
    return axi({
        url: "/api/user/delete_user",
        method: "POST",
        params:{
            userId: id
        }
    })
}

export const batchDeleteUser = (ids) => {
    return axi({
        url: "/api/user/batch_delete_users",
        method: "POST",
        data:ids
    })
}

export const change_user_name = (id,username) => {
    return axi({
        url: "/api/user/change_user_name",
        method: "POST",
        params:{
            userId:id,
            userName:username
        }
    })
}

export const change_user_level = (id,level) => {
    return axi({
        url: "/api/user/change_user_level",
        method: "POST",
        params:{
            level:level,
            userId:id,
        }
    })
}

export const change_avatar = (id,avatarUrl) => {
    return axi({
        url: "/api/user/change_avatar",
        method: "POST",
        params:{
            avatarUrl:avatarUrl,
            userId:id,
        }
    })
}

export const change_phone_number = (id,phone_number) => {
    return axi({
        url: "/api/user/change_phone",
        method: "POST",
        params:{
            phoneNumber:phone_number,
            userId:id,
        }
    })
}

export const search_users = (keyword) => {
    return axi({
        url: "/api/user/search_users",
        method: "POST",
        params:{
            keyword:keyword
        }
    })
}

export const customer_service = (user_id,message) => {
    return axi({
        url: "/api/user/customer_service",
        method: "POST",
        params:{
            userId:user_id,
            message:message
        }
    })
}