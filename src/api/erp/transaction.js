import request from '@/utils/request'

// 查询交易记录列表
export function listTransaction(query) {
  return request({
    url: '/erp/transaction/list',
    method: 'get',
    params: query
  })
}

// 查询交易记录详细
export function getTransaction(id) {
  return request({
    url: '/erp/transaction/' + id,
    method: 'get'
  })
}

// 新增交易记录
export function addTransaction(data) {
  return request({
    url: '/erp/transaction',
    method: 'post',
    data: data
  })
}

// 修改交易记录
export function updateTransaction(data) {
  return request({
    url: '/erp/transaction',
    method: 'put',
    data: data
  })
}

// 删除交易记录
export function delTransaction(id) {
  return request({
    url: '/erp/transaction/' + id,
    method: 'delete'
  })
}
