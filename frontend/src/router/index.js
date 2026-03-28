import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/user/UserList.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('../views/role/RoleList.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'organization',
        name: 'Organization',
        component: () => import('../views/organization/OrgList.vue'),
        meta: { title: '组织机构' }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('../views/menu/MenuList.vue'),
        meta: { title: '菜单管理' }
      },
      {
        path: 'api-permission',
        name: 'ApiPermission',
        component: () => import('../views/api/ApiPermissionList.vue'),
        meta: { title: 'API权限' }
      },
      {
        path: 'application',
        name: 'Application',
        component: () => import('../views/application/ApplicationList.vue'),
        meta: { title: '应用管理' }
      },
      {
        path: 'data-permission',
        name: 'DataPermission',
        component: () => import('../views/permission/DataPermissionList.vue'),
        meta: { title: '数据权限' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.path === '/login' && userStore.isLoggedIn) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
