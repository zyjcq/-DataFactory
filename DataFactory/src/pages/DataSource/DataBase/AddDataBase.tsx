import React, { useState, useRef } from'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';

// 定义数据库接口类型
interface DataSource {
    name: string;
    type: string;
    description: string | null;
    jdbcUrl: string;
    username: string;
    password: string;
}

const { Option } = Select;

const AddDataBase: React.FC<{
    visible: boolean;
    onCancel: () => void;
    onSubmit: (fields: DataSource) => Promise<boolean>;
    ref?: React.RefObject<{ resetForm: () => void }>;
}> = ({ visible, onCancel, onSubmit, ref }) => {
    const formRef = useRef<Form>();
    const [form] = Form.useForm();

    // 数据库类型选项
    const databaseTypes = ['Mysql', 'Oracle', 'PostgreSQL']; // 可以根据实际情况添加更多类型

    // 提交表单的处理函数
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const success = await onSubmit(values);
            if (success) {
                if (formRef.current) {
                    formRef.current.resetFields();
                }
                if (ref && ref.current) {
                    ref.current.resetForm();
                }
                onCancel();
            }
        } catch (error) {
            message.error('表单验证失败，请检查输入');
        }
    };

    return (
        <Modal
            visible={visible}
            title="新增数据库"
            onCancel={onCancel}
            okText="提交"
            cancelText="取消"
        >
            <Form
                ref={formRef}
                form={form}
                layout="vertical"
                initialValues={{ type: 'Mysql' }} // 设置数据库类型初始值为 Mysql
            >
                <Form.Item
                    name="name"
                    label="数据源名称"
                    rules={[{ required: true, message: '数据源名称为必填项' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="type"
                    label="数据库类型"
                    rules={[{ required: true, message: '数据库类型为必填项' }]}
                >
                    <Select>
                        {databaseTypes.map(type => (
                            <Option key={type} value={type}>
                                {type}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="description"
                    label="数据库说明"
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    name="jdbcUrl"
                    label="连接信息"
                    rules={[{ required: true, message: '连接信息为必填项' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="username"
                    label="用户名"
                    rules={[{ required: true, message: '用户名为必填项' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="密码"
                    rules={[{ required: true, message: '密码为必填项' }]}
                >
                    <Input.Password />
                </Form.Item>
            </Form>
            <Button
                type="primary"
                htmlType="submit"
                onClick={handleSubmit}
            >
                提交
            </Button>
        </Modal>
    );
};

export default AddDataBase;