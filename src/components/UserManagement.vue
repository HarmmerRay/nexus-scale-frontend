<script setup>
import { computed, ref } from 'vue'
import {
  batchDeleteUser,
  deleteUser,
  user_load_data
} from "@/api/user.js"

// 模拟用户数据结构
const userColumns = [
  { key: 'username', label: '用户名' },
  { key: 'email', label: '邮箱' },
  { key: 'role', label: '角色' },
  { key: 'createTime', label: '创建时间' },
  { key: 'status', label: '状态' }
]

// 用户数据列表
const userList = ref([
  {
    username: 'admin',
    email: 'admin@example.com',
    role: '管理员',
    createTime: new Date(),
    status: '启用'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    role: '普通用户',
    createTime: new Date(),
    status: '启用'
  }
])

// 分页相关变量
const state = {
  currentPage: 1,
  pageSize: 10,
  total: 0,
  searchKeyword: ''
}

// 总页数
const totalPages = computed(() => {
  return Math.ceil(state.total / state.pageSize)
})

// 加载用户数据
const loadUserData = async () => {
  const result = await user_load_data(state.currentPage, state.pageSize, state.searchKeyword)
  if (result.data.state === 200) {
    state.total = result.data.total
    userList.value = result.data.data
  }
}

// 页面初始化加载数据
loadUserData()
let jumpPage = 0;
// 分页操作
const goToPage = () => {
  if (jumpPage >= 1 && jumpPage <= totalPages.value) {
    state.currentPage = jumpPage
    jumpPage = 1
    loadUserData()
  }
}

const prevPage = () => {
  if (state.currentPage > 1) {
    state.currentPage--
    resetSelection()
    loadUserData()
  }
}

const nextPage = () => {
  if (state.currentPage < totalPages.value) {
    state.currentPage++
    resetSelection()
    loadUserData()
  }
}

// 全选相关
const isAllSelected = ref(false)
const selectedUsers = ref([])

const toggleAllSelection = () => {
  isAllSelected.value
      ? selectedUsers.value = userList.value.map((_, index) => index)
      : selectedUsers.value = []
}

const toggleSingleSelection = () => {
  isAllSelected.value = selectedUsers.value.length === userList.value.length
}

const resetSelection = () => {
  isAllSelected.value = false
  selectedUsers.value = []
}

// 批量删除
const handleBatchDelete = () => {
  const userIds = selectedUsers.value.map(index =>
      userList.value[index].id
  )
  batchDeleteUser(userIds).then(() => {
    loadUserData()
    resetSelection()
  })
}

// 单个删除
const handleDelete = (index) => {
  const userId = userList.value[index].id
  deleteUser(userId).then(() => {
    userList.value.splice(index, 1)
  })
}

// 搜索操作
const handleSearchUser = () => {
  loadUserData()
}

// 输入页码过滤
const handleInput = (e) => {
  e.target.value = e.target.value.replace(/[^\d]/g, '')
  jumpPage = parseInt(e.target.value) || 1
}

// 时间格式化
const format_time = (timestamp) => {
  const date = new Date(timestamp)
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  return new Intl.DateTimeFormat('zh-CN', options).format(date).replace(/\//g, '-')
}
</script>

<template>
  <div class="user-management">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="search-group">
        <input
            type="text"
            v-model="state.searchKeyword"
            placeholder="搜索用户..."
            class="search-input"
            @keyup.enter="handleSearchUser"
        />
      </div>
      <button class="search-btn" @click="handleSearchUser">搜索</button>
      <button class="batch-delete-btn" @click="handleBatchDelete">批量删除</button>
      <button class="add-btn" @click="handleAddUser">添加用户</button>
    </div>

    <!-- 用户表格 -->
    <div class="table-container">
      <table class="user-table">
        <thead>
        <tr>
          <th>
            <input
                type="checkbox"
                v-model="isAllSelected"
                @change="toggleAllSelection"
            />
          </th>
          <th v-for="column in userColumns" :key="column.key">
            {{ column.label }}
          </th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(user, index) in userList" :key="user.id">
          <td>
            <input
                type="checkbox"
                v-model="selectedUsers"
                :value="index"
                @change="toggleSingleSelection"
            />
          </td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>{{ format_time(user.createTime) }}</td>
          <td>{{ user.status }}</td>
          <td>
            <button class="delete-btn" @click="handleDelete(index)">删除</button>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- 分页控件 -->
      <div class="pagination">
        <button
            class="page-btn"
            @click="prevPage"
            :disabled="state.currentPage === 1"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ state.currentPage }} 页 / 共 {{ totalPages }} 页
        </span>

        <div class="page-jump">
          <input
              type="number"
              v-model="jumpPage"
              class="page-input"
              placeholder="请输入页码"
              @keyup.enter="goToPage"
              @input="handleInput"
          >
        </div>

        <button
            class="page-btn"
            @click="nextPage"
            :disabled="state.currentPage === totalPages"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-management {
  padding: 20px;
}

.nav-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-grow: 0;
}

.search-input {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  width: 200px;
}

.search-btn {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.batch-delete-btn {
  padding: 6px 12px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn {
  padding: 6px 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  padding: 4px 8px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th, .user-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}

.user-table th {
  background-color: #f5f5f5;
}

.pagination {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}

.page-btn:disabled {
  background: #eee;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-input {
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>