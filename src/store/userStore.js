import {defineStore} from 'pinia'
export const useUserStore = defineStore('user', {  // 选项式API 比 组合式API灵活
    state: () => ({
        user: null
    }),
    actions: {
        setUser(userData) {
            // console.log(userData)
            this.user = userData;
            // console.log(this.user);
        },
        clearUser() {
            this.user = null;
        }
    },
    getters: {
        getUser: (state) => state.user
    },
    persist: true,  // 默认本地永久存储
});

// 组合式API
// import { defineStore } from 'pinia';
// import { ref } from 'vue';
//
// export const useUserStore = defineStore('user', () => {
//     const user = ref(null);
//
//     const setUser = (userData) => {
//         user.value = userData;
//     };
//
//     const clearUser = () => {
//         user.value = null;
//     };
//
//     const getUser = () => user.value;
//
//     return {
//         user,
//         setUser,
//         clearUser,
//         getUser
//     };
// });