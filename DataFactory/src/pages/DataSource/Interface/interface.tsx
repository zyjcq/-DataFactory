import { getInterfacesApi, updateInterfaceStatusApi, delInterfaceApi, getInterfaceApi, addInterfaceApi, updateInterfaceApi, connectInterfaceApi } from '@/service/Interface';
import { getCategoriesApi, addCategoriesApi, delCategoriesApi } from '@/service/Categories';
import {
  ActionType,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message, Modal, Input, Tree } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'umi';
import UpdateInterface from './UpdateInterface';
import InterfaceDetailModal from './InterfaceDetailModal';
import InterfaceTest from './InterfaceTest';

// 接口数据
interface DataSource {
  classifyId: number;//接口分类id
  fullPath: string;//接口分类名称
  description: string;//接口描述
  id: number;//接口id，自动递增
  inputParam: [];//输入参数
  inputParamBody: [];//输入参数body
  interfaceName: string;//接口名称，不可重复
  ipAndPort: string;//接口ip端口
  outputParam: [];//输出参数body
  path: string;//接口路径
  protocol: string;//接口协议（http，https）
  requestMethod: string;//请求方式（get，post）
  source: string;//接口来源（如数据服务、指标管理、决策引擎）
  status: number;//0-未发布（草稿），1-已发布，2-已停用
  timeout: number;//超时时间，单位秒，默认30s
  updateTime: string;//更新时间
}

// 接口详情数据
interface InterfaceDetail {
  classifyId: number;
  classifyName: string;
  description: string;
  id: number;
  inputParam:
  {
    dataType: string,
    defaultValue: string,
    desc: string,
    notNull: string,
    paramName: string,
    position: string
  }[];
  inputParamBody: [];
  interfaceName: string;
  ipAndPort: string;
  outputParam:
  {
    dataType: string,
    desc: string,
    paramName: string
  }[];
  path: string;
  protocol: string;
  requestMethod: string;
  source: string;
  status: number;
  timeout: number;
  updateTime: string;
}

