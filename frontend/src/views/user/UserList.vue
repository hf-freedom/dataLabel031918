<template>
  <div class="user-list">
    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </div>

    <el-table :data="userList" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="realName" label="姓名" width="120" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.userType === 1 ? 'danger' : 'info'">
            {{ row.userType === 1 ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="角色" width="120">
        <template #default="{ row }">
          {{ getRoleName(row.roleId) }}
        </template>
      </el-table-column>
      <el-table-column label="组织机构" width="150">
        <template #default="{ row }">
          {{ getOrgName(row.organizationId) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-button type="warning" size="small" @click="showBindRoleDialog(row)">绑定角色</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="类型" prop="userType">
          <el-select v-model="form.userType" placeholder="请选择类型" style="width: 100%">
            <el-option label="普通用户" :value="0" />
            <el-option label="管理员" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="组织机构" prop="organizationId">
          <el-tree-select
            v-model="form.organizationId"
            :data="orgTree"
            :props="{ label: 'name', value: 'id' }"
            placeholder="请选择组织机构"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="bindRoleVisible" title="绑定角色" width="400px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          <el-input :value="currentUser?.realName || currentUser?.username" disabled />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="selectedRoleId" placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindRoleVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBindRole">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '../../api/user'
import { roleApi } from '../../api/role'
import { orgApi } from '../../api/organization'

const loading = ref(false)
const userList = ref([])
const roleList = ref([])
const orgList = ref([])
const dialogVisible = ref(false)
const bindRoleVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const currentUser = ref(null)
const selectedRoleId = ref(null)

const form = reactive({
  id: null,
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  userType: 0,
  organizationId: null
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  userType: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const orgTree = computed(() => {
  return buildTree(orgList.value, 0)
})

const buildTree = (list, parentId) => {
  return list
    .filter(item => item.parentId === parentId || (!item.parentId && parentId === 0))
    .map(item => ({
      ...item,
      children: buildTree(list, item.id)
    }))
}

const getRoleName = (roleId) => {
  const role = roleList.value.find(r => r.id === roleId)
  return role ? role.name : '-'
}

const getOrgName = (orgId) => {
  const org = orgList.value.find(o => o.id === orgId)
  return org ? org.name : '-'
}

const loadData = async () => {
  loading.value = true
  try {
    const [userRes, roleRes, orgRes] = await Promise.all([
      userApi.getList(),
      roleApi.getList(),
      orgApi.getList()
    ])
    userList.value = userRes.data || []
    roleList.value = roleRes.data || []
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
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    userType: 0,
    organizationId: null
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
    username: row.username,
    password: '',
    realName: row.realName,
    email: row.email,
    phone: row.phone,
    userType: row.userType,
    organizationId: row.organizationId
  })
  isEdit.value = true
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    if (isEdit.value) {
      await userApi.update(form)
    } else {
      await userApi.save(form)
    }
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error('Save failed:', e)
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该用户吗？', '提示', { type: 'warning' })
  try {
    await userApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    console.error('Delete failed:', e)
  }
}

const showBindRoleDialog = (row) => {
  currentUser.value = row
  selectedRoleId.value = row.roleId
  bindRoleVisible.value = true
}

const handleBindRole = async () => {
  try {
    await userApi.bindRole(currentUser.value.id, selectedRoleId.value)
    ElMessage.success('绑定成功')
    bindRoleVisible.value = false
    loadData()
  } catch (e) {
    console.error('Bind role failed:', e)
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
