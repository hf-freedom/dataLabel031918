import request from './request'

export const roleApi = {
  getList() {
    return request.get('/api/role/list')
  },

  getById(id) {
    return request.get(`/api/role/${id}`)
  },

  save(data) {
    return request.post('/api/role/save', data)
  },

  delete(id) {
    return request.delete(`/api/role/${id}`)
  },

  getRoleMenus(roleId) {
    return request.get(`/api/role/${roleId}/menus`)
  },

  bindMenus(roleId, menuIds) {
    return request.post(`/api/role/${roleId}/menus`, menuIds)
  },

  getRoleApis(roleId) {
    return request.get(`/api/role/${roleId}/apis`)
  },

  bindApis(roleId, apiIds) {
    return request.post(`/api/role/${roleId}/apis`, apiIds)
  },

  getRoleOrganizations(roleId) {
    return request.get(`/api/role/${roleId}/organizations`)
  },

  bindOrganizations(roleId, orgIds) {
    return request.post(`/api/role/${roleId}/organizations`, orgIds)
  }
}
