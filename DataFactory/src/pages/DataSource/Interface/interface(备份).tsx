import { getInterfacesApi, updateInterfaceStatusApi, delInterfaceApi, getInterfaceApi, addInterfaceApi, updateInterfaceApi } from '@/service/Interface';
import { getCategoriesApi, addCategoriesApi, delCategoriesApi } from '@/service/Categories'
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Divider, Drawer, message, Modal, Input } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import AddInterface from './AddInterface';
import UpdateInterface from './UpdateInterface';
import { Tree } from 'antd';

// 接口数据
interface DataSource {
  classifyId: number,
  classifyName: string,
  description: string,
  id: number,
  inputParam: [],
  inputParamBody: [],
  interfaceName: string,
  ipAndPort: string,
  outputParam: [],
  path: string,
  protocol: string,
  requestMethod: string,
  source: string,
  status: number,
  timeout: number,
  updateTime: string
}

// 接口详情数据
interface InterfaceDetail {
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
  const [createModalVisible, handleModalVisible] = useState<boolean>(false); // 新增接口
  const [detailModalVisible, handleDetailModalVisible] = useState<boolean>(false); // 查看接口详情
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState<Partial<DataSource>>({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<DataSource>();
  const [selectedRowsState, setSelectedRows] = useState<DataSource[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [codeTableDetail, setInterfaceDetail] = useState<InterfaceDetail | null>(null);
  const [categoryTreeData, setCategoryTreeData] = useState([]);//获取分类目录
  const [addSubCategoryModalVisible, setAddSubCategoryModalVisible] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState('');

  // 创建一个引用
  const addInterfaceRef = useRef<{ resetForm: () => void } | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesApi({ type: 'interface' });
        if (response.code === 100200) {
          setCategoryTreeData(response.data);
        } else {
          message.error(response.msg || '获取接口分类数据失败，请重试');
        }
      } catch (error) {
        message.error('获取接口分类数据失败，请重试');
      }
    };

    fetchCategories();
  }, []);
  const [parentIdForSubCategory, setParentIdForSubCategory] = useState<number | null>(null);

  const handleAddSubCategory = (parentId) => {
    setAddSubCategoryModalVisible(true);
    setParentIdForSubCategory(parentId);
  };

  const getLevelByParentId = (parentId: any) => {
    // 假设 categoryTreeData 是包含分类树数据的状态
    const parentNode = categoryTreeData.find(node => node.id === parentId);
    if (parentNode) {
      return parentNode.level + 1; // 假设层级是可直接获取的属性，根据实际情况调整
    }
    return 1; // 默认层级为1，如果未找到父级节点
  };
  // 处理添加子分类确认操作
  const handleAddSubCategoryConfirm = async () => {
    if (!newSubCategoryName) {
      message.error('请输入子分类名称');
      return;
    }
    const hide = message.loading('正在添加子分类...');
    const parentId = parentIdForSubCategory;
    if (!parentId) {
      hide();
      message.error('未获取到父分类ID，请重试');
      return;
    }
    // 假设子分类层级为父级层级+1，这里需要根据实际数据结构来确定层级计算方式
    const level = getLevelByParentId(parentId);
    // 这里需要实现一个函数 getLevelByParentId 来根据parentId获取父级的层级
    const requestData = {
      name: newSubCategoryName,
      level,
      parentId,
      type: 'interface', // 根据接口文档，这里是接口分类，可根据实际情况调整
    };
    try {
      const response = await addCategoriesApi(requestData);
      if (response.code === 100200) {
        hide();
        message.success('子分类添加成功');
        setAddSubCategoryModalVisible(false);
        setNewSubCategoryName('');
        setParentIdForSubCategory(null);
        const newResponse = await getCategoriesApi({ type: 'interface' });
        if (newResponse.code === 100200) {
          setCategoryTreeData(newResponse.data);
        }
      } else {
        hide();
        message.error(response.msg || '子分类添加失败，请重试');
      }
    } catch (error) {
      hide();
      message.error('子分类添加失败，请重试');
    }
  };


  /**
   * 新增接口
   * @param fields
   */
  const handleAdd = async (fields: DataSource) => {
    const hide = message.loading('正在添加');
    try {
      const response = await addInterfaceApi(fields);
      if (response.code === 100200) {
        hide();
        message.success('添加成功');
        handleModalVisible(false);
        actionRef.current?.reload();
        // 调用子组件的重置方法
        if (addInterfaceRef.current) {
          addInterfaceRef.current.resetForm();
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
   * 修改接口信息
   * @param fields
   */
  const handleUpdate = async (fields: DataSource) => {
    const hide = message.loading('正在修改接口');
    try {
      const response = await updateInterfaceApi(fields);
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
   * 删除接口
   * @param selectedRows
   */
  const handleRemove = async (selectedRows: DataSource[]) => {
    const hide = message.loading('正在删除');
    if (!selectedRows) return true;
    try {
      const id = selectedRows.find((row) => row.id)?.id;
      if (id) {
        const response = await delInterfaceApi({ id });
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
   * 发布接口
   * @param selectedRows
   */
  const handlePublish = async (selectedRows: DataSource[]) => {
    const hide = message.loading('正在发布');
    try {
      const ids = selectedRows.map((row) => row.id).join(',');
      const response = await updateInterfaceStatusApi({
        ids,
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
   * 停用接口
   * @param selectedRows
   */
  const handleDisable = async (selectedRows: DataSource[]) => {
    const hide = message.loading('正在停用');
    try {
      const ids = selectedRows.map((row) => row.id).join(',');
      const response = await updateInterfaceStatusApi({
        ids,
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
   * 查看接口详情
   * @param id
   */
  const handleGetCode = async (id: number) => {
    const hide = message.loading('正在查看接口详情');
    try {
      const response = await getInterfaceApi({ id });
      if (response.code === 100200) {
        hide();
        message.success('查看接口详情成功');
        return response.data;
      } else {
        hide();
        message.error(response.msg || '查看接口详情失败，请重试');
        return null;
      }
    } catch (error) {
      hide();
      message.error('查看失败，请重试');
      return null;
    }
  };



  // 检查所选接口状态，返回按钮的禁用状态
  const checkSelectedStatus = () => {
    const allPublished = selectedRowsState.every(row => row.status === 1);
    const allDisabled = selectedRowsState.every(row => row.status === 2);
    const hasBothStatus = selectedRowsState.some(row => row.status === 1) && selectedRowsState.some(row => row.status === 2);
    if (hasBothStatus) {
      message.warning('不能同时选择已发布和已停用的接口');
    }

    return {
      publishDisabled: allPublished || hasBothStatus,
      disableDisabled: allDisabled || hasBothStatus
    };
  };

  const { publishDisabled, disableDisabled } = checkSelectedStatus();



  const columns = [
    {
      title: '接口名称',
      dataIndex: 'interfaceName',
      valueType: 'text' as const,
    },
    {
      title: '接口说明',
      dataIndex: 'description',
      valueType: 'text' as const,
      hideInSearch: true,
    },
    {
      title: '接口分类',
      dataIndex: 'classifyName',
      valueType: 'text' as const,
      hideInSearch: true,
    },
    {
      title: '接口来源',
      dataIndex: 'source',
      valueType: 'text' as const,
    },
    {
      title: '接口状态',
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
          {record.status === 0 || record.status === 2 ? (
            <a
              onClick={async () => {
                handleUpdateModalVisible(true);
                const response = await getInterfaceApi({ id: record.id });
                if (response.code === 100200) {
                  setStepFormValues(response.data);
                  // 可以添加日志输出，确认数据是否完整
                  console.log('设置的 stepFormValues:', response.data);
                } else {
                  message.error(response.msg || '获取接口信息失败，请重试');
                }
              }}
            >
              编辑
            </a>
          ) : (
            <span style={{ color: '#ccc', cursor: 'not-allowed' }}>编辑</span>
          )}
          <Divider type="vertical" />
          {record.status === 0 || record.status === 2 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handlePublish([record]);
                actionRef.current?.reload();
              }}
            >
              发布
            </a>
          ) : (
            <span style={{ color: '#ccc', cursor: 'not-allowed' }}>发布</span>
          )}
          <Divider type="vertical" />
          {record.status === 1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handleDisable([record]);
                actionRef.current?.reload();
              }}
            >
              停用
            </a>
          ) : (
            <span style={{ color: '#ccc', cursor: 'not-allowed' }}>停用</span>
          )}
          <Divider type="vertical" />
          {record.status === 0 ? (
            <a onClick={() => handleRemove([record])}>删除</a>
          ) : (
            <span style={{ color: '#ccc', cursor: 'not-allowed' }}>删除</span>
          )}
          <Divider type="vertical" />
          <a
            href=""
            onClick={async (e) => {
              e.preventDefault();
              const detail = await handleGetCode(record.id);
              if (detail) {
                setInterfaceDetail(detail);
                handleDetailModalVisible(true);
              }
            }}
          >
            查看详情
          </a>
        </>
      ),
    },
  ];

  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const handleAddCategory = async () => {
    if (!newCategoryName) {
      message.error('请输入目录名称');
      return;
    }
    const hide = message.loading('正在添加目录...');
    // 构建符合接口要求的参数对象
    const requestData = {
      name: newCategoryName,
      level: 1, // 假设新增顶级分类时层级为1，可根据实际情况调整
      parentId: 0, // 顶级分类的父级id为0，可根据实际情况调整
      type: 'interface', // 根据接口文档，这里是接口分类，可根据实际情况调整
    };
    try {
      const response = await addCategoriesApi(requestData);
      if (response.code === 100200) {
        hide();
        message.success('目录添加成功');
        setAddCategoryModalVisible(false);
        setNewCategoryName('');
        // 重新获取目录数据
        const newResponse = await getCategoriesApi({ type: 'interface' });
        if (newResponse.code === 100200) {
          setCategoryTreeData(newResponse.data);
        }
      } else {
        hide();
        message.error(response.msg || '目录添加失败，请重试');
      }
    } catch (error) {
      hide();
      message.error('目录添加失败，请重试');
    }
  };
  const confirmDeleteCategory = (id: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该目录吗？',
      onOk: () => handleDeleteCategory(id),
      onCancel: () => { },
    });
  };

  const renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <Tree.TreeNode title={
            <>
              {item.name}
              <a style={{ marginLeft: 10 }} onClick={(e) => {
                e.stopPropagation();
                confirmDeleteCategory(item.id);
              }}>-</a>
              <a style={{ marginLeft: 10 }} onClick={(e) => {
                e.stopPropagation();
                handleAddSubCategory(item.id); // 新增的处理函数
              }}>+</a>
            </>
          } key={item.id}>
            {renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return (
        <Tree.TreeNode title={
          <>
            {item.name}
            <a style={{ marginLeft: 10 }} onClick={(e) => {
              e.stopPropagation();
              confirmDeleteCategory(item.id);
            }}>-</a>
            <a style={{ marginLeft: 10 }} onClick={(e) => {
              e.stopPropagation();
              handleAddSubCategory(item.id); // 新增的处理函数
            }}>+</a>
          </>
        } key={item.id} />
      );
    });
  };
  const handleDeleteCategory = async (id) => {
    const hide = message.loading('正在删除目录...');
    try {
      const response = await delCategoriesApi({ id });
      if (response.code === 100200) {
        hide();
        message.success('目录删除成功');
        // 重新获取目录数据
        const newResponse = await getCategoriesApi({ type: 'interface' });
        if (newResponse.code === 100200) {
          setCategoryTreeData(newResponse.data);
        }
      } else {
        hide();
        message.error(response.msg || '目录删除失败，请重试');
      }
    } catch (error) {
      hide();
      message.error('目录删除失败，请重试');
    }
  };

  return (
    <PageContainer
      header={{
        title: '接口管理',
      }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ width: 200, borderRight: '1px solid #e8e8e8', padding: 16 }}>
          <Button type="primary" onClick={() => setAddCategoryModalVisible(true)}>新增目录</Button>
          <Tree
            showLine
            onSelect={(selectedKeys, info) => {
              // 处理树节点的点击事件
              console.log('Selected keys:', selectedKeys, 'Info:', info);
            }}
          >
            {renderTreeNodes(categoryTreeData)}
          </Tree>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          {/* 修改接口信息 */}
          {Object.keys(stepFormValues).length > 0 && (
            <UpdateInterface
              visible={updateModalVisible}
              values={stepFormValues}
              onSubmit={handleUpdate}
              onCancel={() => {
                handleUpdateModalVisible(false);
                setStepFormValues({});
              }}
            />
          )}

          <ProTable<DataSource>
            headerTitle="查询表格"
            actionRef={actionRef}
            rowKey="id"
            toolBarRender={() => [
              <Button
                key="1"
                type="primary"
                onClick={() => handleModalVisible(true)}
              >
                新增接口
              </Button>,
            ]}
            request={async (params) => {
              // console.log("接口数据请求参数",params);
              const response = await getInterfacesApi({
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
              pageSize: 20, // 默认每页展示条信息
            }}
          />
          {selectedRowsState?.length > 0 && (
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
          )}
          <AddInterface
            ref={addInterfaceRef} // 传递引用
            visible={createModalVisible}
            onCancel={() => handleModalVisible(false)}
            onSubmit={handleAdd}
          />
          {Object.keys(stepFormValues).length > 0 && (
            <UpdateInterface
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

          {/* 接口详情组件 */}
          <Modal
            title={codeTableDetail ? codeTableDetail.dictName : '接口详情'}
            visible={detailModalVisible}
            onCancel={() => {
              handleDetailModalVisible(false);
              setInterfaceDetail(null);
            }}
            okText="关闭"
          >
            {codeTableDetail && (
              <ProTable
                dataSource={codeTableDetail.dictDataList}
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    hideInSearch: true,
                  },
                  {
                    title: '码值名称',
                    dataIndex: 'dictLabel',
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
              />
            )}
          </Modal>
        </div>
      </div>
      <Modal
        title="新增分类目录"
        visible={addCategoryModalVisible}
        onOk={handleAddCategory}
        onCancel={() => setAddCategoryModalVisible(false)}
      >
        <Input
          placeholder="请输入目录名称"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      </Modal>
      <Modal
        title="新增子分类"
        visible={addSubCategoryModalVisible}
        onOk={handleAddSubCategoryConfirm}
        onCancel={() => setAddSubCategoryModalVisible(false)}
      >
        <Input
          placeholder="请输入子分类名称"
          value={newSubCategoryName}
          onChange={(e) => setNewSubCategoryName(e.target.value)}
        />
      </Modal>
    </PageContainer>
  );
};

export default TableList;