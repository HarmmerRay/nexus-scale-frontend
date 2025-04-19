import axios from 'axios'  // npm install axios

export const axi = axios.create({
    timeout:600000, // 毫秒
    headers: {'X-Custom-Header': 'foobar'}
})