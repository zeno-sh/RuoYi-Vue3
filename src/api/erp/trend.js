import request from '@/utils/request'

// 查询产品销量趋势列表
export function listTrend(query) {
  return request({
    url: '/erp/trend/list',
    method: 'get',
    params: query
  })
}

// 查询产品销量趋势详细
export function getTrend(id) {
  return request({
    url: '/erp/trend/' + id,
    method: 'get'
  })
}

// 新增产品销量趋势
export function addTrend(data) {
  return request({
    url: '/erp/trend',
    method: 'post',
    data: data
  })
}

// 修改产品销量趋势
export function updateTrend(data) {
  return request({
    url: '/erp/trend',
    method: 'put',
    data: data
  })
}

// 删除产品销量趋势
export function delTrend(id) {
  return request({
    url: '/erp/trend/' + id,
    method: 'delete'
  })
}
