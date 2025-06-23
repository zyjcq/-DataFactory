import { getDataStandardsApi, updateDataStandardStatusApi, delDataStandardApi, getDataStandardApi, addDataStandardApi, updateDataStandardApi, importDataStandardApi } from '@/service/DataStandardDirectory';
import {
    ActionType,
    FooterToolbar,
    PageContainer,
    ProDescriptions,
    ProTable,
} from '@ant-design/pro-components';
import { Button, Divider, Drawer, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import AddDataStandard from './AddDataStandard';
import UpdateDataStandard from './UpdateDataStandard';

// 数据标准
interface DataSource {
    id: number;
    standardCode: string;
    chineseName: string;
    englishName: string;
    description: string | null;
    institution: string;
    dataType: 'String' | 'Int' | 'Float' | 'Enum';
    defaultValue: string | null;
    length: number | null;
    dataAccuracy: number | null;
    min: string | null;
    max: string | null;
    dictId: number | null;
    dictName: string | null;
    notNull: string | null;
    status: 0 | 1 | 2;
    deleted: 0 | 1;
    createBy: string | null;
    createTime: string;
    updateTime: string;
}

const TableList: React.FC<unknown> = () => {
    const [createModalVisible, handleModalVisible] = useState<boolean>(false); // 新增数据标准
    const [detailModalVisible, handleDetailModalVisible] = useState<boolean>(false); // 查看数据标准详情
    const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
    const [stepFormValues, setStepFormValues] = useState<Partial<DataSource>>({});
    const actionRef = useRef<ActionType>();
    const [row, setRow] = useState<DataSource>();
    const [selectedRowsState, setSelectedRows] = useState<DataSource[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [DataStandardDetail, setDataStandardDetail] = useState<DataStandardDetail | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);//上传数据标准

    // 创建一个引用
    const addDataStandardRef = useRef<{ resetForm: () => void } | null>(null);
    /**
     * 新增数据标准
     * @param fields
     */
    const handleAdd = async (fields: DataSource) => {
        const hide = message.loading('正在添加');
        try {
            const response = await addDataStandardApi(fields);
            if (response.code === 100200) {
                hide();
                message.success('添加成功');
                handleModalVisible(false);
                actionRef.current?.reload();
                // 调用子组件的重置方法
                if (addDataStandardRef.current) {
                    addDataStandardRef.current.resetForm();
                }
                return true;
            } else {
                hide();
                message.error(response.msg || '添加失败，请重试');
                return false;
            }
        } catch (error) {
            hide();
            // message.error('添加失败，请重试');
            return false;
        }
    };

    /**
     * 修改数据标准信息
     * @param fields
     */
    const handleUpdate = async (fields: DataSource) => {
        const hide = message.loading('正在修改数据标准');
        try {
            const response = await updateDataStandardApi(fields);
            if (response.code === 100200) {
                hide();
                message.success('修改成功');
                handleUpdateModalVisible(false);
                setStepFormValues({});
                actionRef.current?.reload();
                return true;
            } else {
                hide();
                message.error(response.msg || '修改失败，请重试');
                return false;
            }
        } catch (error) {
            hide();
            message.error('修改失败，请重试');
            return false;
        }
    };

    /**
     * 删除数据标准
     * @param selectedRows
     */
    const handleRemove = async (selectedRows: DataSource[]) => {
        const hide = message.loading('正在删除');
        if (!selectedRows) return true;
        try {
            const id = selectedRows.find((row) => row.id)?.id;
            if (id) {
                const response = await delDataStandardApi({ id });
                if (response.code === 100200) {
                    hide();
                    message.success('删除成功，即将刷新');
                    actionRef.current?.reload();
                    return true;
                } else {
                    hide();
                    message.error(response.msg || '删除失败，请重试');
                    return false;
                }
            } else {
                hide();
                message.error('未找到有效的ID，请重试');
                return false;
            }
        } catch (error) {
            hide();
            message.error('删除失败，请重试');
            return false;
        }
    };

    /**
     * 发布数据标准
     * @param selectedRows
     */
    const handlePublish = async (selectedRows: DataSource[]) => {
        const hide = message.loading('正在发布');
        try {
            const ids = selectedRows.map((row) => row.id);
            const response = await updateDataStandardStatusApi({
                ids:ids,
                status: 1,
            });
            if (response.code === 100200) {
                hide();
                message.success('发布成功');
                actionRef.current?.reload();
                return true;
            } else {
                hide();
                message.error(response.msg || '发布失败，请重试');
                return false;
            }
        } catch (error) {
            hide();
            message.error('发布失败，请重试');
            return false;
        }
    };

    /**
     * 停用数据标准
     * @param selectedRows
     */
    const handleDisable = async (selectedRows: DataSource[]) => {
        const hide = message.loading('正在停用');
        try {
            const ids = selectedRows.map((row) => row.id);
            const response = await updateDataStandardStatusApi({
                ids:ids,
                status: 2, // 假设停用状态为 2，根据实际情况修改
            });
            if (response.code === 100200) {
                hide();
                message.success('停用成功');
                actionRef.current?.reload();
                return true;
            } else {
                hide();
                message.error(response.msg || '停用失败，请重试');
                return false;
            }
        } catch (error) {
            hide();
            message.error('停用失败，请重试');
            return false;
        }
    };

    /**
     * 查看数据标准详情
     * @param id
     */
    const handleGetCode = async (id: number) => {
        const hide = message.loading('正在查看数据标准详情');
        try {
            const response = await getDataStandardApi({ id });
            if (response.code === 100200) {
                hide();
                message.success('查看数据标准详情成功');
                return response.data;
            } else {
                hide();
                message.error(response.msg || '查看数据标准详情失败，请重试');
                return null;
            }
        } catch (error) {
            hide();
            message.error('查看失败，请重试');
            return null;
        }
    };

    /**
     * 上传数据标准
     * @param id
     */
    const handleFileUpload = async () => {
        if (fileInputRef.current) {
            const files = fileInputRef.current.files;
            if (files && files.length > 0) {
                const file = files[0];
                const formData = new FormData();
                formData.append('file', file);
                const hide = message.loading('正在上传数据标准...');
                try {
                    const response = await importDataStandardApi(formData);
                    hide();
                    if (response.code === 100200) {
                        message.success('数据标准上传成功');
                        actionRef.current?.reload(); // 上传成功后刷新表格
                    } else {
                        message.error(response.msg);//错误提示
                    }
                }
                catch (error) {
                    hide();
                    // message.error('数据标准上传失败，请重试');
                } finally {
                    //清空input元素中的value
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                }
            }
        }
    };

    // 检查所选数据标准状态，返回按钮的禁用状态
    const checkSelectedStatus = () => {
        const allPublished = selectedRowsState.every(row => row.status === 1);
        const allDisabled = selectedRowsState.every(row => row.status === 2);
        const hasBothStatus = selectedRowsState.some(row => row.status === 1) && selectedRowsState.some(row => row.status === 2);

        if (hasBothStatus) {
            message.warning('不能同时选择已发布和已停用的数据标准');
        }

        return {
            publishDisabled: allPublished || hasBothStatus,
            disableDisabled: allDisabled || hasBothStatus
        };
    };

    const { publishDisabled, disableDisabled } = checkSelectedStatus();

    const columns = [
        {
            title: '标准编号',
            dataIndex: 'standardCode',
            // hideInSearch: true,
            tip: '标准编号系统自动生成唯一性编号',
            formItemProps: {
                rules: [
                    {
                        required: true,
                        message: '名称为必填项',
                    },
                ],
            },
            valueType: 'text' as const,
            render: (text: any, record: any) => (
                <a
                    href=""
                    onClick={async (e) => {
                        e.preventDefault();
                        const detail = await handleGetCode(record.id);
                        if (detail) {
                            setDataStandardDetail(detail);
                            handleDetailModalVisible(true);
                        }
                    }}
                >
                    {text}
                </a>
            ),
        },
        {
            title: '中文名称',
            dataIndex: 'chineseName',
            valueType: 'text' as const,
        },
        {
            title: '英文名称',
            dataIndex: 'englishName',
            valueType: 'text' as const,
        },
        {
            title: '标准说明',
            dataIndex: 'description',
            valueType: 'text' as const,
            hideInSearch: true,
        },
        {
            title: '来源机构',
            dataIndex: 'institution',
            valueType: 'text' as const,
            hideInSearch: true,
        },
        {
            title: '数据类型',
            dataIndex: 'dataType',
            valueType: 'text' as const,
            hideInSearch: true,
        },
        {
            title: '数据长度',
            dataIndex: 'length',
            valueType: 'text' as const,
            hideInSearch: true,
        },
        {
            title: '数据精度',
            dataIndex: 'dataAccuracy',
            valueType: 'text' as const,
            hideInSearch: true,
        },
        {
            title: '默认值',
            dataIndex: 'defaultValue',
            valueType: 'text' as const,
            hideInSearch: true,
        },
        {
            title: '取值范围',
            dataIndex: 'minmax',
            hideInSearch: true,
            render: (text, a) => {
                console.log(text, a);
                return <span>{a.min}-{a.max}</span>
            }
        },
        {
            title: '枚举范围',
            dataIndex: 'dictName',
            valueType: 'text' as const,
            hideInSearch: true,
        },
        {
            title: '是否可为空',
            dataIndex: 'notNull',
            valueType: 'select',
            hideInSearch: true,
            fieldProps: {
                options: [
                    { label: '不可为空', value: 'Y' },
                    { label: '可为空', value: 'N' },
                ],
            },
        },
        {
            title: '标准状态',
            dataIndex: 'status',
            valueType: 'select',
            // hideInSearch: false,
            fieldProps: {
                options: [
                    { label: '未发布', value: 0 },
                    { label: '已发布', value: 1 },
                    { label: '已停用', value: 2 },
                ],
            },
        },
        {
            title: '更新时间',
            dataIndex: 'updateTime',
            valueType: 'text' as const,
            hideInSearch: true,
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option' as const,
            render: (_: unknown, record: DataSource) => (
                <>
                    {record.status === 0 || record.status === 2 ? (
                        <a
                            onClick={async () => {
                                handleUpdateModalVisible(true);
                                const response = await getDataStandardApi({ id: record.id });
                                if (response.code === 100200) {
                                    // 确保数据包含所有需要的字段，没有的值设为空字符串或 null
                                    const data = {
                                        id: response.data.id,
                                        chineseName: response.data.chineseName || "",
                                        englishName: response.data.englishName || "",
                                        description: response.data.description || null,
                                        institution: response.data.institution || "",
                                        dataType: response.data.dataType || "",
                                        length: response.data.length || null,
                                        dataAccuracy: response.data.dataAccuracy || null,
                                        min: response.data.min || null,
                                        max: response.data.max || null,
                                        dictId: response.data.dictId || null,
                                        notNull: response.data.notNull || null,
                                        defaultValue: response.data.defaultValue || null,
                                    };
                                    setStepFormValues(data);
                                    console.log('设置的 stepFormValues:', data);
                                } else {
                                    message.error(response.msg || '获取数据标准信息失败，请重试');
                                }
                            }}
                            style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
                        >
                            编辑
                        </a>
                    ) : null}
                    {record.status === 0 || record.status === 2 ? (
                        <a
                            href=""
                            onClick={(e) => {
                                e.preventDefault();
                                handlePublish([record]);
                                actionRef.current?.reload();
                            }}
                            style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
                        >
                            发布
                        </a>
                    ) : null}
                    {record.status === 1 ? (
                        <a
                            href=""
                            onClick={(e) => {
                                e.preventDefault();
                                handleDisable([record]);
                                actionRef.current?.reload();
                            }}
                            style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
                        >
                            停用
                        </a>
                    ) : null}
                    {record.status === 0 ? (
                        <a onClick={() => handleRemove([record])}
                            style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
                        >删除</a>
                    ) : null}

                </>
            ),
        },
    ];

    return (
        <PageContainer
            header={{
                title: '数据标准目录管理',
            }}
        >
            {/* 修改数据标准信息 */}
            {Object.keys(stepFormValues).length > 0 && (
                <UpdateDataStandard
                    visible={updateModalVisible}
                    values={stepFormValues}
                    onSubmit={handleUpdate}
                    onCancel={() => {
                        handleUpdateModalVisible(false);
                        setStepFormValues({});
                    }}
                />
            )}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
            />
            <ProTable<DataSource>
                headerTitle="查询表格"
                actionRef={actionRef}
                rowKey="id"
                scroll={{ x: 1000 }}
                toolBarRender={() => [
                    <div key="batch-operations" style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
                        {selectedRowsState.length > 0 && (
                            <>
                                <Button
                                    disabled={publishDisabled}
                                    onClick={async () => {
                                        const success = await handlePublish(selectedRowsState);
                                        if (success) {
                                          setSelectedRows([]);
                                          setSelectedRowKeys([]);
                                          actionRef.current?.reload();
                                        }
                                      }}
                                    style={{ marginRight: 8 }}
                                >
                                    批量发布
                                </Button>
                                <Button
                                    disabled={disableDisabled}
                                    onClick={async () => {
                                        const success = await handleDisable(selectedRowsState);
                                        if (success) {
                                          setSelectedRows([]);
                                          setSelectedRowKeys([]);
                                          actionRef.current?.reload();
                                        }
                                      }}
                                >
                                    批量停用
                                </Button>        </>
                        )}
                    </div>,
                    <Button
                        key="1"
                        type="primary"
                        onClick={() => {
                            const downloadUrl = 'http://10.159.0.224:8081/dataStandard/exportExcel';
                            window.open(downloadUrl, '_blank');
                        }}
                    >
                        数据标准模板下载
                    </Button>,
                    <Button
                        key="2"
                        type="primary"
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.click();
                            }
                        }}
                    >
                        数据标准上传
                    </Button>,
                    <Button
                        key="3"
                        type="primary"
                        onClick={() => handleModalVisible(true)}
                    >
                        新增数据标准
                    </Button>,
                ]}
                request={async (params) => {
                    // console.log("数据标准数据请求参数",params);
                    const response = await getDataStandardsApi({
                        size: params.pageSize,
                        ...params,
                    });

                    // console.log("数据标准列表",response);
                    if (response.code === 100200) {

                        return {
                            data: response.data.records,
                            success: true,
                            total: response.data.total,
                        };
                    } else {
                        message.error('获取数据失败');
                        return {
                            data: [],
                            success: false,
                            total: 0,
                        };
                    }
                }}
                columns={columns}
                rowSelection={{
                    onChange: (selectedKeys, selectedRows) => {
                        setSelectedRowKeys(selectedKeys.map(key => Number(key)));
                        setSelectedRows(selectedRows);
                    },
                    selectedRowKeys,
                }}
                pagination={{
                    // pageSize: 20,//设置默认每页显示20条数据
                    showSizeChanger: true,//显示每页条数选择器
                    showQuickJumper: true,// 显示快速跳转输入框
                    showTotal: (total) => `共 ${total} 条`,//显示总条数
                    pageSizeOptions: ['10', '20', '50', '100'],//每页条数选项
                    showLessItems: true,//当页数大于5时，只显示当前页和前后2页
                    showPrevNextJumpers: true,//显示上一页/下一页跳转按钮
                }}
                options={false}//table 工具栏
            />
            {/* {selectedRowsState?.length > 0 && (
                <FooterToolbar
                    extra={
                        <div>
                            已选择{' '}
                            <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
                            项&nbsp;&nbsp;
                        </div>
                    }
                >
                    <Button
                        disabled={publishDisabled}
                        onClick={async () => {
                            const success = await handlePublish(selectedRowsState);
                            if (success) {
                                setSelectedRows([]);
                                setSelectedRowKeys([]);
                                actionRef.current?.reload();
                            }
                        }}
                    >
                        批量发布
                    </Button>
                    <Button
                        disabled={disableDisabled}
                        onClick={async () => {
                            const success = await handleDisable(selectedRowsState);
                            if (success) {
                                setSelectedRows([]);
                                setSelectedRowKeys([]);
                                actionRef.current?.reload();
                            }
                        }}
                    >
                        批量停用
                    </Button>
                </FooterToolbar>
            )} */}
            <AddDataStandard
                ref={addDataStandardRef} // 传递引用
                visible={createModalVisible}
                onCancel={() => handleModalVisible(false)}
                onSubmit={handleAdd}
            />
            {Object.keys(stepFormValues).length > 0 && (
                <UpdateDataStandard
                    visible={updateModalVisible} // 使用 visible 属性
                    onSubmit={async (value) => {
                        const success = await handleUpdate(value);
                        if (success) {
                            handleUpdateModalVisible(false);
                            setStepFormValues({});
                            if (actionRef.current) {
                                actionRef.current.reload();
                            }
                        }
                    }}
                    onCancel={() => {
                        handleUpdateModalVisible(false);
                        setStepFormValues({});
                    }}
                    // updateModalVisible={updateModalVisible}
                    values={stepFormValues}
                />
            )}

            <Drawer
                width={600}
                open={!!row}
                onClose={() => {
                    setRow(undefined);
                }}
                closable={false}
            >
                {row?.dictName && (
                    <ProDescriptions<DataSource>
                        column={2}
                        title={row?.dictName}
                        request={async () => ({
                            data: row || {},
                        })}
                        params={{
                            id: row?.id,
                        }}
                        columns={columns}
                    />
                )}
            </Drawer>

            {/* 数据标准详情组件 */}
            <Modal
                title={DataStandardDetail ? DataStandardDetail.dictName : '数据标准详情'}
                visible={detailModalVisible}
                onCancel={() => {
                    handleDetailModalVisible(false);
                    setDataStandardDetail(null);
                }}
                okText="关闭"
            >
                {DataStandardDetail && (
                    <ProDescriptions
                        column={1} // 设置为1列，纵向排列
                        title={DataStandardDetail.dictName}
                        data={DataStandardDetail} // 直接传入数据对象
                    >
                        <ProDescriptions.Item label="标准编号">{DataStandardDetail.standardCode}</ProDescriptions.Item>
                        <ProDescriptions.Item label="中文名称">{DataStandardDetail.chineseName}</ProDescriptions.Item>
                        <ProDescriptions.Item label="英文名称">{DataStandardDetail.englishName}</ProDescriptions.Item>
                        <ProDescriptions.Item label="标准说明">{DataStandardDetail.description || '-'}</ProDescriptions.Item>
                        <ProDescriptions.Item label="来源机构">{DataStandardDetail.institution}</ProDescriptions.Item>
                        <ProDescriptions.Item label="数据类型">{DataStandardDetail.dataType}</ProDescriptions.Item>
                        <ProDescriptions.Item label="数据长度">{DataStandardDetail.length || '-'}</ProDescriptions.Item>
                        <ProDescriptions.Item label="数据精度">{DataStandardDetail.dataAccuracy || '-'}</ProDescriptions.Item>
                        <ProDescriptions.Item label="默认值">{DataStandardDetail.defaultValue || '-'}</ProDescriptions.Item>
                        <ProDescriptions.Item label="取值范围">{DataStandardDetail.min}-{DataStandardDetail.max}</ProDescriptions.Item>
                        <ProDescriptions.Item label="枚举范围">{DataStandardDetail.dictName || '-'}</ProDescriptions.Item>
                        <ProDescriptions.Item label="是否可为空">{DataStandardDetail.notNull === 'Y' ? '不可为空' : '可为空'}</ProDescriptions.Item>
                        <ProDescriptions.Item label="标准状态">{DataStandardDetail.status === 0 ? '未发布' : DataStandardDetail.status === 1 ? '已发布' : '已停用'}</ProDescriptions.Item>
                        <ProDescriptions.Item label="更新时间">{DataStandardDetail.updateTime}</ProDescriptions.Item>
                    </ProDescriptions>
                )}
            </Modal>
        </PageContainer>
    );
};
export default TableList;

