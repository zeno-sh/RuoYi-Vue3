import request from '@/utils/request'

// 查询退货记录列表
export function listReturn(query) {
  return request({
    url: '/erp/return/list',
    method: 'get',
    params: query
  })
}

// 查询退货记录详细
export function getReturn(id) {
  return request({
    url: '/erp/return/' + id,
    method: 'get'
  })
}

// 新增退货记录
export function addReturn(data) {
  return request({
    url: '/erp/return',
    method: 'post',
    data: data
  })
}

// 修改退货记录
export function updateReturn(data) {
  return request({
    url: '/erp/return',
    method: 'put',
    data: data
  })
}

// 删除退货记录
export function delReturn(id) {
  return request({
    url: '/erp/return/' + id,
    method: 'delete'
  })
}
