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

export const deleteLog = (dateTime) => {
    return axi({
        url: "/api/log/deleteLog",
        method: "POST",
        params:{ 
            dateTime: dateTime
        }
    })
}

export const batchDeleteLog = (start_time,end_time) => {
    return axi({
        url: "/api/log/batchDeleteLog",
        method: "POST",
        params:{
            startTime: start_time,
            endTime: end_time
        }
    })
}