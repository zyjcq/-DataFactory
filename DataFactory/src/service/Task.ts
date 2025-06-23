import { request } from '@umijs/max';

const url = {
  addTask: '/task', // 新增任务基本信息
  delTask: '/task', // 删除任务
  addTaskConfig: '/task/addConfig', // 新增任务配置信息
  batchUpdateClassify: '/task/batchUpdateClassify',//批量修改分类
  updateTaskStatus: '/task/batchUpdateStatus', // 修改任务状态
  getTask: '/task/getDetail', // 获取任务详情
  getTasks: '/task/getList', // 获取任务列表
  updateTask: '/task/updateInfo', // 修改任务基本信息
};

// 假设这里获取到了token，实际应用中可能从本地存储等获取
const token = localStorage.getItem('token');

// 新增任务基本信息
export const addTaskApi = (data: any) => {
    return request(url.addTask, {
      method: 'POST',
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

// 删除任务
export const delTaskApi = (params: any) => {
    return request(url.delTask, {
      method: 'DELETE',
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

// 新增任务基本信息
export const addTaskConfigApi = (data: any) => {
    return request(url.addTaskConfig, {
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

// 修改任务状态
export const updateTaskStatusApi = (data: any) => {
    // 这里将 data 转换为 URLSearchParams 格式，以满足非数组参数的要求
    return request(url.updateTaskStatus, {
      method: 'PUT',
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

// 获取任务详情
export const getTaskApi = (params: any) => {
    return request(url.getTask, {
      method: 'GET',
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

// 获取任务列表
export const getTasksApi = (params: any) => {
    return request(url.getTasks, {
      method: 'GET',
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

// 修改任务信息
export const updateTaskApi = (data: any) => {
    return request(url.updateTask, {
      method: 'PUT',
      data,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

