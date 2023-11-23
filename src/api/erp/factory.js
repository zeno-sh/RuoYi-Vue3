import request from '@/utils/request'

// 查询供应商信息列表
export function listFactory(query) {
  return request({
    url: '/erp/factory/list',
    method: 'get',
    params: query
  })
}

// 查询供应商信息详细
export function getFactory(id) {
  return request({
    url: '/erp/factory/' + id,
    method: 'get'
  })
}

// 新增供应商信息
export function addFactory(data) {
  return request({
    url: '/erp/factory',
    method: 'post',
    data: data
  })
}

// 修改供应商信息
export function updateFactory(data) {
  return request({
    url: '/erp/factory',
    method: 'put',
    data: data
  })
}

// 删除供应商信息
export function delFactory(id) {
  return request({
    url: '/erp/factory/' + id,
    method: 'delete'
  })
}
