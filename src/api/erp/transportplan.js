import request from '@/utils/request'

// 查询头程计划列表
export function listTransportplan(query) {
  return request({
    url: '/erp/transportplan/list',
    method: 'get',
    params: query
  })
}

// 查询头程计划详细
export function getTransportplan(id) {
  return request({
    url: '/erp/transportplan/' + id,
    method: 'get'
  })
}

// 新增头程计划
export function addTransportplan(data) {
  return request({
    url: '/erp/transportplan',
    method: 'post',
    data: data
  })
}

// 修改头程计划
export function updateTransportplan(data) {
  return request({
    url: '/erp/transportplan',
    method: 'put',
    data: data
  })
}

// 删除头程计划
export function delTransportplan(id) {
  return request({
    url: '/erp/transportplan/' + id,
    method: 'delete'
  })
}
