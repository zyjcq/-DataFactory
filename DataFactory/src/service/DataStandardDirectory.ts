import { request } from '@umijs/max';

const url = {
  getDataStandards: '/dataStandard/getList', // 获取数据标准列表
  getDataStandard: '/dataStandard/getDetail', // 获取数据标准详情
  updateDataStandard: '/dataStandard', // 修改数据标准信息
  addDataStandard: '/dataStandard', // 新增数据标准信息
  delDataStandard: '/dataStandard', // 删除数据标准
  updateDataStandardStatus: '/dataStandard/batchUpdateStatus', // 修改数据标准状态
  importDataStandard: '/dataStandard/importExcel', // 导入数据标准
};

// 假设这里获取到了token，实际应用中可能从本地存储等获取
const token = localStorage.getItem('token');

// 获取数据标准列表
export const getDataStandardsApi = (params: any) => {
  return request(url.getDataStandards, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 获取数据标准详情
export const getDataStandardApi = (params: any) => {
  return request(url.getDataStandard, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改数据标准信息
export const updateDataStandardApi = (data: any) => {
  return request(url.updateDataStandard, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 新增数据标准信息
export const addDataStandardApi = (data: any) => {
  return request(url.addDataStandard, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 删除数据标准
export const delDataStandardApi = (params: any) => {
  return request(url.delDataStandard, {
    method: 'DELETE',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改数据标准状态
export const updateDataStandardStatusApi = (data: any) => {
  return request(url.updateDataStandardStatus, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 导入数据标准
export const importDataStandardApi = (data: any) => {
  return request(url.importDataStandard, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};