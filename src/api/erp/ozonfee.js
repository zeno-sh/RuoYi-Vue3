import request from '@/utils/request'

// 查询ozon物流费用列表
export function listOzonfee(query) {
  return request({
    url: '/erp/ozonfee/list',
    method: 'get',
    params: query
  })
}

// 查询ozon物流费用详细
export function getOzonfee(id) {
  return request({
    url: '/erp/ozonfee/' + id,
    method: 'get'
  })
}

// 新增ozon物流费用
export function addOzonfee(data) {
  return request({
    url: '/erp/ozonfee',
    method: 'post',
    data: data
  })
}

// 修改ozon物流费用
export function updateOzonfee(data) {
  return request({
    url: '/erp/ozonfee',
    method: 'put',
    data: data
  })
}

// 删除ozon物流费用
export function delOzonfee(id) {
  return request({
    url: '/erp/ozonfee/' + id,
    method: 'delete'
  })
}
