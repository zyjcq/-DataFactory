import { request } from '@umijs/max';
const url = {
  Login: '/user/login', //登录
  Logout: '/user/logout', //退出登录
  Register: '/user/register', //注册
};
// 假设这里获取到了token，实际应用中可能从本地存储等获取
const token = localStorage.getItem('token');
//登录
export const LoginApi = (data:any) => {
  return request(url.Login, {
    method: 'POST',
    data,
  });
};
//退出登录
export const LogoutApi = (params:any) => {
  return request(url.Logout, {
    method: 'GET',
    params,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  };
//注册
export const RegisterApi = (data:any) => {
  return request(url.Register, {
    method: 'POST',
    data,
  });
  };

