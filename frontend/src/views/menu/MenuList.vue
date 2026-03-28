<template>
  <div class="menu-list">
    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog(null)">
        <el-icon><Plus /></el-icon>
        新增菜单
      </el-button>
    </div>

    <el-table :data="menuList" border stripe v-loading="loading" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="菜单名称" width="150" />
      <el-table-column prop="code" label="菜单编码" width="150" />
      <el-table-column prop="path" label="路径" width="180" />
      <el-table-column prop="icon" label="图标" width="100" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.menuType === 1 ? 'success' : 'info'">
            {{ row.menuType === 1 ? '菜单' : '按钮' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="220">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showAddDialog(row)">添加子菜单</el-button>
          <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜单' : '新增菜单'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入菜单编码" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路径" />
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTree"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择上级菜单"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="类型" prop="menuType">
          <el-select v-model="form.menuType" placeholder="请选择类型" style="width: 100%">
            <el-option label="菜单" :value="1" />
            <el-option label="按钮" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
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
import { menuApi } from '../../api/menu'

const loading = ref(false)
const menuList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: null,
  name: '',
  code: '',
  path: '',
  parentId: null,
  icon: '',
  sort: 0,
  menuType: 1,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入菜单编码', trigger: 'blur' }]
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

const loadData = async () => {
  loading.value = true
  try {
    const res = await menuApi.getList()
    menuList.value = res.data || []
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
    path: '',
    parentId: null,
    icon: '',
    sort: 0,
    menuType: 1,
    status: 1
  })
}

const showAddDialog = (parent) => {
  resetForm()
  if (parent) {
    form.parentId = parent.id
  }
  isEdit.value = false
  dialogVisible.value = true
}

const showEditDialog = (row) => {
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    path: row.path,
    parentId: row.parentId,
    icon: row.icon,
    sort: row.sort,
    menuType: row.menuType,
    status: row.status
  })
  isEdit.value = true
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await menuApi.save(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error('Save failed:', e)
  }
}

const handleDelete = async (row) => {
  const hasChildren = menuList.value.some(item => item.parentId === row.id)
  if (hasChildren) {
    ElMessage.warning('该菜单下存在子菜单，无法删除')
    return
  }
  await ElMessageBox.confirm('确定要删除该菜单吗？', '提示', { type: 'warning' })
  try {
    await menuApi.delete(row.id)
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
