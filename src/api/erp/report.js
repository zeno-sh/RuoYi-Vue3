import request from '@/utils/request'

// 查询业绩报表
export function listReport(query) {
    return request({
      url: '/erp/report/list',
      method: 'get',
      params: query
    })
  }