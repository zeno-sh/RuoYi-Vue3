import request from "@/utils/request";

// 查询业绩报表
export function listReport(query) {
  return request({
    url: "/erp/report/list",
    method: "get",
    params: query,
  });
}

export function indexVolume(query) {
  return request({
    url: "/erp/report/index/volume",
    method: "get",
    params: query,
  });
}


export function indexAd(query) {
  return request({
    url: "/erp/report/index/ad",
    method: "get",
    params: query,
  });
}

export function volumeList(query) {
  return request({
    url: "/erp/report/volume/list",
    method: "post",
    data: query,
  });
}

export function productProfit(data) {
  return request({
    url: "/erp/report/product/profit",
    method: "post",
    data: data,
  });
}