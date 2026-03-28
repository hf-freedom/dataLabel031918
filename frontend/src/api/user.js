import request from './request'

export const userApi = {
  login(data) {
    const params = new URLSearchParams()
    params.append('username', data.username)
    params.append('password', data.password)
    params.append('userType', data.userType)
    return request.post('/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  },

  logout() {
    return request.get('/logout')
  },

  getCurrentUser() {
    return request.get('/current-user')
  },

  getList() {
    return request.get('/api/user/list')
  },

  getById(id) {
    return request.get(`/api/user/${id}`)
  },

  save(data) {
    return request.post('/api/user/save', data)
  },

  update(data) {
    return request.post('/api/user/update', data)
  },

  delete(id) {
    return request.delete(`/api/user/${id}`)
  },

  bindRole(userId, roleId) {
    const params = new URLSearchParams()
    params.append('userId', userId)
    params.append('roleId', roleId)
    return request.post('/api/user/bindRole', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
  }
}
