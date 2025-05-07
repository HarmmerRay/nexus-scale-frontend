// 检查用户是否已登录的函数


import {verify_token} from "@/api/user.js";

export function check_auth() {
  // 获取 token 和 user-id
  // const token = get_cookie('token')
  // console.log(token)
  return verify_token().then((res) => {
    return res.data.code === '200';
  })
}

// 获取 token 和 user-id 的值
export function get_cookie(name) {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}
