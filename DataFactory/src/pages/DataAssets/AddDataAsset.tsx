import React, { useState, useEffect } from 'react';
import { Form, message, Button } from 'antd';
import { ProForm, ProFormText, EditableProTable } from '@ant-design/pro-components';
import { useNavigate } from 'umi';
import { addDataAssetApi } from '@/service/DataAssets';
import { getCategoriesApi } from '@/service/Categories';
import { getCodeTablesApi } from '@/service/CodeTable';

// 数据标准接口类型定义（假设已有）
interface DataSource {
    chineseName: string;
    englishName: string;
    description: string | null;
    classifyId: any;
    dataAssetFieldList: {
        chineseName: string,
        englishName: string,
        description: string,
        dataStandardId: number,
    }[];
}

const AddDataAsset: React.FC<{
    visible: boolean;
    onCancel: () => void;
    onSubmit: (fields: DataSource) => Promise<boolean>;
}> = ({ visible, onCancel, onSubmit }) => {
    // 所属目录表格状态
    const [editableKeysCategories, setEditableRowKeysCategories] = useState<React.Key[]>([]);
    const [dataSourceCategories, setDataSourceCategories] = useState<readonly any[]>([]);
    // 数据资产表字段添加数据表格状态
    const [editableKeysFields, setEditableRowKeysFields] = useState<React.Key[]>([]);
    const [dataSourceFields, setDataSourceFields] = useState<readonly any[]>([]);
    
    const [dataSource, setDataSource] = useState<readonly any[]>([]); // 假设数据源类型为 any[]
    const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');
    const [categoryOptions, setCategoryOptions] = useState([]); // 新增状态变量，用于存储数据资产分类的下拉框选项
    const [codeTableOptions, setCodeTableOptions] = useState([]); // 新增状态变量，用于存储码表下拉框选项
    const navigate = useNavigate();
    const handleCancel = () => {
        navigate(-1); // 返回到上一个页面
    };

    //获取数据资产分类
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesApi({ type: 'asset' });
                if (response.code === 100200) {
                    const options = response.data.map(item => ({ // 将数据处理成下拉框选项格式
                        value: item.id, // 假设id是唯一标识
                        label: item.name // 假设name是显示的名称
                    }));
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
    //分类目录数据
    const CategoriesColumns: any[] = [
        {
            title: '所属目录',
            dataIndex: 'id', // 存储所属目录的ID
            valueType: 'select',
            fieldProps: {
                options: categoryOptions, // 使用之前获取的分类目录选项
            },
        },
        {
            title: '操作',
            valueType: 'option',
            width: 200,
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => action?.startEditable?.(record.id)}
                >
                    编辑
                </a>,
                <a
                    key="delete"
                    onClick={() => setDataSource(dataSource.filter((item) => item.id !== record.id))}
                >
                    删除
                </a>,
            ],
        },
    ];

    //数据资产表字段添加数据
    const columns: any[] = [
        {
            title: '字段英文名称',
            dataIndex: 'englishName',
        },
        {
            title: '字段中文名称',
            dataIndex: 'chineseName',
        },
        {
            title: '字段说明',
            dataIndex: 'description',
            width: '40%'
        },
        {
            title: '标准映射',
            dataIndex: 'decs',
            valueType: 'select',
            width: '19%',
            fieldProps: {
                options: codeTableOptions,
                onDropdownVisibleChange: async (visible: any) => {
                    if (visible) {
                        try {
                            const response = await getCodeTablesApi({
                                current: 1,
                                size: 100
                            });
                            if (response.code === 100200) {
                                const options = response.data.records.map(item => ({
                                    value: item.dictCode,
                                    label: `${item.dictCode} - ${item.dictName}`
                                }));
                                setCodeTableOptions(options);
                            } else {
                                message.error(response.msg || '获取码表数据失败，请重试');
                            }
                        } catch (error) {
                            message.error('获取码表数据失败，请重试');
                        }
                    }
                }
            }
        },
        {
            title: '操作',
            valueType: 'option',
            width: 200,
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => action?.startEditable?.(record.id)}
                >
                    编辑
                </a>,
                <a
                    key="delete"
                    onClick={() => setDataSource(dataSource.filter((item) => item.id !== record.id))}
                >
                    删除
                </a>,
            ],
        },
    ];

    const [form] = Form.useForm(); // 创建一个表单实例
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log("表单数据", values);
            const requestData: DataSource = {
                chineseName: values.chineseName,
                englishName: values.englishName,
                description: values.description,
                classifyId: dataSourceCategories.map((item) => item.id),
                dataAssetFieldList: dataSourceFields.map(item => ({
                    chineseName: item.chineseName || '给对方',
                    englishName: item.englishName || 'fgds',
                    description: item.description,
                    dataStandardId: item.dataStandardId || 4 // 假设默认值为 0
                }))
            };
            const response = await addDataAssetApi(requestData);
            if (response.code === 100200) {
                message.success('提交成功');
                navigate(-1); // 提交成功后返回上一页
            } else {
                message.error(response.msg || '提交失败，请重试');
            }
        } catch (error) {
            message.error('提交失败，请检查表单信息');
        }
    };


    return (
        <React.Fragment>
            <ProForm
                form={form} // 添加 form 属性，将表单实例传递给 ProForm
                grid//纵向排列
                onFinish={async (values) => {
                    const success = await onSubmit(values as DataSource);
                    if (success) {
                        message.success('提交成功');
                    } else {
                        message.error('提交失败');
                    }
                }}
                submitter={{
                    // 配置按钮文本
                    searchConfig: {
                        resetText: '取消',
                        submitText: '确认',
                    },
                    // 配置按钮的属性
                    resetButtonProps: {
                        style: {
                            // 隐藏重置按钮
                            display: 'none',
                        },
                    },
                    submitButtonProps: {},

                    // 完全自定义整个区域
                    render: (props, doms) => {
                        console.log(props);
                        return [
                            <Button
                                type="button"
                                key="rest"
                                type="primary"
                                onClick={handleCancel}
                            >
                                取消
                            </Button>,
                            <Button
                                type="button"
                                key="submit"
                                type="primary"
                                onClick={handleSubmit}
                            >
                                提交
                            </Button>,
                        ];
                    },
                }}
            >
                <ProForm.Group>
                    <ProFormText
                        name="chineseName"
                        label="中文名称"
                        placeholder="请输入数据资产表名称"
                        rules={[{ required: true, message: '中文名称为必填项' }]}
                    />
                    <ProFormText
                        name="englishName"
                        label="英文名称"
                        placeholder="请输入数据资产表名称"
                        rules={[{ required: true, message: '英文名称为必填项' }]}
                    />
                    <ProFormText
                        name="description"
                        label="描述"
                        placeholder="请输入数据资产表描述"
                    />
                    <EditableProTable
                        rowKey="id"
                        headerTitle="所属目录"
                        maxLength={5}
                        scroll={{ x: 1500 }}
                        recordCreatorProps={
                            position !== 'hidden'
                                ? {
                                    position: position as 'top',
                                    record: (params = {}) => ({
                                        id: (Math.random() * 1000000).toFixed(0),
                                        ...params // 传递参数
                                    }),
                                }
                                : false
                        }
                        loading={false}
                        columns={CategoriesColumns}
                        request={async () => ({
                            data: dataSourceCategories,
                            total: 3,
                            success: true,
                        })}
                        value={dataSourceCategories}
                        onChange={setDataSourceCategories}
                        editable={{
                            type: 'multiple',
                            editableKeys: editableKeysCategories,
                            onSave: async (rowKey, data, row) => {
                                console.log(rowKey, data, row);
                                await new Promise((resolve) => setTimeout(resolve, 2000));
                            },
                            onChange: setEditableRowKeysCategories,
                        }}
                    />
                </ProForm.Group>
                <ProForm.Item
                    label="数据资产表字段添加数据"
                    name="dataSource"
                    // initialValue={defaultData}
                    trigger="onValuesChange"
                >
                    <EditableProTable
                        rowKey="id"
                        headerTitle="可编辑表格"
                        maxLength={5}
                        scroll={{ x: 1500 }}
                        recordCreatorProps={
                            position !== 'hidden'
                                ? {
                                    position: position as 'top',
                                    record: (params = {}) => ({
                                        id: (Math.random() * 1000000).toFixed(0),
                                        ...params // 传递参数
                                    }),
                                }
                                : false
                        }
                        loading={false}
                        columns={columns}
                        request={async () => ({
                            data: dataSourceFields,
                            total: 3,
                            success: true,
                        })}
                        value={dataSourceFields}
                        onChange={setDataSourceFields}
                        editable={{
                            type: 'multiple',
                            editableKeys: editableKeysFields,
                            onSave: async (rowKey, data, row) => {
                                console.log(rowKey, data, row);
                                await new Promise((resolve) => setTimeout(resolve, 2000));
                            },
                            onChange: setEditableRowKeysFields,
                        }}
                    />
                </ProForm.Item>
            </ProForm>
        </React.Fragment>
    );
};

export default AddDataAsset;