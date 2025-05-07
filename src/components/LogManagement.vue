<template>
  <div class="log-management">
    <!-- 顶部导航栏 -->
    <div class="nav-bar">
      <div class="search-group">
        <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索日志..."
            class="search-input"
        />
      </div>
      <button class="search-btn" @click="handleSearchLog">搜索</button>
      <button class="batch-delete-btn" @click="handleBatchDelete">批量删除</button>
      <!--      <button class="add-btn" @click="handleAddLog">添加日志</button>-->
    </div>

    <!-- 日志表格 -->
    <div class="table-container">
      <table class="log-table">
        <thead>
        <tr>
          <th>
            <input
                type="checkbox"
                v-model="isAllSelected"
                @change="toggleAllSelection"
            />
          </th>
          <th>时间</th>
          <th>请求路径</th>
          <th>请求参数</th>
          <th>用户ID</th>
          <th>客户端IP</th>
          <th>请求方法</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(log, index) in logList" :key="index">
          <td>
            <input
                type="checkbox"
                v-model="selectedLogs"
                :value="index"
                @change="toggleSingleSelection"
            />
          </td>
          <td>{{ log.operation_time}}</td>
          <td>{{ log.path }}</td>
          <td>{{ JSON.stringify(log.params) }}</td>
          <td>{{ log.userId }}</td>
          <td>{{ log.ip }}</td>
          <td>{{ log.method }}</td>
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
              @input="handleInput">  <!-- 输入过滤 -->

          <button
              class="page-btn"
              @click="goToPage"
              :disabled="!jumpPage || jumpPage < 1 || jumpPage > totalPages"
          >
            跳转
          </button>
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

<script setup>
import { ref, computed } from 'vue';
import {log_load_data} from "@/api/log.js";

// 模拟日志数据（实际开发中可通过 props 接收或 API 获取）
const logList = ref([
  {
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  },
  {
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  },
  {
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  },
  {
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  }
  ,{
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  },
  {
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  },
  {
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  },
  {
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  },
  {
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  }
  ,{
    operation_time: new Date(),
    path: '/api/user/list',
    params: { page: 1, size: 10 },
    userId: '1001',
    ip: '192.168.1.100',
    method: 'GET'
  }
]);
// 分页相关变量
const state = {
  currentPage: 1,
  pageSize: 10, // 一页数据个数
  total: 10, // 数据总条数
  searchKeyword: ''
}
// 总页数
let totalPages = computed(() => {
  return Math.ceil(state.total / state.pageSize);
});

const update_data_list = async (data) => {
  logList.value = data;
}
const update_pagination = async () => {
  totalPages = computed(() => {
    return Math.ceil(state.total / state.pageSize);
  });
}
log_load_data(state.currentPage,state.pageSize,state.searchKeyword).then((result) => {
  if (result.data.state === 200){
    state.total = result.data.total;
    console.log(result.data.data);
    update_data_list(result.data.data)
    update_pagination()
  }

})
let jumpPage = 1;
// 分页操作
const goToPage = () => {
  console.log("跳转页面");
  const targetPage = parseInt(jumpPage);
  console.log('targetPage',targetPage)
  console.log('totalPages',totalPages.value)
  if (targetPage && targetPage >= 1 && targetPage <= totalPages.value) {
    state.currentPage = targetPage; // 更新当前页状态
    console.log(state.currentPage);
    jumpPage = ''; // 清空输入框
    // 可选：触发数据加载逻辑
    log_load_data(state.currentPage,state.pageSize,state.searchKeyword).then((result) => {
      if (result.data.state === 200){
        state.total = result.data.total;
        console.log(result.data.data);
        update_data_list(result.data.data)
        update_pagination()
      }
    })
  }
}
const handleInput = (e) => {
  e.target.value = e.target.value.replace(/[^\d]/g, ''); // 过滤非数字字符
  jumpPage = e.target.value || ''; // 更新绑定值
}
function prevPage() {
  if (state.currentPage > 1) {
    state.currentPage--;
    resetSelection();
    log_load_data(state.currentPage,state.pageSize,state.searchKeyword).then((result) => {
      if (result.data.state === 200){
        state.total = result.data.total;
        console.log(result.data.data);
        update_data_list(result.data.data)
        update_pagination()
      }
    })
  }
}

function nextPage() {
  if (state.currentPage < totalPages.value) {
    state.currentPage++;
    resetSelection();
    log_load_data(state.currentPage,state.pageSize,state.searchKeyword).then((result) => {
      if (result.data.state === 200){
        state.total = result.data.total;
        console.log(result.data.data);
        update_data_list(result.data.data)
        update_pagination()
      }
    })
  }
}

// 全选相关变量
const isAllSelected = ref(false);
const selectedLogs = ref([]);
// 全选/取消全选
function toggleAllSelection() {
  if (isAllSelected.value) {
    selectedLogs.value = logList.value.map((_, index) => index);
  } else {
    selectedLogs.value = [];
  }
}

// 单个复选框变化时更新全选状态
function toggleSingleSelection() {
  isAllSelected.value = selectedLogs.value.length === logList.value.length;
}



// 重置选中状态
function resetSelection() {
  isAllSelected.value = false;
  selectedLogs.value = [];
}

// 批量删除
function handleBatchDelete() {
  const indicesToDelete = selectedLogs.value.map(index =>
      (state.currentPage - 1) * state.pageSize + index
  ).sort((a, b) => b - a);

  indicesToDelete.forEach(index => {
    logList.value.splice(index, 1);
  });

  selectedLogs.value = [];
  isAllSelected.value = false;
}

// 单个删除
function handleDelete(index) {
  const realIndex = (state.currentPage - 1) * state.pageSize + index;
  logList.value.splice(realIndex, 1);
}

const handleSearchLog = () => {
  // 搜索逻辑待实现
}

</script>

<style scoped>
.log-management {
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
  flex-grow: 0; /* 不自动扩展，保持搜索框固定宽度 */
}

.search-input {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  width: 200px;
}

.batch-delete-btn,
.add-btn,
.delete-btn,
.search-btn,
.page-btn {
  padding: 6px 12px;
  border: 1px solid #4a90e2;
  border-radius: 4px;
  background-color: #4a90e2;
  color: white;
  cursor: pointer;
}

.search-btn {
  border: 1px solid #4a90e2;
  background-color: #4a90e2;
}

.batch-delete-btn {
  border: 1px solid #f44336;
  background-color: #f44336;
}

.add-btn {
  background-color: #50c878;
  border-color: #50c878;
}

.delete-btn {
  background-color: #f44336;
  border-color: #f44336;
  padding: 4px 8px;
  font-size: 0.9em;
}

.page-btn[disabled] {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
}

.log-table th,
.log-table td {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  text-align: left;
}

.log-table th {
  background-color: #f5f5f5;
  font-weight: 500;
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

.page-info {
  font-weight: 500;
}
</style>