<template>
  <div class="application-list">
    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        新增应用
      </el-button>
    </div>

    <el-table :data="appList" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="应用名称" width="180" />
      <el-table-column label="所属组织" width="150">
        <template #default="{ row }">
          {{ getOrgName(row.organizationId) }}
        </template>
      </el-table-column>
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'primary' : 'success'">
            {{ row.type === 1 ? 'Web应用' : '移动应用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑应用' : '新增应用'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="所属组织" prop="organizationId">
          <el-tree-select
            v-model="form.organizationId"
            :data="orgTree"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择所属组织"
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="应用类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择应用类型" style="width: 100%">
            <el-option label="Web应用" :value="1" />
            <el-option label="移动应用" :value="2" />
          </el-select>
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
import { applicationApi } from '../../api/application'
import { orgApi } from '../../api/organization'

const loading = ref(false)
const appList = ref([])
const orgList = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const form = reactive({
  id: null,
  name: '',
  organizationId: null,
  type: 1,
  description: '',
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }],
  organizationId: [{ required: true, message: '请选择所属组织', trigger: 'change' }],
  type: [{ required: true, message: '请选择应用类型', trigger: 'change' }]
}

const orgTree = computed(() => buildTree(orgList.value, 0))

const buildTree = (list, parentId) => {
  return list
    .filter(item => item.parentId === parentId || (!item.parentId && parentId === 0))
    .map(item => ({
      ...item,
      children: buildTree(list, item.id)
    }))
}

const getOrgName = (orgId) => {
  const org = orgList.value.find(o => o.id === orgId)
  return org ? org.name : '-'
}

const loadData = async () => {
  loading.value = true
  try {
    const [appRes, orgRes] = await Promise.all([
      applicationApi.getList(),
      orgApi.getList()
    ])
    appList.value = appRes.data || []
    orgList.value = orgRes.data || []
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
    organizationId: null,
    type: 1,
    description: '',
    status: 1
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
    organizationId: row.organizationId,
    type: row.type,
    description: row.description,
    status: row.status
  })
  isEdit.value = true
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (isEdit.value) {
      await applicationApi.update(form)
    } else {
      await applicationApi.save(form)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error('Save failed:', e)
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该应用吗？', '提示', { type: 'warning' })
  try {
    await applicationApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    console.error('Delete failed:', e)
  }
}

const handleStatusChange = async (row) => {
  try {
    await applicationApi.updateStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (e) {
    console.error('Status change failed:', e)
    row.status = row.status === 1 ? 0 : 1
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
