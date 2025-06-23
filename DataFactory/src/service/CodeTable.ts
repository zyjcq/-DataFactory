import { request } from '@umijs/max';

const url = {
  getCodeTables: '/search/dict/getList', // 获取码表列表
  getCodeTable: '/search/dict/{id}', // 获取码表信息详情
  updateCodeTable: '/dict', // 修改码表信息
  addCodeTable: '/dict', // 新增码表
  delCodeTable: '/dict', // 删除码表
  updateCodeTableStatus: '/dict/batchUpdateStatus', // 修改码表状态
  importCodeTable: '/dict/importExcel', // 导入码表
};

// 假设这里获取到了token，实际应用中可能从本地存储等获取
const token = localStorage.getItem('token');

// 获取码表列表
export const getCodeTablesApi = (params: any) => {
  return request(url.getCodeTables, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 获取码表信息详情
export const getCodeTableApi = (params: { id: number }) => {
  const { id } = params;
  // 替换占位符 {id} 为实际的 id 值
  const apiUrl = url.getCodeTable.replace('{id}', id.toString());
  return request(apiUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};


// 修改码表信息
export const updateCodeTableApi = (data: any) => {
  return request(url.updateCodeTable, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 新增码表
export const addCodeTableApi = (data: any) => {
  return request(url.addCodeTable, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 删除码表
export const delCodeTableApi = (params: any) => {
  return request(url.delCodeTable, {
    method: 'DELETE',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改码表状态
export const updateCodeTableStatusApi = (data: any) => {
  return request(url.updateCodeTableStatus, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 导入码表
export const importCodeTableApi = (data: any) => {
  return request(url.importCodeTable, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};