<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.userCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon role-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.roleCount }}</div>
              <div class="stat-label">角色总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon org-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.orgCount }}</div>
              <div class="stat-label">组织机构</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon app-icon">
              <el-icon><Grid /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.appCount }}</div>
              <div class="stat-label">应用总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="welcome-card" style="margin-top: 20px">
      <template #header>
        <span>欢迎回来，{{ userStore.user?.realName || userStore.user?.username }}</span>
      </template>
      <p>您当前登录身份为：<el-tag :type="userStore.isAdmin ? 'danger' : 'info'">{{ userStore.isAdmin ? '管理员' : '普通用户' }}</el-tag></p>
      <p style="margin-top: 10px">您可以在左侧菜单中选择相应的功能进行操作。</p>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { userApi } from '../api/user'
import { roleApi } from '../api/role'
import { orgApi } from '../api/organization'
import { applicationApi } from '../api/application'

const userStore = useUserStore()

const stats = ref({
  userCount: 0,
  roleCount: 0,
  orgCount: 0,
  appCount: 0
})

onMounted(async () => {
  try {
    const [users, roles, orgs, apps] = await Promise.all([
      userApi.getList(),
      roleApi.getList(),
      orgApi.getList(),
      applicationApi.getList()
    ])
    stats.value.userCount = users.data?.length || 0
    stats.value.roleCount = roles.data?.length || 0
    stats.value.orgCount = orgs.data?.length || 0
    stats.value.appCount = apps.data?.length || 0
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
})
</script>

<style scoped>
.stat-card {
  border-radius: 8px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.role-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.org-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.app-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}

.welcome-card {
  border-radius: 8px;
}
</style>
