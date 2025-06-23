import { getCodeTablesApi, updateCodeTableStatusApi, delCodeTableApi, getCodeTableApi, addCodeTableApi, updateCodeTableApi, importCodeTableApi } from '@/service/CodeTable';
import {
    ActionType,
    PageContainer,
    ProDescriptions,
    ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message, Modal, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import AddCodeTable from './AddCodeTable';
import UpdateCodeTable from './UpdateCodeTable';

// 码表数据
interface DataSource {
    id: number;
    dictCode: string;
    dictName: string;
    description: string | null;
    status: number;
    updateTime: string;
}

// 码表详情数据
interface CodeTableDetail {
    id: number;
    dictCode: string;
    dictName: string;
    description: string | null;
    status: number;
    updateTime: string;
    dictDataList: {
        id: number;
        dictLabel: string;
        dictValue: string;
        description: string | null;
    }[];
}

const TableList: React.FC<unknown> = () => {
    const [createModalVisible, handleModalVisible] = useState<boolean>(false); // 新增码表
    const [detailModalVisible, handleDetailModalVisible] = useState<boolean>(false); // 查看码表详情
    const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
    const [stepFormValues, setStepFormValues] = useState<Partial<DataSource>>({});
    const actionRef = useRef<ActionType>();
    const [row, setRow] = useState<DataSource>();
    const [selectedRowsState, setSelectedRows] = useState<DataSource[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
    const [codeTableDetail, setCodeTableDetail] = useState<CodeTableDetail | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);//上传码表

    // 创建一个引用
    const addCodeTableRef = useRef<{ resetForm: () => void } | null>(null);
    /**
     * 新增码表
     * @param fields
     */
    const handleAdd = async (fields: DataSource) => {
        const hide = message.loading('正在添加');
        try {
            const response = await addCodeTableApi(fields);
            if (response.code === 100200) {
                hide();
                message.success('添加成功');
                handleModalVisible(false);
                actionRef.current?.reload();
                // 调用子组件的重置方法
                if (addCodeTableRef.current) {
                    addCodeTableRef.current.resetForm();
                }
                return true;
            } else {
                hide();
                message.error(response.msg || '添加失败，请重试');
                return false;
            }
        } catch (error) {
            hide();
            message.error('添加失败，请重试');
            return false;
        }
    };

    /**
     * 修改码表信息
     * @param fields
     */
    const handleUpdate = async (fields: DataSource) => {
        const hide = message.loading('正在修改码表');
        try {
            const response = await updateCodeTableApi(fields);
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
     * 删除码表
     * @param selectedRows
     */
    const handleRemove = async (selectedRows: DataSource[]) => {
        const hide = message.loading('正在删除');
        if (!selectedRows) return true;
        try {
            const id = selectedRows.find((row) => row.id)?.id;
            if (id) {
                const response = await delCodeTableApi({ id });
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
     * 发布码表
     * @param selectedRows
     */
    const handlePublish = async (selectedRows: DataSource[]) => {
        const hide = message.loading('正在发布');
        try {
            const ids = selectedRows.map((row) => row.id);
            const response = await updateCodeTableStatusApi({
                ids: ids,
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
     * 停用码表
     * @param selectedRows
     */
    const handleDisable = async (selectedRows: DataSource[]) => {
        const hide = message.loading('正在停用');
        try {
            const ids = selectedRows.map((row) => row.id);
            const response = await updateCodeTableStatusApi({
                ids: ids,
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
     * 查看码表详情
     * @param id
     */
    const handleGetCode = async (id: number) => {
        const hide = message.loading('正在查看码表详情');
        try {
            const response = await getCodeTableApi({ id });
            if (response.code === 100200) {
                hide();
                message.success('查看码表详情成功');
                return response.data;
            } else {
                hide();
                message.error(response.msg || '查看码表详情失败，请重试');
                return null;
            }
        } catch (error) {
            hide();
            message.error('查看失败，请重试');
            return null;
        }
    };

    /**
     * 上传码表
     * @param id
     */
    const handleFileUpload = async () => {
        if (fileInputRef.current) {
            const files = fileInputRef.current.files;
            if (files && files.length > 0) {
                const file = files[0];
                const formData = new FormData();
                formData.append('file', file);

                const hide = message.loading('正在上传码表...');
                try {
                    const response = await importCodeTableApi(formData);
                    hide();
                    if (response.code === 100200) {
                        message.success('码表上传成功');
                        actionRef.current?.reload(); // 上传成功后刷新表格
                    } else {
                        message.error(response.msg || '码表上传失败，请重试');
                    }
                } catch (error) {
                    hide();
                    message.error('码表上传失败，请重试');
                }
            }
        }
    };

    // 检查所选码表状态，返回按钮的禁用状态
    const checkSelectedStatus = () => {
        const allPublished = selectedRowsState.every(row => row.status === 1);
        const allDisabled = selectedRowsState.every(row => row.status === 2);
        const hasBothStatus = selectedRowsState.some(row => row.status === 1) && selectedRowsState.some(row => row.status === 2);

        if (hasBothStatus) {
            message.warning('不能同时选择已发布和已停用的码表');
        }

        return {
            publishDisabled: allPublished || hasBothStatus,
            disableDisabled: allDisabled || hasBothStatus
        };
    };

    const { publishDisabled, disableDisabled } = checkSelectedStatus();

    const columns = [
        {
            title: '码表编号',
            dataIndex: 'dictCode',
            hideInSearch: true,
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
                    onClick={async (e) => {
                        e.preventDefault();
                        const detail = await handleGetCode(record.id);
                        if (detail) {
                            setCodeTableDetail(detail);
                            handleDetailModalVisible(true);
                        }
                    }}
                >
                    {text}
                </a>
            ),
        },
        {
            title: '码表名称',
            dataIndex: 'dictName',
            valueType: 'text' as const,
        },
        {
            title: '码表说明',
            dataIndex: 'description',
            valueType: 'text' as const,
            hideInSearch: true,
        },
        {
            title: '码表状态',
            dataIndex: 'status',
            valueType: 'select',
            hideInSearch: false,
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
                                const response = await getCodeTableApi({ id: record.id });
                                if (response.code === 100200) {
                                    setStepFormValues(response.data);
                                } else {
                                    message.error(response.msg || '获取码表信息失败，请重试');
                                }
                            }}
                            style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
                        >
                            编辑
                        </a>
                    ) : null}
                    {record.status === 0 || record.status === 2 ? (
                        <Popconfirm
                            title="确定要发布这个码表吗？"
                            onConfirm={(e) => {
                                e.preventDefault();
                                handlePublish([record]);
                                actionRef.current?.reload();
                            }}
                            okText="确定"
                            cancelText="取消"
                        >
                            <a
                                style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
                            >
                                发布
                            </a>
                        </Popconfirm>
                    ) : null}
                    {record.status === 1 ? (
                        <Popconfirm
                            title="确定要停用这个码表吗？"
                            onConfirm={(e) => {
                                e.preventDefault();
                                handleDisable([record]);
                                actionRef.current?.reload();
                            }}
                            okText="确定"
                            cancelText="取消"
                        >
                            <a
                                style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
                            >
                                停用
                            </a>
                        </Popconfirm>
                    ) : null}
                    {record.status === 0 ? (
                        <Popconfirm
                            title="确定要删除这个码表吗？"
                            onConfirm={() => handleRemove([record])}
                            okText="确定"
                            cancelText="取消"
                        >
                            <a style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}>
                                删除
                            </a>
                        </Popconfirm>
                    ) : null}
                </>
            ),
        },
    ];

    return (
        <PageContainer
            header={{
                title: '码表管理',
            }}
        >
            {/* 修改码表信息 */}
            {Object.keys(stepFormValues).length > 0 && (
                <UpdateCodeTable
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
                scroll={{ y: 500 }}//设置纵向大小
                actionRef={actionRef}
                rowKey="id"
                toolBarRender={() => [
                    <div key="batch-operations" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginRight: 16 }}>
                        <>
                            <Popconfirm
                                title="确定要批量发布码表吗？"
                                onConfirm={async () => {
                                    const success = await handlePublish(selectedRowsState);
                                    if (success) {
                                        setSelectedRows([]);
                                        setSelectedRowKeys([]);
                                        actionRef.current?.reload();
                                    }
                                }}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button
                                    disabled={publishDisabled}
                                    style={{ marginRight: 8 }}
                                >
                                    批量发布
                                </Button>
                            </Popconfirm>
                            <Popconfirm
                                title="确定要批量停用码表吗？"
                                onConfirm={async () => {
                                    const success = await handleDisable(selectedRowsState);
                                    if (success) {
                                        setSelectedRows([]);
                                        setSelectedRowKeys([]);
                                        actionRef.current?.reload();
                                    }
                                }}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button
                                    disabled={disableDisabled}
                                >
                                    批量停用
                                </Button>
                            </Popconfirm>
                        </>
                    </div>,
                    <Button
                        key="1"
                        type="primary"
                        onClick={() => {
                            const downloadUrl = 'http://10.159.35.44:8082/dict/exportExcel';
                            window.open(downloadUrl, '_blank');
                        }}
                    >
                        码表模板下载
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
                        码表上传
                    </Button>,

                    <Button
                        key="3"
                        type="primary"
                        onClick={() => handleModalVisible(true)}
                    >
                        新增码表
                    </Button>,
                ]}
                request={async (params) => {
                    // console.log("码表数据请求参数",params);
                    const response = await getCodeTablesApi({
                        size: params.pageSize,
                        ...params,
                    });
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
            <AddCodeTable
                ref={addCodeTableRef} // 传递引用
                visible={createModalVisible}
                onCancel={() => handleModalVisible(false)}
                onSubmit={handleAdd}
            />
            {Object.keys(stepFormValues).length > 0 && (
                <UpdateCodeTable
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

            {/* 码表详情组件 */}
            <Modal
                title={codeTableDetail ? codeTableDetail.dictName : '码表详情'}
                visible={detailModalVisible}
                onCancel={() => {
                    handleDetailModalVisible(false);
                    setCodeTableDetail(null);
                }}
                // okText="关闭"
                footer={null}//控制左下角的取消、确定按钮
            >
                {codeTableDetail && (
                    <ProTable
                        dataSource={codeTableDetail.dictDataList}
                        columns={[
                            {
                                title: 'ID',
                                dataIndex: 'id',
                                hideInSearch: true,//隐藏搜索字段
                            },
                            {
                                title: '码值名称',
                                dataIndex: 'dictLabel',
                                hideInSearch: true,
                            },
                            {
                                title: '码值取值',
                                dataIndex: 'dictValue',
                                hideInSearch: true,
                            },
                            {
                                title: '码值含义',
                                dataIndex: 'description',
                                hideInSearch: true,
                            },
                        ]}
                        pagination={false}
                        options={false}
                        search={false}
                    />
                )}
            </Modal>
        </PageContainer>
    );
};

export default TableList;