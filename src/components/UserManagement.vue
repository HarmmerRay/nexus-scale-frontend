<script setup>
import { computed, ref } from 'vue'
import {
  batchDeleteUser, create_user,
  deleteUser, upload_avatar,
  user_load_data
} from "@/api/user.js"
import {ElMessage} from "element-plus";

// 模拟用户数据结构
const userColumns = [
  { key: "avatarUrl", label: '头像'},
  { key: 'username', label: '用户名' },
  { key: 'phoneNumber', label: '电话'},
  { key: 'createTime', label: '创建时间' },
  { key: 'updateTime', label: '更新时间' },
  { key: 'level', label: '角色' },
]

// 用户数据列表
const userList = ref([
  {
    userId: 1,
    avatarUrl: "https://nexusscale.oss-cn-hangzhou.aliyuncs.com/avatar.jpg",
    userName: 'admin',
    phoneNumber: '16666666666',
    updateTime: new Date(),
    createTime: new Date(),
    level: '管理员',
  },
  {
    userId: 2,
    avatarUrl: "https://nexusscale.oss-cn-hangzhou.aliyuncs.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250318193530.jpg",
    userName: 'admin',
    phoneNumber: '18888888888',
    updateTime: new Date(),
    createTime: new Date(),
    level: '管理员',
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
  return Math.ceil(state.total / state.pageSize) + 1
})

// 加载用户数据
const loadUserData = async () => {
  const result = await user_load_data(state.currentPage, state.pageSize, state.searchKeyword)
  console.log(result)
  if (result.data.state === 200) {
    state.total = result.data.total
    userList.value = result.data.data
    // 遍历userList.value 判断每个元素中的level 如果是1则改为"普通用户",如果是0则改为"管理员"
    userList.value.forEach(item => {
      if (item.level === 1) {
        item.level = "普通用户";
      } else if (item.level === 0) {
        item.level = "管理员";
      }
    });
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
      userList.value[index].userId
  )
  batchDeleteUser(userIds).then(() => {
    loadUserData()
    resetSelection()
    ElMessage.success("批量删除成功")
  })
}

// 单个删除
const handleDelete = (index) => {
  const userId = userList.value[index].userId
  deleteUser(userId).then(() => {
    userList.value.splice(index, 1)
    ElMessage.success("删除成功")
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
// 默认头像 URL（可替换为实际路径）
const defaultAvatar = 'https://nexusscale.oss-cn-hangzhou.aliyuncs.com/avatar.jpg'

// 设置默认头像的方法
const setDefaultAvatar = (event) => {
  event.target.src = defaultAvatar
}

// 新增用户弹窗相关
const showAddDialog = ref(false)
const addForm = ref({
  userName: '',
  phoneNumber: '',
  level: '0', // 0=管理员，1=普通用户
  avatarUrl: ''
})

// 表单验证规则
const validateForm = () => {
  if (!addForm.value.userName.trim()) {
    ElMessage.warning('请输入用户名')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(addForm.value.phoneNumber)) {
    ElMessage.warning('请输入正确的11位电话号码')
    return false
  }
  return true
}

// 处理添加用户
const handleAddUser = () => {
  showAddDialog.value = true
  // 重置表单
  addForm.value = {
    userName: '',
    phoneNumber: '',
    level: '0',
    avatarUrl: ''
  }
}

const handleSubmitAddForm = async () => {
  if (!validateForm()) return

  try {
    const response = await create_user(
      addForm.value.userName,
      addForm.value.phoneNumber,
      addForm.value.level,
      addForm.value.avatarUrl || defaultAvatar // 默认为预设头像
    )

    if (response.data.state === 200) {
      ElMessage.success('用户添加成功')
      showAddDialog.value = false
      previewAvatar.value = ''
      await loadUserData() // 刷新用户列表
    } else {
      ElMessage.error(`添加失败：${response.data.msg}`)
    }
  } catch (error) {
    ElMessage.error('网络请求失败，请重试')
    console.error('添加用户错误：', error)
  }
}

const previewAvatar = ref("")

const avatarUrl = ref("")
const handleFileChange = (event) => {  // 上传一个头像返回头像url地址。  再创建这个用户。
  const file = event.target.files[0];
  if (!file) return; // 如果没有选择文件则返回
  const formData = new FormData();
  formData.append('image', file);
  // 在这里可以调用API将图片上传到服务器
  upload_avatar(formData).then((res) => {
    avatarUrl.value = res.data.data;
    previewAvatar.value = res.data.data;
    console.log(previewAvatar.value)
  })
  // };
  // reader.readAsDataURL(file); // 以DataURL格式读取文件
}
const clearPreview = () => {
  previewAvatar.value = ''
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
      <!-- 新增用户弹窗 -->

      <div v-if="showAddDialog" class="add-user-dialog">
<!--        <div class="dialog-mask" @click="showAddDialog = false"></div>-->
        <div class="dialog-content">
          <div class="dialog-header">
            <h3>新增用户</h3>
            <button class="close-btn" @click="showAddDialog = false">×</button>
          </div>

          <form class="add-form" @submit.prevent="handleSubmitAddForm">
            <!-- 用户名 -->
            <div class="form-item">
              <label>用户名：</label>
              <input
                  v-model="addForm.userName"
                  type="text"
                  placeholder="请输入用户名（3-12位）"
                  required
                  minlength="3"
                  maxlength="12"
              />
            </div>

            <!-- 电话号码 -->
            <div class="form-item">
              <label>电话号码：</label>
              <input
                  v-model="addForm.phoneNumber"
                  type="tel"
                  placeholder="请输入11位手机号码"
                  pattern="[1][3-9]\d{9}"
                  required
              />
            </div>

            <!-- 权限选择 -->
            <div class="form-item">
              <label>用户权限：</label>
              <select v-model="addForm.level" required>
                <option value="0">管理员</option>
                <option value="1">普通用户</option>
              </select>
            </div>

            <!-- 头像设置 -->
            <div class="form-item">
              <label>头像文件：</label>
              <!-- 隐藏的文件输入框 -->
              <input
                  type="file"
                  accept="image/*"
                  style="display: none;"
                  ref="fileInput"
                  @change="handleFileChange"
              />
              <!-- 自定义文件选择按钮 -->
              <button type="button" class="file-choose-btn" @click="$refs.fileInput.click()">
                选择本地图片
              </button>
              <!-- 头像预览区域 -->
              <div class="avatar-preview" v-if="previewAvatar">
                <img :src="previewAvatar" alt="头像预览" @error="setDefaultAvatar" />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-btn">提交</button>
              <button type="button" class="cancel-btn" @click="showAddDialog = false">取消</button>
            </div>
          </form>
        </div>
      </div>
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
        <tr v-for="(user, index) in userList" :key="user.userId">
          <td>
            <input
                type="checkbox"
                v-model="selectedUsers"
                :value="index"
                @change="toggleSingleSelection"
            />
          </td>
          <td class="avatar-cell">
            <!-- 使用 img 标签展示头像 -->
            <img
                :src="user.avatarUrl"
                alt="用户头像"
                class="avatar-image"
                @error="setDefaultAvatar"
            />
          </td>
          <td>{{ user.userName }}</td>
          <td>{{ user.phoneNumber }}</td>
          <td>{{ format_time(user.updateTime) }}</td>
          <td>{{ format_time(user.createTime) }}</td>
          <td>{{ user.level }}</td>
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
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 15px;
  .page-jump {
    display: flex;
    align-items: center;
    gap: 5px;

    .page-input {
      width: 60px;
      padding: 4px 8px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      text-align: center;

      &:focus {
        outline: none;
        border-color: #409eff;
      }
    }
  }
}

.page-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #4a90e2;
  background-color: #4a90e2;
  color: white;
  cursor: pointer;
}

.page-btn[disabled] {
  background-color: #ccc;
  border-color: #ccc;
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

/* 父容器控制单元格内布局 */
.avatar-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 圆形头像样式 */
.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 关键：圆形效果 */
  object-fit: cover; /* 保持图片比例 */
  border: 2px solid #ddd; /* 可选：边框 */
  transition: transform 0.3s ease; /* 可选：悬停动画 */
}

/* 悬停放大效果（可选） */
.avatar-image:hover {
  transform: scale(1.2);
}

/* 新增用户弹窗样式 */
.add-user-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dialog-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 500;
  color: #333;
}

input, select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

select {
  width: 100%;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=utf-8,<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}



.form-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 8px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #ffffff;
  color: #333;
  padding: 8px 24px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
}

.file-choose-btn {
  margin-left: 10px;
  padding: 4px 12px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}
.avatar-preview {
  margin-left: 40%;
  position: relative;
  width: 78px; /* 原 60px * 1.3 = 78px */
  height: 78px; /* 原 60px * 1.3 = 78px */
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  background: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 图片自适应填充容器 */
.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

</style>