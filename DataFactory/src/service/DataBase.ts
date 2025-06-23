import { request } from '@umijs/max';

const url = {
  getDataBases: '/database/getList', // 获取数据库列表
  getDataBase: '/database/getDetail', // 获取数据库详情
  updateDataBase: '/database', // 修改数据库信息
  addDataBase: '/database', // 新增数据库
  delDataBase: '/database', // 删除数据库
  updateDataBaseStatus: '/database/{id}/{status}', // 修改数据库状态
  updateDataBasesStatus:'/database/batchUpdateStatus',//批量修改数据库状态
  connectDataBase: '/database/connect', // 测试数据库连接
};

// 假设这里获取到了token，实际应用中可能从本地存储等获取
const token = localStorage.getItem('token');

// 获取数据库列表
export const getDataBasesApi = (params: any) => {
  return request(url.getDataBases, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 获取数据库详情
export const getDataBaseApi = (params: any) => {
  return request(url.getDataBase, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改数据库信息
export const updateDataBaseApi = (data: any) => {
  return request(url.updateDataBase, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 新增数据库
export const addDataBaseApi = (data: any) => {
  return request(url.addDataBase, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 删除数据库
export const delDataBaseApi = (params: any) => {
  return request(url.delDataBase, {
    method: 'DELETE',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改数据库状态
export const updateDataBaseStatusApi = (data:any) => {
    return request(url.updateDataBasesStatus, {
      method: 'PUT',
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

// 批量修改数据库状态
export const updateDataBasesStatusApi = (data: any) => {
  return request(url.updateDataBasesStatus, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 测试数据库连接
export const connectDataBaseApi = (data: any) => {
  return request(url.connectDataBase, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};