import { request } from '@umijs/max';

const url = {
  getScripts: '/script/list', // 获取脚本列表
  getScript: '/script/getDetail', // 获取脚本详情
  updateScript: '/script', // 修改脚本信息
  addScript: '/script', // 新增脚本信息
  delScript: '/script', // 删除脚本
  updateScriptStatus: '/script/batchUpdateStatus', // 修改脚本状态
  UploadScript: '/script/upload', // 上传脚本
  ScriptTest:'/script/scriptTest',//脚本测试
  batchUpdateClassify: '/script/batchUpdateClassify',//批量修改分类
};

// 假设这里获取到了token，实际应用中可能从本地存储等获取
const token = localStorage.getItem('token');

// 获取脚本列表
export const getScriptsApi = (params: any) => {
  return request(url.getScripts, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 获取脚本详情
export const getScriptApi = (params: any) => {
  return request(url.getScript, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改脚本信息
export const updateScriptApi = (data: any) => {
  return request(url.updateScript, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 新增脚本信息
export const addScriptApi = (data: any) => {
  return request(url.addScript, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 删除脚本
export const delScriptApi = (params: any) => {
  return request(url.delScript, {
    method: 'DELETE',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 修改脚本状态
export const updateScriptStatusApi = (data: any) => {
  // 这里将 data 转换为 URLSearchParams 格式，以满足非数组参数的要求
  return request(url.updateScriptStatus, {
    method: 'PUT',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 上传脚本文件
export const UploadScriptApi = (data: any) => {
  return request(url.UploadScript, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
// 脚本测试
export const ScriptTestApi = (data: any) => {
  return request(url.ScriptTest, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 批量修改分类
export const batchUpdateClassifyApi = (data: any) => {
  const { ids, classifyId } = data;
  // 构建 URL 参数
  const params = new URLSearchParams();
  if (ids && ids.length > 0) {
    ids.forEach((id:any) => {
      params.append('ids', id.toString());
    });
  }
  if (classifyId) {
    params.append('classifyId', classifyId.toString());
  }
  const urlWithParams = `${url.batchUpdateClassify}?${params.toString()}`;

  return request(urlWithParams, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};