import request from '@/utils/request'

// 查询类目成本配置列表
export function listCategoryconfig(query) {
  return request({
    url: '/erp/categoryconfig/list',
    method: 'get',
    params: query
  })
}

// 查询类目成本配置详细
export function getCategoryconfig(id) {
  return request({
    url: '/erp/categoryconfig/' + id,
    method: 'get'
  })
}

// 新增类目成本配置
export function addCategoryconfig(data) {
  return request({
    url: '/erp/categoryconfig',
    method: 'post',
    data: data
  })
}

// 修改类目成本配置
export function updateCategoryconfig(data) {
  return request({
    url: '/erp/categoryconfig',
    method: 'put',
    data: data
  })
}

// 删除类目成本配置
export function delCategoryconfig(id) {
  return request({
    url: '/erp/categoryconfig/' + id,
    method: 'delete'
  })
}
