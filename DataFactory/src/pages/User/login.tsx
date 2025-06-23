import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'umi';
import { LoginApi } from '../../service/user.tsx'; 
import './login.less'; // 引入样式文件
// 导入图片
import loginBg from '../../assets/login.png'; 

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string }) => {
    navigate('/home'); // 登录成功后跳转到首页
    try {
      const response = await LoginApi(values);
      const { code, message: msg, data } = response.data;
      if (code === 100200) {
        message.success(msg);
        localStorage.setItem('token', data);
        navigate('/index'); // 登录成功后跳转到首页
      } else {
        message.error(msg);
      }
    } catch (error) {
      console.error('登录请求出错:', error);
      message.error('登录请求出错，请稍后再试');
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('表单验证失败:', errorInfo);
  };

  // 处理注册按钮点击事件
  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="login-wrapper" style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="login-container">
        <Form
          form={form}
          name="login"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          autoComplete="off"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="用户账号"
            name="username"
            rules={[{ required: true, message: '请输入用户账号' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="用户密码"
            name="password"
            rules={[{ required: true, message: '请输入用户密码' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              登录
            </Button>
            {/* 为注册按钮添加 onClick 事件处理函数 */}
            <Button type="primary" style={{ marginLeft: '10px' }} onClick={handleRegisterClick}>
              注册
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;