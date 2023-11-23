import request from '@/utils/request'

// 查询选品计划列表
export function listPlan(query) {
  return request({
    url: '/erp/plan/list',
    method: 'get',
    params: query
  })
}

// 查询选品计划详细
export function getPlan(id) {
  return request({
    url: '/erp/plan/' + id,
    method: 'get'
  })
}

// 新增选品计划
export function addPlan(data) {
  return request({
    url: '/erp/plan',
    method: 'post',
    data: data
  })
}

// 修改选品计划
export function updatePlan(data) {
  return request({
    url: '/erp/plan',
    method: 'put',
    data: data
  })
}

// 删除选品计划
export function delPlan(id) {
  return request({
    url: '/erp/plan/' + id,
    method: 'delete'
  })
}
