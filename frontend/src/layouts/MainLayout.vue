<template>
  <div class="main-layout">
    <el-container>
      <el-header class="header">
        <div class="logo">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据标注系统</span>
        </div>
        <div class="header-right">
          <span class="username">{{ userStore.user?.realName || userStore.user?.username }}</span>
          <el-tag size="small" :type="userStore.isAdmin ? 'danger' : 'info'">
            {{ userStore.isAdmin ? '管理员' : '普通用户' }}
          </el-tag>
          <el-button type="danger" size="small" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </el-header>
      <el-container>
        <el-aside width="220px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            router
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409EFF"
          >
            <el-menu-item index="/dashboard">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            
            <el-sub-menu index="system">
              <template #title>
                <el-icon><Setting /></el-icon>
                <span>系统管理</span>
              </template>
              <el-menu-item index="/user">
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </el-menu-item>
              <el-menu-item index="/role">
                <el-icon><UserFilled /></el-icon>
                <span>角色管理</span>
              </el-menu-item>
              <el-menu-item index="/organization">
                <el-icon><OfficeBuilding /></el-icon>
                <span>组织机构</span>
              </el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="permission">
              <template #title>
                <el-icon><Lock /></el-icon>
                <span>权限管理</span>
              </template>
              <el-menu-item index="/menu">
                <el-icon><Menu /></el-icon>
                <span>菜单管理</span>
              </el-menu-item>
              <el-menu-item index="/api-permission">
                <el-icon><Key /></el-icon>
                <span>API权限</span>
              </el-menu-item>
              <el-menu-item index="/data-permission">
                <el-icon><DataLine /></el-icon>
                <span>数据权限</span>
              </el-menu-item>
            </el-sub-menu>
            
            <el-menu-item index="/application">
              <el-icon><Grid /></el-icon>
              <span>应用管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="main-content">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="content-wrapper">
            <router-view />
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { userApi } from '../api/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)
const currentTitle = computed(() => route.meta?.title || '')

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (!userStore.user) {
    try {
      const res = await userApi.getCurrentUser()
      userStore.setUser(res.data)
    } catch (e) {
      router.push('/login')
    }
  }
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
}

.logo .el-icon {
  font-size: 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  font-size: 14px;
}

.sidebar {
  background-color: #304156;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.sidebar .el-menu {
  border-right: none;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.content-wrapper {
  margin-top: 15px;
  background: white;
  border-radius: 4px;
  padding: 20px;
  min-height: calc(100% - 35px);
}
</style>
