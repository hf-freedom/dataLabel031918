import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const request = axios.create({
  baseURL: '',
  timeout: 15000,
  withCredentials: true
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res
    } else if (res.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      sessionStorage.removeItem('user')
      router.push('/login')
      return Promise.reject(new Error(res.message || '未登录'))
    } else if (res.code === 403) {
      ElMessage.error('无权限访问')
      return Promise.reject(new Error(res.message || '无权限'))
    } else {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
