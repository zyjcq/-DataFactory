import { request } from '@umijs/max';

const url = {
  getDataAssets: '/data-asset-info/getList', // 获取数据资产列表
  getDataAsset: '/data-asset-info/getDetail', // 获取数据资产详情
  updateDataAsset: '/data-asset-info', // 修改数据资产信息
  addDataAsset: '/data-asset-info', // 新增数据资产信息
  delDataAsset: '/data-asset-info', // 删除数据资产
  updateDataAssetStatus: '/data-asset-info/batchUpdateStatus', // 修改数据资产状态
};

// 假设这里获取到了token，实际应用中可能从本地存储等获取
const token = localStorage.getItem('token');

// 获取数据资产列表
export const getDataAssetsApi = (params: any) => {
  return request(url.getDataAssets, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 获取数据资产详情
export const getDataAssetApi = (params: any) => {
  return request(url.getDataAsset, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改数据资产信息
export const updateDataAssetApi = (data: any) => {
  return request(url.updateDataAsset, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 新增数据资产信息
export const addDataAssetApi = (data: any) => {
  return request(url.addDataAsset, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 删除数据资产
export const delDataAssetApi = (params: any) => {
  return request(url.delDataAsset, {
    method: 'DELETE',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改数据资产状态
export const updateDataAssetStatusApi = (data: any) => {
  return request(url.updateDataAssetStatus, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
