import request from '@/utils/request'

// 查询成本配置列表
export function listShopconfig(query) {
  return request({
    url: '/erp/shopconfig/list',
    method: 'get',
    params: query
  })
}

// 查询成本配置详细
export function getShopconfig(id) {
  return request({
    url: '/erp/shopconfig/' + id,
    method: 'get'
  })
}

// 新增成本配置
export function addShopconfig(data) {
  return request({
    url: '/erp/shopconfig',
    method: 'post',
    data: data
  })
}

// 修改成本配置
export function updateShopconfig(data) {
  return request({
    url: '/erp/shopconfig',
    method: 'put',
    data: data
  })
}

// 删除成本配置
export function delShopconfig(id) {
  return request({
    url: '/erp/shopconfig/' + id,
    method: 'delete'
  })
}
