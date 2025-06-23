import { request } from '@umijs/max';

const url = {
  getInterfaces: '/interface/getList', // 获取接口列表
  getInterface: '/interface/getDetail', // 获取接口详情
  updateInterface: '/interface', // 修改接口信息
  addInterface: '/interface', // 新增接口信息
  addInterfaceParams:'/interface/addInterfaceParam',//新增接口参数
  delInterface: '/interface', // 删除接口
  updateInterfaceStatus: '/interface/batchUpdateStatus', // 修改接口状态
  connectInterface: '/interface/interfaceTest', // 测试连接
};

// 假设这里获取到了token，实际应用中可能从本地存储等获取
const token = localStorage.getItem('token');

// 获取接口列表
export const getInterfacesApi = (params: any) => {
  return request(url.getInterfaces, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 获取接口详情
export const getInterfaceApi = (params: any) => {
  return request(url.getInterface, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改接口信息
export const updateInterfaceApi = (data: any) => {
  return request(url.updateInterface, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 新增接口信息
export const addInterfaceApi = (data: any) => {
  return request(url.addInterface, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 新增接口参数
export const addInterfaceParamsApi = (data: any) => {
  return request(url.addInterfaceParams, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
// 删除接口
export const delInterfaceApi = (params: any) => {
  return request(url.delInterface, {
    method: 'DELETE',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改接口状态
export const updateInterfaceStatusApi = (data: any) => {
  // 这里将 data 转换为 URLSearchParams 格式，以满足非数组参数的要求
  return request(url.updateInterfaceStatus, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
// 测试连接
export const connectInterfaceApi = (data: any) => {
  return request(url.connectInterface, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
