import request from './request'

export const orgApi = {
  getList() {
    return request.get('/api/org/list')
  },

  getTree() {
    return request.get('/api/org/tree')
  },

  getById(id) {
    return request.get(`/api/org/${id}`)
  },

  save(data) {
    return request.post('/api/org/save', data)
  },

  delete(id) {
    return request.delete(`/api/org/${id}`)
  },

  getOrgIdsByRoleId(roleId) {
    return request.get(`/api/org/role/${roleId}`)
  }
}
