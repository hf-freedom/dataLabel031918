<template>
  <div class="data-permission-list">
    <el-card>
      <template #header>
        <span>数据权限配置</span>
      </template>
      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        数据权限用于控制角色可以访问的组织机构数据范围。管理员默认拥有所有组织机构的数据权限。
      </el-alert>

      <el-form :inline="true">
        <el-form-item label="选择角色">
          <el-select v-model="selectedRoleId" placeholder="请选择角色" @change="loadRolePermissions" style="width: 200px">
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div v-if="selectedRoleId" class="permission-content">
        <el-divider content-position="left">组织机构权限</el-divider>
        <el-tree
          ref="orgTreeRef"
          :data="orgTree"
          :props="{ label: 'name', children: 'children' }"
          show-checkbox
          node-key="id"
          default-expand-all
          class="tree-container"
        />
        <div style="margin-top: 20px">
          <el-button type="primary" @click="handleSavePermissions">保存权限</el-button>
          <el-button @click="handleSelectAll">全选</el-button>
          <el-button @click="handleClearAll">清空</el-button>
        </div>
      </div>

      <el-empty v-else description="请先选择一个角色" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { roleApi } from '../../api/role'
import { orgApi } from '../../api/organization'

const roleList = ref([])
const orgList = ref([])
const selectedRoleId = ref(null)
const orgTreeRef = ref()

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
  try {
    const [roleRes, orgRes] = await Promise.all([
      roleApi.getList(),
      orgApi.getList()
    ])
    roleList.value = roleRes.data || []
    orgList.value = orgRes.data || []
  } catch (e) {
    console.error('Failed to load data:', e)
  }
}

const loadRolePermissions = async () => {
  if (!selectedRoleId.value) return
  try {
    const res = await roleApi.getRoleOrganizations(selectedRoleId.value)
    setTimeout(() => {
      orgTreeRef.value?.setCheckedKeys(res.data || [])
    }, 100)
  } catch (e) {
    console.error('Failed to load role permissions:', e)
  }
}

const handleSavePermissions = async () => {
  if (!selectedRoleId.value) {
    ElMessage.warning('请先选择角色')
    return
  }
  const checkedKeys = orgTreeRef.value?.getCheckedKeys() || []
  try {
    await roleApi.bindOrganizations(selectedRoleId.value, checkedKeys)
    ElMessage.success('保存成功')
  } catch (e) {
    console.error('Save failed:', e)
  }
}

const handleSelectAll = () => {
  const allIds = orgList.value.map(org => org.id)
  orgTreeRef.value?.setCheckedKeys(allIds)
}

const handleClearAll = () => {
  orgTreeRef.value?.setCheckedKeys([])
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.permission-content {
  margin-top: 20px;
}

.tree-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}
</style>
