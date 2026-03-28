<template>
  <div class="role-list">
    <div class="toolbar">
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        新增角色
      </el-button>
    </div>

    <el-table :data="roleList" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="角色名称" width="150" />
      <el-table-column prop="code" label="角色编码" width="150" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" fixed="right" width="350">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="showEditDialog(row)">编辑</el-button>
          <el-button type="success" size="small" @click="showMenuDialog(row)">菜单权限</el-button>
          <el-button type="warning" size="small" @click="showApiDialog(row)">API权限</el-button>
          <el-button type="info" size="small" @click="showOrgDialog(row)">数据权限</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色编码" />
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

    <el-dialog v-model="menuDialogVisible" title="菜单权限配置" width="500px">
      <el-tree
        ref="menuTreeRef"
        :data="menuTree"
        :props="{ label: 'name', children: 'children' }"
        show-checkbox
        node-key="id"
        default-expand-all
        class="tree-container"
      />
      <template #footer>
        <el-button @click="menuDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveMenus">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="apiDialogVisible" title="API权限配置" width="600px">
      <el-table
        ref="apiTableRef"
        :data="apiList"
        @selection-change="handleApiSelectionChange"
        max-height="400"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="API名称" width="150" />
        <el-table-column prop="code" label="API编码" width="150" />
        <el-table-column prop="url" label="URL" />
        <el-table-column prop="method" label="方法" width="80" />
      </el-table>
      <template #footer>
        <el-button @click="apiDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveApis">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="orgDialogVisible" title="数据权限配置" width="500px">
      <el-tree
        ref="orgTreeRef"
        :data="orgTree"
        :props="{ label: 'name', children: 'children' }"
        show-checkbox
        node-key="id"
        default-expand-all
        class="tree-container"
      />
      <template #footer>
        <el-button @click="orgDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveOrgs">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roleApi } from '../../api/role'
import { menuApi } from '../../api/menu'
import { apiPermissionApi } from '../../api/apiPermission'
import { orgApi } from '../../api/organization'

const loading = ref(false)
const roleList = ref([])
const menuList = ref([])
const apiList = ref([])
const orgList = ref([])
const dialogVisible = ref(false)
const menuDialogVisible = ref(false)
const apiDialogVisible = ref(false)
const orgDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const menuTreeRef = ref()
const orgTreeRef = ref()
const currentRole = ref(null)
const selectedApis = ref([])

const form = reactive({
  id: null,
  name: '',
  code: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

const menuTree = computed(() => buildTree(menuList.value, 0))
const orgTree = computed(() => buildTree(orgList.value, 0))

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
    const [roleRes, menuRes, apiRes, orgRes] = await Promise.all([
      roleApi.getList(),
      menuApi.getList(),
      apiPermissionApi.getList(),
      orgApi.getList()
    ])
    roleList.value = roleRes.data || []
    menuList.value = menuRes.data || []
    apiList.value = apiRes.data || []
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
    code: '',
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
    description: row.description
  })
  isEdit.value = true
  dialogVisible.value = true
}

const handleSubmit = async () => {
  await formRef.value.validate()
  try {
    await roleApi.save(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error('Save failed:', e)
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定要删除该角色吗？', '提示', { type: 'warning' })
  try {
    await roleApi.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    console.error('Delete failed:', e)
  }
}

const showMenuDialog = async (row) => {
  currentRole.value = row
  menuDialogVisible.value = true
  try {
    const res = await roleApi.getRoleMenus(row.id)
    setTimeout(() => {
      menuTreeRef.value?.setCheckedKeys(res.data || [])
    }, 100)
  } catch (e) {
    console.error('Failed to load role menus:', e)
  }
}

const handleSaveMenus = async () => {
  const checkedKeys = menuTreeRef.value?.getCheckedKeys() || []
  try {
    await roleApi.bindMenus(currentRole.value.id, checkedKeys)
    ElMessage.success('保存成功')
    menuDialogVisible.value = false
  } catch (e) {
    console.error('Save menus failed:', e)
  }
}

const showApiDialog = async (row) => {
  currentRole.value = row
  apiDialogVisible.value = true
  try {
    const res = await roleApi.getRoleApis(row.id)
    selectedApis.value = apiList.value.filter(api => (res.data || []).includes(api.id))
  } catch (e) {
    console.error('Failed to load role apis:', e)
  }
}

const handleApiSelectionChange = (selection) => {
  selectedApis.value = selection
}

const handleSaveApis = async () => {
  const apiIds = selectedApis.value.map(api => api.id)
  try {
    await roleApi.bindApis(currentRole.value.id, apiIds)
    ElMessage.success('保存成功')
    apiDialogVisible.value = false
  } catch (e) {
    console.error('Save apis failed:', e)
  }
}

const showOrgDialog = async (row) => {
  currentRole.value = row
  orgDialogVisible.value = true
  try {
    const res = await roleApi.getRoleOrganizations(row.id)
    setTimeout(() => {
      orgTreeRef.value?.setCheckedKeys(res.data || [])
    }, 100)
  } catch (e) {
    console.error('Failed to load role orgs:', e)
  }
}

const handleSaveOrgs = async () => {
  const checkedKeys = orgTreeRef.value?.getCheckedKeys() || []
  try {
    await roleApi.bindOrganizations(currentRole.value.id, checkedKeys)
    ElMessage.success('保存成功')
    orgDialogVisible.value = false
  } catch (e) {
    console.error('Save orgs failed:', e)
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

.tree-container {
  max-height: 400px;
  overflow-y: auto;
}
</style>
