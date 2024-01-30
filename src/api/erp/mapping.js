import request from '@/utils/request'

// 查询授权列表
export function listMapping(query) {
  return request({
    url: '/erp/mapping/list',
    method: 'get',
    params: query
  })
}

// 查询授权详细
export function getMapping(id) {
  return request({
    url: '/erp/mapping/' + id,
    method: 'get'
  })
}

// 新增授权
export function addMapping(data) {
  return request({
    url: '/erp/mapping',
    method: 'post',
    data: data
  })
}

// 修改授权
export function updateMapping(data) {
  return request({
    url: '/erp/mapping',
    method: 'put',
    data: data
  })
}

// 删除授权
export function delMapping(id) {
  return request({
    url: '/erp/mapping/' + id,
    method: 'delete'
  })
}
