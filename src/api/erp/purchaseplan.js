import request from '@/utils/request'

// 查询采购计划列表
export function listPurchaseplan(query) {
  return request({
    url: '/erp/purchaseplan/list',
    method: 'get',
    params: query
  })
}

// 查询采购计划详细
export function getPurchaseplan(id) {
  return request({
    url: '/erp/purchaseplan/' + id,
    method: 'get'
  })
}

// 新增采购计划
export function addPurchaseplan(data) {
  return request({
    url: '/erp/purchaseplan',
    method: 'post',
    data: data
  })
}

// 修改采购计划
export function updatePurchaseplan(data) {
  return request({
    url: '/erp/purchaseplan',
    method: 'put',
    data: data
  })
}

// 删除采购计划
export function delPurchaseplan(id) {
  return request({
    url: '/erp/purchaseplan/' + id,
    method: 'delete'
  })
}
