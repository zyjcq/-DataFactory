import React, { useState, useRef, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { ActionType, ProForm, ProFormText, EditableProTable } from '@ant-design/pro-components';
// 假设这里引入其他需要的 API 和类型定义
import { UploadScriptApi } from '@/service/Script';
import { getCategoriesApi } from '@/service/Categories';


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
const UpdateScript: React.FC<{
    visible: boolean;
    values: DataSource;
    onSubmit: (fields: DataSource) => Promise<boolean>;
    onCancel: () => void;
}> = ({ visible, values, onSubmit, onCancel }) => {
    const formRef = useRef<Form>();
    const [form] = Form.useForm();
    // 其他状态定义，如输入参数表状态、输出参数表状态等...
    // 输入参数表状态
    const [dataSourceFields, setDataSourceFields] = useState<readonly any[]>([]);
    const [editableKeysFields, setEditableRowKeysFields] = useState<React.Key[]>([]);
    // 输出参数表状态
    const [dataSourceOutput, setDataSourceOutput] = useState<readonly any[]>([]);
    const [editableKeysOutput, setEditableRowKeyOutput] = useState<React.Key[]>([]);
    const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');
    const [dataSource, setDataSource] = useState<readonly any[]>([]); // 假设数据源类型为 any[]
    const scriptTypes = ['Python', 'Java', 'C++']; //脚本类型选项可以根据实际情况添加更多类型
    const fileInputRef = useRef<HTMLInputElement>(null);//上传文件
    const actionRef = useRef<ActionType>();
    const fileUrl = useRef<string>('');//脚本文件地址
    const fileName = useRef<string>('');//脚本文件名称
    const [categoryOptions, setCategoryOptions] = useState<{ value: number; label: string }[]>([]);//脚本分类数据

    /**
             * 上传文件
             * @param id
             */
    const handleFileUpload = async () => {
        if (fileInputRef.current) {
            const files = fileInputRef.current.files;
            if (files && files.length > 0) {
                const file = files[0];
                const formData = new FormData();
                formData.append('file', file);
                const hide = message.loading('正在脚本文件...');
                try {
                    const response = await UploadScriptApi(formData);
                    hide();
                    if (response.code === 100200) {
                        fileUrl.current = response.data.url;
                        fileName.current = response.data.fileName;
                        // 设置表单字段的 scriptFileUrl
                        form.setFieldsValue({ scriptFileUrl: fileUrl.current });
                        // 设置表单字段的 fileName
                        form.setFieldsValue({ fileName: fileName.current });
                        message.success('脚本文件上传成功');
                        actionRef.current?.reload(); // 上传成功后刷新表格
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


    useEffect(() => {
        // 初始化表单数据
        form.setFieldsValue(values);
        console.log("表单参数", values);
        // 初始化输入参数表格数据
        if (values.inputParams && values.inputParams.length > 0) {
            const formattedInputParams = values.inputParams.map((param: {
                desc: string,
                notNull: string,
                dataType: string,
                paramName: string
            }, index: number) => ({
                ...param,
                id: index.toString()
            }));
            setDataSourceFields(formattedInputParams);
        }

        // 初始化输出参数表格数据
        if (values.outputParams && values.outputParams.length > 0) {
            const formattedOutputParams = values.outputParams.map((param: {
                desc: string,
                dataType: string,
                paramName: string
            }, index: number) => ({
                ...param,
                id: index.toString()
            }));
            setDataSourceOutput(formattedOutputParams);
        }

        // 如果有文件URL，则设置fileUrl和fileName的引用值
        if (values.scriptFileUrl) {
            fileUrl.current = values.scriptFileUrl;
        }
        if (values.fileName) {
            fileName.current = values.fileName;
        }
    }, [values, form]);

    //脚本管理输入参数
    const inputColumns: any[] = [
        {
            title: '参数名称',
            dataIndex: 'paramName',
        },
        {
            title: '数据类型',
            dataIndex: 'dataType',
        },
        {
            title: '是否必填',
            dataIndex: 'notNull',
            // width: '40%'
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
            render: (text:any, record:any, _:any, action:any) => [
                <a
                    key="editable"
                   onClick={() => action?.startEditable?.(record.id)}
                >
                    编辑
                </a>,
                <a
                    key="delete"
                    onClick={() => {
                        // 使用回调函数的方式更新 dataSourceFields 状态，确保使用的是最新的状态值
                        setDataSourceFields(prevFields => prevFields.filter((item) => item.id !== record.id));
                        // 移除编辑状态中对应的 key
                        setEditableRowKeysFields(prevKeys => prevKeys.filter(key => key !== record.id));
                    }}
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
        },
        {
            title: '数据类型',
            dataIndex: 'dataType',
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
            render: (text, record, _, action) => [
                <a
                    key="editable"
                   onClick={() => action.startEditable(record.id)}
                >
                    编辑
                </a>,
                <a
                    key="delete"
                    onClick={() => {
                        console.log("删除按钮");

                        // 使用回调函数的方式更新 dataSourceOutput 状态，确保使用的是最新的状态值
                        setDataSourceOutput(prevOutput => prevOutput.filter((item) => item.id !== record.id));
                        // 移除编辑状态中对应的 key
                        setEditableRowKeyOutput(prevKeys => prevKeys.filter(key => key !== record.id));
                    }}
                >
                    删除
                </a>,
            ],
        },
    ];

    // 提交表单的处理函数
    const handleSubmit = async () => {
        try {
            const fields = await form.validateFields();
            // 确保包含输入参数和输出参数
            fields.inputParams = dataSourceFields;
            fields.outputParams = dataSourceOutput;
            console.log("提交表单", fields);
            fields.id = values.id;
            // 设置脚本文件URL和文件名
            if (fileUrl.current) {
                fields.scriptFileUrl = fileUrl.current;
            }
            if (fileName.current) {
                fields.fileName = fileName.current;
            }

            const success = await onSubmit(fields);
            if (success) {
                if (formRef.current) {
                    formRef.current.resetFields();
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
            title="编辑脚本"
            onCancel={onCancel}
            okText="提交"
            cancelText="取消"
            width={1000}
        >
            <ProForm
                ref={formRef}
                form={form}
                layout="horizontal"
                grid
            >
                {/* 表单字段，如文件上传、脚本名称、脚本分类、脚本类型等 */}
                <ProForm.Group>
                    <ProFormText
                        name="name"
                        label="文件上传"
                    // rules={[{ required: true, message: '数据源名称为必填项' }]}
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
                    // rules={[{ required: true, message: '数据源名称为必填项' }]}
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
                    >
                        <Input />
                    </ProFormText>
                    <ProFormText
                        name="functionName"
                        label="函数名"
                    // rules={[{ required: true, message: '连接信息为必填项' }]}
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
                        maxLength={100}
                        scroll={{ x: 900 }}
                        recordCreatorProps={{
                            position: 'bottom',
                            record: () => ({
                                id: (Math.random() * 1000000).toFixed(0),
                                paramName: '',
                                dataType: '',
                                notNull: '',
                                desc: ''
                            }),
                        }}
                        loading={false}
                        columns={inputColumns}
                        value={dataSourceFields}
                        onChange={setDataSourceFields}
                        editable={{
                            type: 'multiple',
                            editableKeys: editableKeysFields,
                            actionRender: (row: any, config: any, defaultDoms: any) => {
                                return [defaultDoms.save, defaultDoms.cancel];
                            },
                            onSave: async (rowKey, data, row) => {
                                // console.log('保存输入参数', rowKey, data, row);
                            },
                            onChange: setEditableRowKeysFields,
                        }}
                        actionRef={actionRef} // 添加 actionRef 属性
                    />
                    <EditableProTable
                        name="outputParams"
                        rowKey="id"
                        headerTitle="输出参数"
                        maxLength={100}
                        scroll={{ x: 900 }}
                        recordCreatorProps={{
                            position: 'bottom',
                            record: () => ({
                                id: (Math.random() * 1000000).toFixed(0),
                                paramName: '',
                                dataType: '',
                                desc: ''
                            }),
                        }}
                        loading={false}
                        columns={OutputColumns}
                        value={dataSourceOutput}
                        onChange={setDataSourceOutput}
                        editable={{
                            type: 'multiple',
                            editableKeys: editableKeysOutput,
                            actionRender: (row: any, config: any, defaultDoms: any) => {
                                return [defaultDoms.save, defaultDoms.cancel];
                            },
                           onSave: async (rowKey, data, row) => {
                               setDataSourceOutput(prev => prev.map(item => item.id === rowKey? data : item));
                               setEditableRowKeyOutput(prev => prev.filter(key => key!== rowKey));
                           },
                            onChange: setEditableRowKeyOutput,
                        }}
                    />
                </ProForm.Group>
            </ProForm>
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

export default UpdateScript;