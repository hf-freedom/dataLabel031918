import request from './request'

export const apiPermissionApi = {
  getList() {
    return request.get('/api/permission/list')
  },

  getById(id) {
    return request.get(`/api/permission/${id}`)
  },

  getByMenuId(menuId) {
    return request.get(`/api/permission/menu/${menuId}`)
  },

  save(data) {
    return request.post('/api/permission/save', data)
  },

  delete(id) {
    return request.delete(`/api/permission/${id}`)
  },

  getApiIdsByRoleId(roleId) {
    return request.get(`/api/permission/role/${roleId}`)
  },

  bindApisToRole(roleId, apiIds) {
    const params = new URLSearchParams()
    params.append('roleId', roleId)
    return request.post('/api/permission/bindRole', apiIds, {
      params: { roleId }
    })
  }
}
