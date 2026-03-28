import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '../api/user'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.userType === 1)

  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      sessionStorage.setItem('user', JSON.stringify(userData))
    } else {
      sessionStorage.removeItem('user')
    }
  }

  const loadUser = () => {
    const savedUser = sessionStorage.getItem('user')
    if (savedUser) {
      user.value = JSON.parse(savedUser)
    }
  }

  const logout = async () => {
    try {
      await userApi.logout()
    } catch (e) {
      console.error('Logout error:', e)
    }
    setUser(null)
  }

  return {
    user,
    isLoggedIn,
    isAdmin,
    setUser,
    loadUser,
    logout
  }
})
