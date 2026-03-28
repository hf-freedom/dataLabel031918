<template>
  <div class="org-list">
    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog(null)">
        <el-icon><Plus /></el-icon>
        新增机构
      </el-button>
    </div>

    <el-table :data="orgList" border stripe v-loading="loading" row-key="id">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="机构名称" width="180" />
      <el-table-column prop="code" label="机构编码" width="150" />
      <el-table-column prop="level" label="层级" width="80" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showAddDialog(row)">添加子机构</el-button>
          <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑机构' : '新增机构'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="机构名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入机构名称" />
        </el-form-item>
        <el-form-item label="机构编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入机构编码" />
        </el-form-item>
        <el-form-item label="上级机构" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="orgTree"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择上级机构"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-input-number v-model="form.level" :min="1" :max="10" />
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
import { orgApi } from '../../api/organization'

const loading = ref(false)
const orgList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: null,
  name: '',
  code: '',
  parentId: null,
  level: 1,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入机构编码', trigger: 'blur' }]
}

const editingId = ref(null)

const getDescendantIds = (orgId) => {
  const ids = [orgId]
  const children = orgList.value.filter(item => item.parentId === orgId)
  children.forEach(child => {
    ids.push(...getDescendantIds(child.id))
  })
  return ids
}

const orgTree = computed(() => {
  const excludeIds = isEdit.value && editingId.value ? getDescendantIds(editingId.value) : []
  return buildTree(orgList.value, 0, excludeIds)
})

const buildTree = (list, parentId, excludeIds = []) => {
  return list
    .filter(item => !excludeIds.includes(item.id))
    .filter(item => item.parentId === parentId || (!item.parentId && parentId === 0))
    .map(item => ({
      ...item,
      children: buildTree(list, item.id, excludeIds)
    }))
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await orgApi.getList()
    orgList.value = res.data || []
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
    parentId: null,
    level: 1,
    description: ''
  })
}

const showAddDialog = (parent) => {
  resetForm()
  if (parent) {
    form.parentId = parent.id
    form.level = (parent.level || 0) + 1
  }
  isEdit.value = false
  dialogVisible.value = true
}

const showEditDialog = (row) => {
  editingId.value = row.id
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    parentId: row.parentId,
    level: row.level,
    description: row.description
  })
  isEdit.value = true
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await orgApi.save(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error('Save failed:', e)
  }
}

const handleDelete = async (row) => {
  const hasChildren = orgList.value.some(item => item.parentId === row.id)
  if (hasChildren) {
    ElMessage.warning('该机构下存在子机构，无法删除')
    return
  }
  await ElMessageBox.confirm('确定要删除该机构吗？', '提示', { type: 'warning' })
  try {
    await orgApi.delete(row.id)
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
