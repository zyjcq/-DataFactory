import { request } from '@umijs/max';

const url = {
  getCategories: '/classify', // 获取分类目录列表
  addCategories: '/classify', // 新增分类目录
  delCategories: '/classify/{id}', // 删除分类目录
};

// 假设这里获取到了token，实际应用中可能从本地存储等获取
const token = localStorage.getItem('token');

// 获取分类目录列表
export const getCategoriesApi = (params: any) => {
  return request(url.getCategories, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 新增分类目录
export const addCategoriesApi = (data: any) => {
  return request(url.addCategories, {
    method: 'POST',
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// 删除分类目录
export const delCategoriesApi = (params: { id: number }) => {
  const { id } = params;
  // 替换占位符 {id} 为实际的 id 值
  const apiUrl = url.delCategories.replace('{id}', id.toString());
  return request(apiUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};