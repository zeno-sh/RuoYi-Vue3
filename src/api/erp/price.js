import request from '@/utils/request'

// 查询产品价格策略列表
export function listPrice(query) {
  return request({
    url: '/erp/price/list',
    method: 'get',
    params: query
  })
}

// 查询产品价格策略详细
export function getPrice(id) {
  return request({
    url: '/erp/price/' + id,
    method: 'get'
  })
}

// 新增产品价格策略
export function addPrice(data) {
  return request({
    url: '/erp/price',
    method: 'post',
    data: data
  })
}

// 修改产品价格策略
export function updatePrice(data) {
  return request({
    url: '/erp/price',
    method: 'put',
    data: data
  })
}

// 删除产品价格策略
export function delPrice(id) {
  return request({
    url: '/erp/price/' + id,
    method: 'delete'
  })
}
