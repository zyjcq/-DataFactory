import React, { useState, useRef, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import type { FormInstance } from 'antd';
import { ActionType, ProForm, ProFormText, EditableProTable } from '@ant-design/pro-components';
import { UploadScriptApi } from '@/service/Script';
import { getCategoriesApi } from '@/service/Categories';

// 定义脚本数据
interface DataSource {
    className: string;//类名
    classifyId: number;//脚本分类
    description: string | null;//脚本描述
    fileName: string;//文件名
    functionName: string;//函数名
    id: number;//脚本id
    inputParams: {
        desc: string,//描述
        notNull: string,//是否必填
        dataType: string,//数据类型
        paramName: string//参数名
    }[];//输入参数
    outputParams: {
        desc: string,
        dataType: string,
        paramName: string
    }[];//输出参数
    scriptFileUrl: string;//脚本文件
    scriptName: string;//脚本名称
    scriptType: string;//脚本类型，默认python
}

const { Option } = Select;

const AddScript: React.FC<{
    visible: boolean;
    onCancel: () => void;
    onSubmit: (fields: DataSource) => Promise<boolean>;
    ref?: React.RefObject<{ resetForm: () => void }>;
}> = ({ visible, onCancel, onSubmit, ref }) => {
    const formRef = useRef<FormInstance>();
    const [form] = Form.useForm();
    // 输入参数表状态
    const [dataSourceFields, setDataSourceFields] = useState<any[]>([]);
    const [editableKeysFields, setEditableRowKeysFields] = useState<React.Key[]>([]);
    // 输出参数表状态
    const [dataSourceOutput, setDataSourceOutput] = useState<any[]>([]);
    const [editableKeysOutput, setEditableRowKeyOutput] = useState<React.Key[]>([]);
    const [position] = useState<'top' | 'bottom' | 'hidden'>('bottom');

    const scriptTypes = ['Python']; // 只支持Python类型
    const fileInputRef = useRef<HTMLInputElement>(null);
    const actionRef = useRef<ActionType>();
    const fileUrl = useRef<string>('');
    const fileName = useRef<string>('');
    const [categoryOptions, setCategoryOptions] = useState<{ value: number; label: string }[]>([]);

    // 添加验证规则
    const validateScriptName = async (rule: any, value: string) => {
        if (!value) {
            return Promise.reject('请输入脚本名称');
        }
        if (!/^[\u4e00-\u9fa5a-zA-Z]+$/.test(value)) {
            return Promise.reject('脚本名称只能包含中文和英文字母');
        }
        // TODO: 调用后端API检查脚本名称是否唯一
        return Promise.resolve();
    };

    const validateClassName = (rule: any, value: string) => {
        if (!value) {
            return Promise.resolve();
        }
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
            return Promise.reject('类名只能包含英文字母、数字和下划线，且必须以英文字母开头');
        }
        return Promise.resolve();
    };

    const validateFunctionName = (rule: any, value: string) => {
        if (!value) {
            return Promise.resolve();
        }
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
            return Promise.reject('函数名只能包含英文字母、数字和下划线，且必须以英文字母开头');
        }
        return Promise.resolve();
    };

    const validateParamName = (rule: any, value: string) => {
        if (!value) {
            return Promise.reject('请输入参数名称');
        }
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
            return Promise.reject('参数名称只能包含英文字母、数字和下划线，且必须以英文字母开头');
        }
        return Promise.resolve();
    };

    const handleFileUpload = async () => {
        if (fileInputRef.current) {
            const files = fileInputRef.current.files;
            if (files && files.length > 0) {
                const file = files[0];
                // 检查文件类型
                // if (!file.name.endsWith('.py')) {
                //     message.error('只支持Python文件(.py)');
                //     return;
                // }
                const formData = new FormData();
                formData.append('file', file);
                const hide = message.loading('正在上传脚本文件...');
                try {
                    const response = await UploadScriptApi(formData);
                    hide();
                    if (response.code === 100200) {
                        fileUrl.current = response.data.url;
                        fileName.current = response.data.fileName;
                        form.setFieldsValue({ scriptFileUrl: fileUrl.current });
                        form.setFieldsValue({ fileName: fileName.current });
                        message.success('脚本文件上传成功');
                        actionRef.current?.reload();
                    } else {
                        message.error(response.msg || '脚本文件上传失败，请重试');
                    }
                } catch (error) {
                    hide();
                    message.error('脚本文件上传失败，请重试');
                }
            }
        }
    };

    // 递归地提取所有分类的名称和 ID
    const flattenCategories = (categories: any[]): { value: number; label: string }[] => {
        return categories.flatMap(category => {
            const options = [
                { value: category.id, label: category.fullPath || category.name },
            ];
            if (category.children && category.children.length > 0) {
                options.push(...flattenCategories(category.children));
            }
            return options;
        });
    };
    //获取脚本分类
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesApi({ type: 'script' });
                if (response.code === 100200) {
                    const options = flattenCategories(response.data);
                    setCategoryOptions(options);
                } else {
                    message.error(response.msg || '获取数据资产分类数据失败，请重试');
                }
            } catch (error) {
                message.error('获取数据资产分类数据失败，请重试');
            }
        };

        fetchCategories();
    }, []);


    //脚本管理输入参数
    const InputColumns: any[] = [
        {
            title: '参数名称',
            dataIndex: 'paramName',
            formItemProps: {
                rules: [{ validator: validateParamName }]
            }
        },
        {
            title: '数据类型',
            dataIndex: 'dataType',
            valueType: 'select',
            valueEnum: {
                Int: { text: 'Int' },
                Float: { text: 'Float' },
                String: { text: 'String' }
            },
        },
        {
            title: '是否必填',
            dataIndex: 'notNull',
            valueType: 'select',
            valueEnum: {
                Y: { text: '是' },
                N: { text: '否' }
            },
        },
        {
            title: '参数描述',
            dataIndex: 'desc',
            width: '40%'
        },
        {
            title: '操作',
            valueType: 'option',
            width: 200,
            render: (text: any, record: any, _: any, action: any) => [
                <a
                    key="editable"
                    onClick={() => action?.startEditable?.(record.id)}
                >
                    编辑
                </a>,
                <a
                    key="delete"
                    onClick={() => setDataSourceFields(dataSourceFields.filter((item) => item.id !== record.id))}
                >
                    删除
                </a>,
            ],
        },
    ];
    //脚本管理输出参数
    const OutputColumns: any[] = [
        {
            title: '参数名称',
            dataIndex: 'paramName',
            formItemProps: {
                rules: [{ validator: validateParamName }]
            }
        },
        {
            title: '数据类型',
            dataIndex: 'dataType',
            valueType: 'select',
            valueEnum: {
                Int: { text: 'Int' },
                Float: { text: 'Float' },
                String: { text: 'String' }
            },
        },
        {
            title: '参数描述',
            dataIndex: 'desc',
            width: '50%'
        },
        {
            title: '操作',
            valueType: 'option',
            width: 200,
            render: (text: any, record: any, _: any, action: any) => [
                <a
                    key="editable"
                    onClick={() => action?.startEditable?.(record.id)}
                >
                    编辑
                </a>,
                <a
                    key="delete"
                    onClick={() => setDataSourceOutput(dataSourceOutput.filter((item) => item.id !== record.id))}
                >
                    删除
                </a>,
            ],
        },
    ];
    // 修改提交表单的处理函数
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            values.scriptFileUrl = fileUrl.current;
            values.fileName = fileName.current;
            
            // 检查必填项
            if (!values.scriptName || !values.classifyId || !values.scriptType || !values.description) {
                message.error('信息填写不完整，无法保存');
                return;
            }

            // 检查文件是否上传
            if (!values.scriptFileUrl) {
                message.error('请先上传脚本文件');
                return;
            }

            // 检查文件类型
            if (!values.fileName.endsWith('.py')) {
                message.error('文件类型错误，无法保存');
                return;
            }

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
            title="新增脚本"
            onCancel={onCancel}
            okText="提交"
            cancelText="取消"
            width={1000}
            bodyStyle={{ 
                maxHeight: '80vh', 
                overflowY: 'auto',
                padding: '24px' 
            }}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    取消
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                >
                    提交
                </Button>
            ]}
        >
            <ProForm
                form={form}
                layout="horizontal"//水平布局，标签在左，控件在右。
                grid
                submitter={false}
            >
                <ProForm.Group>
                    <ProFormText
                        name="name"
                        label="文件上传"
                    >
                        <Button
                            onClick={() => {
                                if (fileInputRef.current) {
                                    fileInputRef.current.click();
                                }
                            }}
                        >
                            文件上传
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                    </ProFormText>
                    <ProFormText
                        name="scriptName"
                        label="脚本名称"
                        rules={[
                            { required: true, message: '请输入脚本名称' },
                            { validator: validateScriptName }
                        ]}
                    >
                        <Input />
                    </ProFormText>
                    <ProFormText
                        name="classifyId"
                        label="脚本分类"
                        rules={[{ required: true, message: '脚本类型为必填项' }]}
                    >
                        <Select>
                            {categoryOptions.map(option => (
                                <Option key={option.value} value={option.value}>
                                    {option.label}
                                </Option>
                            ))}
                        </Select>
                    </ProFormText>
                    <ProFormText
                        name="scriptType"
                        label="脚本类型"
                        rules={[{ required: true, message: '脚本类型为必填项' }]}
                    >
                        <Select>
                            {scriptTypes.map(type => (
                                <Option key={type} value={type}>
                                    {type}
                                </Option>
                            ))}
                        </Select>
                    </ProFormText>
                    <ProFormText
                        name="className"
                        label="类名"
                        rules={[{ validator: validateClassName }]}
                    >
                        <Input />
                    </ProFormText>
                    <ProFormText
                        name="functionName"
                        label="函数名"
                        rules={[{ validator: validateFunctionName }]}
                    >
                        <Input />
                    </ProFormText>
                    <ProFormText
                        name="description"
                        label="描述"
                        rules={[{ required: true, message: '用户名为必填项' }]}
                    >
                        <Input />
                    </ProFormText>
                    <EditableProTable
                        name="inputParams"
                        rowKey="id"
                        headerTitle="输入参数"
                        maxLength={5}
                        scroll={{ x: 900 }}
                        recordCreatorProps={
                            position !== 'hidden'
                                ? {
                                    position: position as 'top',
                                    record: () => ({
                                        id: (Math.random() * 1000000).toFixed(0),
                                        dataType: 'String', // 默认为String类型
                                        notNull: 'N', // 默认为非必填
                                    }),
                                }
                                : false
                        }
                        loading={false}
                        columns={InputColumns}
                        request={async (params) => {
                            const { current = 1, pageSize = 20 } = params || {};
                            const start = (current - 1) * pageSize;
                            const end = start + pageSize;
                            const pageData = dataSourceFields.slice(start, end);
                            return {
                                data: pageData,
                                total: dataSourceFields.length,
                                success: true,
                            };
                        }}
                        value={dataSourceFields}
                        onChange={(value) => setDataSourceFields(value as any[])}
                        editable={{
                            type: 'multiple',
                            editableKeys: editableKeysFields,
                            onSave: async (rowKey, data, row) => {
                                console.log(rowKey, data, row);
                            },
                            onChange: setEditableRowKeysFields,
                        }}
                        actionRef={actionRef}
                    />
                    <EditableProTable
                        name="outputParams"
                        rowKey="id"
                        headerTitle="输出参数"
                        maxLength={5}
                        scroll={{ x: 900 }}
                        recordCreatorProps={
                            position !== 'hidden'
                                ? {
                                    position: position as 'top',
                                    record: () => ({
                                        id: (Math.random() * 1000000).toFixed(0),
                                        dataType: 'String', // 默认为String类型
                                    }),
                                }
                                : false
                        }
                        loading={false}
                        columns={OutputColumns}
                        request={async (params) => {
                            const { current = 1, pageSize = 20 } = params || {};
                            const start = (current - 1) * pageSize;
                            const end = start + pageSize;
                            const pageData = dataSourceOutput.slice(start, end);
                            return {
                                data: pageData,
                                total: dataSourceOutput.length,
                                success: true,
                            };
                        }}
                        value={dataSourceOutput}
                        onChange={(value) => setDataSourceOutput(value as any[])}
                        editable={{
                            type: 'multiple',
                            editableKeys: editableKeysOutput,
                            onSave: async (rowKey, data, row) => {
                                console.log(rowKey, data, row);
                            },
                            onChange: setEditableRowKeyOutput,
                        }}
                    />
                </ProForm.Group>
            </ProForm>
        </Modal>
    );
};

export default AddScript;