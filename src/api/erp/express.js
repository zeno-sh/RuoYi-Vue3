import request from '@/utils/request'

// 查询货代公司报价列表
export function listExpress(query) {
  return request({
    url: '/erp/express/list',
    method: 'get',
    params: query
  })
}

// 查询货代公司报价详细
export function getExpress(id) {
  return request({
    url: '/erp/express/' + id,
    method: 'get'
  })
}

// 新增货代公司报价
export function addExpress(data) {
  return request({
    url: '/erp/express',
    method: 'post',
    data: data
  })
}

// 修改货代公司报价
export function updateExpress(data) {
  return request({
    url: '/erp/express',
    method: 'put',
    data: data
  })
}

// 删除货代公司报价
export function delExpress(id) {
  return request({
    url: '/erp/express/' + id,
    method: 'delete'
  })
}
