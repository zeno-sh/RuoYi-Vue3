import request from '@/utils/request'

// 查询买家聊天记录列表
export function listChat(query) {
  return request({
    url: '/erp/chat/list',
    method: 'get',
    params: query
  })
}

// 查询买家聊天记录详细
export function getChat(id) {
  return request({
    url: '/erp/chat/' + id,
    method: 'get'
  })
}

// 新增买家聊天记录
export function addChat(data) {
  return request({
    url: '/erp/chat',
    method: 'post',
    data: data
  })
}

// 修改买家聊天记录
export function updateChat(data) {
  return request({
    url: '/erp/chat',
    method: 'put',
    data: data
  })
}

// 删除买家聊天记录
export function delChat(id) {
  return request({
    url: '/erp/chat/' + id,
    method: 'delete'
  })
}
