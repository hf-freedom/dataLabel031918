<template>
  <div class="api-permission-list">
    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        新增API权限
      </el-button>
    </div>

    <el-table :data="apiList" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="API名称" width="150" />
      <el-table-column prop="code" label="API编码" width="180" />
      <el-table-column prop="url" label="URL" width="200" />
      <el-table-column prop="method" label="请求方法" width="100">
        <template #default="{ row }">
          <el-tag :type="getMethodType(row.method)">
            {{ row.method }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="所属菜单" width="150">
        <template #default="{ row }">
          {{ getMenuName(row.menuId) }}
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" fixed="right" width="150">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑API权限' : '新增API权限'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="API名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入API名称" />
        </el-form-item>
        <el-form-item label="API编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入API编码" />
        </el-form-item>
        <el-form-item label="URL" prop="url">
          <el-input v-model="form.url" placeholder="请输入URL" />
        </el-form-item>
        <el-form-item label="请求方法" prop="method">
          <el-select v-model="form.method" placeholder="请选择请求方法" style="width: 100%">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属菜单" prop="menuId">
          <el-tree-select
            v-model="form.menuId"
            :data="menuTree"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择所属菜单"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiPermissionApi } from '../../api/apiPermission'
import { menuApi } from '../../api/menu'

const loading = ref(false)
const apiList = ref([])
const menuList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: null,
  name: '',
  code: '',
  url: '',
  method: 'GET',
  menuId: null,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入API名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入API编码', trigger: 'blur' }],
  url: [{ required: true, message: '请输入URL', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }]
}

const menuTree = computed(() => buildTree(menuList.value, 0))

const buildTree = (list, parentId) => {
  return list
    .filter(item => item.parentId === parentId || (!item.parentId && parentId === 0))
    .map(item => ({
      ...item,
      children: buildTree(list, item.id)
    }))
}

const getMethodType = (method) => {
  const types = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger'
  }
  return types[method] || 'info'
}

const getMenuName = (menuId) => {
  const menu = menuList.value.find(m => m.id === menuId)
  return menu ? menu.name : '-'
}

const loadData = async () => {
  loading.value = true
  try {
    const [apiRes, menuRes] = await Promise.all([
      apiPermissionApi.getList(),
      menuApi.getList()
    ])
    apiList.value = apiRes.data || []
    menuList.value = menuRes.data || []
  } catch (e) {
    console.error('Failed to load data:', e)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    code: '',
    url: '',
    method: 'GET',
    menuId: null,
    description: ''
  })
}

const showAddDialog = () => {
  resetForm()
  isEdit.value = false
  dialogVisible.value = true
}

const showEditDialog = (row) => {
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    url: row.url,
    method: row.method,
    menuId: row.menuId,
    description: row.description
  })
  isEdit.value = true
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await apiPermissionApi.save(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error('Save failed:', e)
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该API权限吗？', '提示', { type: 'warning' })
  try {
    await apiPermissionApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    console.error('Delete failed:', e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.toolbar {
  margin-bottom: 15px;
}
</style>
