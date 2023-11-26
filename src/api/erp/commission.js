import request from '@/utils/request'

// 查询类目佣金列表
export function listCommission(query) {
  return request({
    url: '/erp/commission/list',
    method: 'get',
    params: query
  })
}

// 查询类目佣金详细
export function getCommission(id) {
  return request({
    url: '/erp/commission/' + id,
    method: 'get'
  })
}

// 新增类目佣金
export function addCommission(data) {
  return request({
    url: '/erp/commission',
    method: 'post',
    data: data
  })
}

// 修改类目佣金
export function updateCommission(data) {
  return request({
    url: '/erp/commission',
    method: 'put',
    data: data
  })
}

// 删除类目佣金
export function delCommission(id) {
  return request({
    url: '/erp/commission/' + id,
    method: 'delete'
  })
}
