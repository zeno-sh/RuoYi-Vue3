import request from '@/utils/request'

// 查询广告明细列表
export function listAditem(query) {
  return request({
    url: '/erp/aditem/list',
    method: 'get',
    params: query
  })
}

// 查询广告明细详细
export function getAditem(id) {
  return request({
    url: '/erp/aditem/' + id,
    method: 'get'
  })
}

// 新增广告明细
export function addAditem(data) {
  return request({
    url: '/erp/aditem',
    method: 'post',
    data: data
  })
}

// 修改广告明细
export function updateAditem(data) {
  return request({
    url: '/erp/aditem',
    method: 'put',
    data: data
  })
}

// 删除广告明细
export function delAditem(id) {
  return request({
    url: '/erp/aditem/' + id,
    method: 'delete'
  })
}
