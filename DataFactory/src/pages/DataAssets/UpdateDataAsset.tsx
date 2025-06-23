import React, { useState, useEffect } from 'react';
import { Form, message, Button } from 'antd';
import { ProForm, ProFormText, EditableProTable } from '@ant-design/pro-components';
import { useNavigate, useParams } from 'umi';
import { updateDataAssetApi, getDataAssetApi } from '@/service/DataAssets';
import { getCategoriesApi } from '@/service/Categories';
import { getCodeTablesApi } from '@/service/CodeTable';

interface DataStandardVO {
    id: number;
    standardCode: string;
    chineseName: string;
    // 其他可能的属性...
}
interface DataAssetField {
    id:number,
    englishName: string;
    chineseName: string;
    description: string;
    dataStandardId: number;
    dataStandardVO: DataStandardVO;
}
// 数据标准接口类型定义（假设已有）
interface DataSource {
    id:number;
    status:number;
    chineseName: string;
    englishName: string;
    description: string | null;
    classifyId: any;
    dataAssetFieldList: DataAssetField[];
}

const UpdateDataAsset: React.FC<{
    visible: boolean;
    onCancel: () => void;
    onSubmit: (fields: DataSource) => Promise<boolean>;
}> = ({ visible, onCancel, onSubmit }) => {
    const { id } = useParams(); // 获取路由参数中的数据资产ID
    const [editableKeysCategories, setEditableRowKeysCategories] = useState<React.Key[]>([]);
    const [dataSourceCategories, setDataSourceCategories] = useState<readonly any[]>([]);
    const [editableKeysFields, setEditableRowKeysFields] = useState<React.Key[]>([]);
    const [dataSourceFields, setDataSourceFields] = useState<readonly any[]>([]);
    const [dataSource, setDataSource] = useState<readonly any[]>([]);
    const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [codeTableOptions, setCodeTableOptions] = useState([]);
    const navigate = useNavigate();
    const handleCancel = () => {
        navigate(-1);
    };

    //获取数据资产分类
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategoriesApi({ type: 'asset' });
                if (response.code === 100200) {
                    const options = response.data.map(item => ({
                        value: item.id, // 这里用id作为唯一标识
                        label: item.name
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

    // 获取要编辑的数据资产详细信息
    useEffect(() => {
        const fetchDataAsset = async () => {
            try {
                // 假设这里有获取数据资产详细信息的API，根据ID获取数据
                // 这里只是示例，实际需要实现该API
                const response = await getDataAssetApi({ id });
                console.log("编辑数据资产数据", response);

                if (response.code === 100200) {
                    // 设置表单初始值
                    // setDataSourceCategories(response.data.classifyId.map(id => ({ id })));
                    const classifyId = response.data.classifyNameList.map(item => ({ id: item.classifyId, name: item.classifyName }))[0];
                    setDataSourceCategories([classifyId]);
                    setDataSourceFields(response.data.dataAssetFieldList);
                    form.setFieldsValue({
                        chineseName: response.data.chineseName,
                        englishName: response.data.englishName,
                        description: response.data.description
                    });
                    // 处理 dataAssetFieldList 数据
                const fields = response.data.dataAssetFieldList.map((item:any)=>({
                    ...item,
                    id:item.dataStandardId,
                }));
                const codeTableOptions = fields.map((field:any) => ({
                    value: field.dataStandardId,
                    label: `${field.dataStandardVO.standardCode} - ${field.dataStandardVO.chineseName}`
                }));
                setCodeTableOptions(codeTableOptions);

                setDataSourceFields(fields);
                } else {
                    message.error(response.msg || '获取数据资产信息失败1，请重试');
                }
            } catch (error) {
                message.error('获取数据资产信息失败2，请重试');
            }
        };

        if (id) {
            fetchDataAsset();
        }
    }, [id]);

    //分类目录数据
    const CategoriesColumns: any[] = [
        {
            title: '所属目录',
            dataIndex: 'name',
            valueType: 'select',
            fieldProps: {
                options: categoryOptions,
                valueEnum: {
                    // 这里可以根据你的需求进行调整
                    label: 'id',
                    value: 'name'
                }
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
            dataIndex: 'dataStandardId',
            valueType: 'select',
            width: '19%',
            fieldProps: {
                options: codeTableOptions,
                onDropdownVisibleChange: async (visible: any) => {
                    if (visible) {
                        try {
                            const response = await getCodeTablesApi();
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

    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log("表单数据", values);
            const requestData: DataSource = {
                id: id,
                status:status,
                chineseName: values.chineseName,
                englishName: values.englishName,
                description: values.description,
                // classifyId: [dataSourceCategories[0].id],
                classifyId: dataSourceCategories.map((item) => item.id),
                dataAssetFieldList: dataSourceFields.map(item => ({
                    chineseName: item.chineseName,
                    englishName: item.englishName,
                    description: item.description,
                    dataStandardId: item.dataStandardId
                }))
            };

            const response = await updateDataAssetApi(requestData);
            if (response.code === 100200) {
                message.success('更新成功');
                navigate(-1);
            } else {
                message.error(response.msg || '更新失败，请重试');
            }
        } catch (error) {
            message.error('更新失败，请检查表单信息');
        }
    };

    return (
        <React.Fragment>
            <ProForm
                form={form}
                grid
                onFinish={async (values) => {
                    const success = await onSubmit(values as DataSource);
                    if (success) {
                        message.success('提交成功');
                    } else {
                        message.error('提交失败');
                    }
                }}
                submitter={{
                    searchConfig: {
                        resetText: '取消',
                        submitText: '确认',
                    },
                    resetButtonProps: {
                        style: {
                            display: 'none',
                        },
                    },
                    submitButtonProps: {},
                    render: (props, doms) => {
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
                                        ...params
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
                                        ...params
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

export default UpdateDataAsset;