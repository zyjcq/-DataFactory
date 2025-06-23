import { getDataBasesApi, updateDataBaseApi, getDataBaseApi, updateDataBaseStatusApi, delDataBaseApi, addDataBaseApi, updateDataBasesStatusApi, connectDataBaseApi } from '@/service/DataBase';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Divider, Drawer, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import AddDataBase from './AddDataBase';
import UpdateDataBase from './UpdateDataBase';

// 数据库数据
interface DataSource {
  id: number;
  type: string;
  name: string;
  description: string | null;
  jdbcUrl: number;
  status: 0 | 1 | 2;
  updateTime: string;
  password: string;
}

// 数据库详情数据
interface DataBaseDetail {
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
  const [createModalVisible, handleModalVisible] = useState<boolean>(false); // 新增数据库
  // const addDataBaseRef = useRef<{ resetForm: () => void } | null>(null);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState<Partial<DataSource>>({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<DataSource>();
  const [selectedRowsState, setSelectedRows] = useState<DataSource[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [codeTableDetail, setDataBaseDetail] = useState<DataBaseDetail | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);//上传数据库

  // 创建一个引用
  const addDataBaseRef = useRef<{ resetForm: () => void } | null>(null);
  /**
   * 新增数据库
   * @param fields
   */
  const handleAdd = async (fields: DataSource) => {
    const hide = message.loading('正在添加');
    try {
      const response = await addDataBaseApi(fields);
      if (response.code === 100200) {
        hide();
        message.success('添加成功');
        handleModalVisible(false);
        actionRef.current?.reload();
        // 调用子组件的重置方法
        if (addDataBaseRef.current) {
          addDataBaseRef.current.resetForm();
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
   * 修改数据库信息
   * @param fields
   */
  const handleUpdate = async (fields: DataSource & { id: number }) => {
    const hide = message.loading('正在修改数据库');
    try {
      const response = await updateDataBaseApi(fields);
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
   * 删除数据库
   * @param selectedRows
   */
  const handleRemove = async (selectedRows: DataSource[]) => {
    const hide = message.loading('正在删除');
    if (!selectedRows) return true;
    try {
      const id = selectedRows.find((row) => row.id)?.id;
      if (id) {
        const response = await delDataBaseApi({ id });
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
   * 发布数据库
   * @param selectedRows
   */
  const handlePublish = async (selectedRows: DataSource[]) => {
    const hide = message.loading('正在发布');
    try {
      const ids = selectedRows.map((row) => row.id);
      const response = await updateDataBasesStatusApi({
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
   * 停用数据库
   * @param selectedRows
   */
  const handleDisable = async (selectedRows: DataSource[]) => {
    const hide = message.loading('正在停用');
    try {
      const ids = selectedRows.map((row) => row.id);
      const response = await updateDataBasesStatusApi({
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
 * 联通测试
 * @param record
 */
  const handleConnectTest = async (record: any) => {
    const hide = message.loading('正在进行联通测试');
    try {
      // 构建传递给接口的参数
      const params = {
        description: record.description || "",
        id: record.id,
        jdbcUrl: record.jdbcUrl,
        name: record.name,
        password: record.password || "",
        type: record.type,
        username: record.username,
      };
      const response = await connectDataBaseApi(params);
      if (response.code === 100200) {
        hide();
        message.success('联通测试成功');
      } else {
        hide();
        message.error(response.msg || '联通测试失败，请重试');
      }
    } catch (error) {
      hide();
      message.error('联通测试失败，请重试');
    }
  };

  // 检查所选数据库状态，返回按钮的禁用状态
  const checkSelectedStatus = () => {
    const allPublished = selectedRowsState.every(row => row.status === 1);
    const allDisabled = selectedRowsState.every(row => row.status === 2);
    const hasBothStatus = selectedRowsState.some(row => row.status === 1) && selectedRowsState.some(row => row.status === 2);

    if (hasBothStatus) {
      message.warning('不能同时选择已发布和已停用的数据库');
    }

    return {
      publishDisabled: allPublished || hasBothStatus,
      disableDisabled: allDisabled || hasBothStatus
    };
  };

  const { publishDisabled, disableDisabled } = checkSelectedStatus();

  const columns = [
    {
      title: '数据源名称',
      dataIndex: 'name',
      valueType: 'text' as const,
    },
    {
      title: '数据库类型',
      dataIndex: 'type',
      valueType: 'text' as const,
      hideInSearch: true,
    },
    {
      title: '数据库说明',
      dataIndex: 'description',
      valueType: 'text' as const,
      hideInSearch: true,
    },
    {
      title: '连接信息',
      dataIndex: 'jdbcUrl',
      valueType: 'text' as const,
      hideInSearch: true,
    },
    {
      title: '数据库状态',
      dataIndex: 'status',
      valueType: 'select',
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
          <a onClick={(e) => {
            e.preventDefault();
            handleConnectTest(record);
          }}
            style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
          >联通测试</a>
          {record.status === 0 || record.status === 2 ? (
            <a
              onClick={async () => {
                handleUpdateModalVisible(true);
                const response = await getDataBaseApi({ id: record.id });
                if (response.code === 100200) {
                  setStepFormValues(response.data);
                } else {
                  message.error(response.msg || '获取数据库信息失败，请重试');
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
        title: '数据库管理',
      }}
    >
      {/* 修改数据库信息 */}
      {Object.keys(stepFormValues).length > 0 && (
        <UpdateDataBase
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
      // onChange={handleFileUpload}
      />
      <ProTable<DataSource>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
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
            onClick={() => handleModalVisible(true)}
          >
            新增数据库
          </Button>,
        ]}
        request={async (params) => {
          // console.log("数据库数据请求参数",params);
          const response = await getDataBasesApi({
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
      <AddDataBase
        ref={addDataBaseRef} // 传递引用
        visible={createModalVisible}
        onCancel={() => handleModalVisible(false)}
        onSubmit={handleAdd}
      />
      {Object.keys(stepFormValues).length > 0 && (
        <UpdateDataBase
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
    </PageContainer>
  );
};

export default TableList;