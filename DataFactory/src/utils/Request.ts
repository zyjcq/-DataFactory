import { RequestConfig } from '@umijs/max';
export const baseUrl = '/api';
const token = localStorage.getItem('token')

const Request: RequestConfig = {
  // timeout: 20000,
  baseURL: baseUrl,
   requestInterceptors: [
    (config: any) => {
      const { headers } = config;
      headers['Authorization'] =token
      return config;
    },
  ],
responseInterceptors:[],
};
export default Request;