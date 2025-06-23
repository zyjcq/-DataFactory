import React from'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';

// 定义数据库接口类型
interface DataSource {
    id: number;
    name: string;
    type: string;
    description: string | null;
    jdbcUrl: string;
    username: string;
    password: string;
    status: 0 | 1 | 2;
}

const { Option } = Select;

const UpdateDataBase: React.FC<{
    visible: boolean;
    values: Partial<DataSource>;
    onSubmit: (fields: DataSource) => Promise<boolean>;
    onCancel: () => void;
}> = ({ visible, values, onSubmit, onCancel }) => {
    const [form] = Form.useForm();

    // 数据库类型选项
    const databaseTypes = ['Mysql', 'Oracle', 'PostgreSQL'];

    // 提交表单的处理函数
    const handleSubmit = async () => {
        try {
            const valuesToSubmit = await form.validateFields();
            const success = await onSubmit(valuesToSubmit as DataSource);
            if (success) {
                form.resetFields();
                onCancel();
            }
        } catch (error) {
            message.error('表单验证失败，请检查输入');
        }
    };

    return (
        <Modal
            visible={visible}
            title="编辑数据库"
            onCancel={onCancel}
            okText="提交"
            cancelText="取消"
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={values}
            >
                <Form.Item
                    name="id"
                    style={{ display: 'none' }}
                >
                    <Input />
                </Form.Item>
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
                <Form.Item
                    name="status"
                    label="数据库状态"
                    rules={[{ required: true, message: '数据库状态为必填项' }]}
                >
                    <Select>
                        <Option value={0}>未发布</Option>
                        <Option value={1}>已发布</Option>
                        <Option value={2}>已停用</Option>
                    </Select>
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

export default UpdateDataBase;