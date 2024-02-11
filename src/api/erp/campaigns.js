import request from '@/utils/request'

// 查询广告活动列表
export function listCampaigns(query) {
  return request({
    url: '/erp/campaigns/list',
    method: 'get',
    params: query
  })
}

// 查询广告活动详细
export function getCampaigns(id) {
  return request({
    url: '/erp/campaigns/' + id,
    method: 'get'
  })
}

// 新增广告活动
export function addCampaigns(data) {
  return request({
    url: '/erp/campaigns',
    method: 'post',
    data: data
  })
}

// 修改广告活动
export function updateCampaigns(data) {
  return request({
    url: '/erp/campaigns',
    method: 'put',
    data: data
  })
}

// 删除广告活动
export function delCampaigns(id) {
  return request({
    url: '/erp/campaigns/' + id,
    method: 'delete'
  })
}
