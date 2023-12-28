import request from '@/utils/request'

// ��ѯ�ɹ���Ϣ�б�
export function listPurchase(query) {
  return request({
    url: '/erp/purchase/list',
    method: 'get',
    params: query
  })
}

// ��ѯ�ɹ���Ϣ��ϸ
export function getPurchase(id) {
  return request({
    url: '/erp/purchase/' + id,
    method: 'get'
  })
}

// �����ɹ���Ϣ
export function addPurchase(data) {
  return request({
    url: '/erp/purchase',
    method: 'post',
    data: data
  })
}

// �޸Ĳɹ���Ϣ
export function updatePurchase(data) {
  return request({
    url: '/erp/purchase',
    method: 'put',
    data: data
  })
}

// ɾ���ɹ���Ϣ
export function delPurchase(id) {
  return request({
    url: '/erp/purchase/' + id,
    method: 'delete'
  })
}
