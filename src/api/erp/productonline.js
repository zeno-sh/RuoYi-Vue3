import request from '@/utils/request'

// 查询在线商品列表
export function listProductonline(query) {
  return request({
    url: '/erp/productonline/list',
    method: 'get',
    params: query
  })
}

// 查询在线商品详细
export function getProductonline(id) {
  return request({
    url: '/erp/productonline/' + id,
    method: 'get'
  })
}

// 新增在线商品
export function addProductonline(data) {
  return request({
    url: '/erp/productonline',
    method: 'post',
    data: data
  })
}

// 修改在线商品
export function updateProductonline(data) {
  return request({
    url: '/erp/productonline',
    method: 'put',
    data: data
  })
}

// 删除在线商品
export function delProductonline(id) {
  return request({
    url: '/erp/productonline/' + id,
    method: 'delete'
  })
}
