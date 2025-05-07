import { axi } from '@/util/http'

export const log_load_data =(currentPage,pageSize,searchKeyWord ) =>{
    return axi({
        url: "/api/log/load_data",
        method: "GET",
        params:{
            currentPage: currentPage,
            pageSize: pageSize,
            searchKeyWord: searchKeyWord
        }
    })
}