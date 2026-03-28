import request from './request'

export const applicationApi = {
  getList() {
    return request.get('/api/application/list')
  },

  getById(id) {
    return request.get(`/api/application/${id}`)
  },

  save(data) {
    return request.post('/api/application/save', data)
  },

  update(data) {
    return request.post('/api/application/update', data)
  },

  delete(id) {
    return request.delete(`/api/application/${id}`)
  },

  updateStatus(id, status) {
    const params = new URLSearchParams()
    params.append('id', id)
    params.append('status', status)
    return request.post('/api/application/status', null, { params })
  }
}