const TableList: React.FC<unknown> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false); // 新增接口
  const [detailModalVisible, handleDetailModalVisible] = useState<boolean>(false); // 查看接口详情
  const [InterfaceDetail, setInterfaceDetail] = useState<InterfaceDetail | null>(null);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState<Partial<DataSource>>({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<DataSource>();
  const [selectedRowsState, setSelectedRows] = useState<DataSource[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [categoryTreeData, setCategoryTreeData] = useState([]); // 获取分类目录
  const [addSubCategoryModalVisible, setAddSubCategoryModalVisible] = useState(false);
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [parentIdForSubCategory, setParentIdForSubCategory] = useState<number | null>(null);
  const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [testModalVisible, setTestModalVisible] = useState<boolean>(false); // 控制接口测试子组件显示与隐藏
  const [currentInterfaceData, setCurrentInterfaceData] = useState<DataSource | null>(null); // 存储当前接口信息
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);//接口分类 ID

  const navigate = useNavigate();

  const handleAddInterface = () => {
    navigate('/interface/addInterface'); // 跳转到新增数据资产界面的路由路径
  };
  const handleUpdateInterface = (id: number) => {
    navigate(`/interface/updateInterface/${id}`); // 跳转到新增数据资产界面的路由路径
  };
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

  useEffect(() => {
    const expanded = categoryTreeData
      .map((item) => {
        if (item.name && item.name.indexOf(searchValue) > -1) {
          return getParentKey(item.id, categoryTreeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(expanded);
    setAutoExpandParent(true);
  }, [searchValue, categoryTreeData]);

  const getParentKey = (key: number, tree: any[]) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item) => item.id === key)) {
          parentKey = String(node.id);
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  const handleAddSubCategory = (parentId: number) => {
    setAddSubCategoryModalVisible(true);
    setParentIdForSubCategory(parentId);
  };

  const getLevelByParentId = (parentId: number) => {
    const parentNode = categoryTreeData.find((node) => node.id === parentId);
    if (parentNode) {
      return parentNode.level + 1;
    }
    return 1;
  };

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
    const level = getLevelByParentId(parentId);
    const requestData = {
      name: newSubCategoryName,
      level,
      parentId,
      type: 'interface',
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

  const handleAdd = async (fields: DataSource) => {
    const hide = message.loading('正在添加');
    try {
      const response = await addInterfaceApi(fields);
      if (response.code === 100200) {
        hide();
        message.success('添加成功');
        handleModalVisible(false);
        actionRef.current?.reload();
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

  const handlePublish = async (selectedRows: DataSource[]) => {
    const hide = message.loading('正在发布');
    console.log("发布参数", selectedRows);
    try {
      const ids = selectedRows.map((row) => row.id);
      console.log("发布参数", ids);
      const response = await updateInterfaceStatusApi({
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

  const handleDisable = async (selectedRows: DataSource[]) => {
    const hide = message.loading('正在停用');
    try {
      const ids = selectedRows.map((row) => row.id);
      const response = await updateInterfaceStatusApi({
        ids: ids,
        status: 2,
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

  const checkSelectedStatus = () => {
    const allPublished = selectedRowsState.every((row) => row.status === 1);
    const allDisabled = selectedRowsState.every((row) => row.status === 2);
    const hasBothStatus = selectedRowsState.some((row) => row.status === 1) && selectedRowsState.some((row) => row.status === 2);
    if (hasBothStatus) {
      message.warning('不能同时选择已发布和已停用的接口');
    }

    return {
      publishDisabled: allPublished || hasBothStatus,
      disableDisabled: allDisabled || hasBothStatus,
    };
  };

  const { publishDisabled, disableDisabled } = checkSelectedStatus();

  const columns = [
    {
      title: '接口名称',
      dataIndex: 'interfaceName',
      valueType: 'text',
      render: (text: any, record: any) => (
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
          {text}
        </a>
      ),
    },
    {
      title: '接口说明',
      dataIndex: 'description',
      valueType: 'text',
      hideInSearch: true,
      width: 300,
    },
    {
      title: '接口分类',
      dataIndex: 'fullPath',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '接口来源',
      dataIndex: 'source',
      valueType: 'text',
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
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 300,
      render: (_: unknown, record: DataSource) => (
        <>
          {record.status === 0 || record.status === 2 ? (
            <a
              onClick={() => handleUpdateInterface(record.id)}
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
          <a onClick={(e) => {
          e.preventDefault();
          // 调用 getInterfaceApi 获取接口详情
          const handleGetCode = async () => {
            const hide = message.loading('正在查看接口详情');
            try {
              const response = await getInterfaceApi({ id: record.id });
              if (response.code === 100200) {
                hide();
                message.success('查看接口详情成功');
                // 将获取的详情数据传递给接口测试界面
                setTestModalVisible(true);
                setCurrentInterfaceData(response.data);
              } else {
                hide();
                message.error(response.msg || '查看接口详情失败，请重试');
              }
            } catch (error) {
              hide();
              message.error('查看失败，请重试');
            }
          };
          handleGetCode();
        }}
          style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
        >接口测试</a>

          {record.status === 0 ? (
            <a onClick={() => handleRemove([record])}
              style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
            >删除</a>
          ) : null}
        </>
      ),
    },
  ];

  const handleAddCategory = async () => {
    if (!newCategoryName) {
      message.error('请输入目录名称');
      return;
    }
    const hide = message.loading('正在添加目录...');
    const requestData = {
      name: newCategoryName,
      level: 1,
      parentId: 0,
      type: 'interface',
    };
    try {
      const response = await addCategoriesApi(requestData);
      if (response.code === 100200) {
        hide();
        message.success('目录添加成功');
        setAddCategoryModalVisible(false);
        setNewCategoryName('');
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

  const confirmDeleteCategory = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该目录吗？',
      onOk: () => handleDeleteCategory(id),
      onCancel: () => { },
    });
  };

  const handleDeleteCategory = async (id: number) => {
    const hide = message.loading('正在删除目录...');
    try {
      const response = await delCategoriesApi({ id });
      if (response.code === 100200) {
        hide();
        message.success('目录删除成功');
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

  const handleTreeSelect = (selectedKeys) => {
    const id = Number(selectedKeys[0]);
    setSelectedCategoryId(id);
    actionRef.current?.reload();
  };
  const renderTreeNodes = (data: any[]) => {
    return data.map((item) => {
      const title = (
        <>
          {item.name && item.name.indexOf(searchValue) > -1 ? (
            <>
              {item.name.substring(0, item.name.indexOf(searchValue))}
              <span style={{ color: '#f50' }}>{searchValue}</span>
              {item.name.substring(item.name.indexOf(searchValue) + searchValue.length)}
            </>
          ) : (
            item.name
          )}
          <a style={{ marginLeft: 10 }} onClick={(e) => {
            e.stopPropagation();
            confirmDeleteCategory(item.id);
          }}>-</a>
          <a style={{ marginLeft: 10 }} onClick={(e) => {
            e.stopPropagation();
            handleAddSubCategory(item.id);
          }}>+</a>
        </>
      );
      if (item.children && item.children.length > 0) {
        return (
          <Tree.TreeNode title={title} key={String(item.id)}>
            {renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode title={title} key={String(item.id)} />;
    });
  };

  const onExpand = (keys: string[]) => {
    setExpandedKeys(keys);
    setAutoExpandParent(false);
  };

  return (
    <PageContainer
      header={{
        title: '接口管理',
      }}
    >
      {/*查看接口详情子组件 */}
      <InterfaceDetailModal
        visible={detailModalVisible}
        detailData={InterfaceDetail}
        onCancel={() => {
          handleDetailModalVisible(false);
          setInterfaceDetail(null);
        }}
      />
      <div style={{ display: 'flex' }}>
        <div style={{ width: 200, borderRight: '1px solid #e8e8e8', padding: 16 }}>
          <Button type="primary" onClick={() => setAddCategoryModalVisible(true)}>新增目录</Button>
          <Input.Search
            value={searchValue}
            style={{ marginBottom: 8 }}
            placeholder="Search"
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Tree
            showLine
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            treeData={categoryTreeData}
            onExpand={onExpand}
            onSelect={handleTreeSelect}
          >
            {renderTreeNodes(categoryTreeData)}
          </Tree>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
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
                onClick={handleAddInterface}
              >
                新增接口
              </Button>,
            ]}
            request={async (params) => {
              const queryParams = {
                size: params.pageSize,
                ...params,
              };
              if (selectedCategoryId) {
                queryParams.classifyId = selectedCategoryId;
              }
              const response = await getInterfacesApi(queryParams);
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
                setSelectedRowKeys(selectedKeys.map((key) => Number(key)));
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
          {Object.keys(stepFormValues).length > 0 && (
            <UpdateInterface
              visible={updateModalVisible}
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
      <InterfaceTest
        visible={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        interfaceData={currentInterfaceData} // 传递当前接口信息
      />
    </PageContainer>
  );
};

export default TableList;