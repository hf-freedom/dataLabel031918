import request from './request'

export const menuApi = {
  getList() {
    return request.get('/api/menu/list')
  },

  getTree() {
    return request.get('/api/menu/tree')
  },

  getById(id) {
    return request.get(`/api/menu/${id}`)
  },

  save(data) {
    return request.post('/api/menu/save', data)
  },

  delete(id) {
    return request.delete(`/api/menu/${id}`)
  },

  getMenuIdsByRoleId(roleId) {
    return request.get(`/api/menu/role/${roleId}`)
  },

  bindMenusToRole(roleId, menuIds) {
    const params = new URLSearchParams()
    params.append('roleId', roleId)
    return request.post('/api/menu/bindRole', menuIds, {
      params: { roleId }
    })
  }
}
