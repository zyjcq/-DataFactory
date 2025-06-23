import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'umi';
import { RegisterApi } from '../../service/user.tsx';
import './register.less';
// 导入图片
import registerBg from '../../assets/register.png';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: { username: string; password: string; phone: string }) => {
    try {
      const response = await RegisterApi(values);
      const { code, message: msg } = response.data;
      if (code === 100200) {
        message.success(msg);
        navigate('/login'); // 注册成功后跳转到登录页面
      } else {
        message.error(msg);
      }
    } catch (error) {
      console.error('注册请求出错:', error);
      message.error('注册请求出错，请稍后再试');
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('表单验证失败:', errorInfo);
  };

  // 定义返回登录按钮的点击事件处理函数
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-wrapper" style={{ backgroundImage: `url(${registerBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="register-container">
        <Form
          form={form}
          name="register"
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

          <Form.Item
            label="手机号码"
            name="phone"
            rules={[{ required: true, message: '请输入手机号码' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              注册
            </Button>
            <Button type="primary" style={{ marginLeft: '10px' }} onClick={handleBackToLogin}>
              返回登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default RegisterPage;