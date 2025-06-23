import { getDataAssetsApi, updateDataAssetStatusApi, delDataAssetApi, getDataAssetApi, addDataAssetApi, updateDataAssetApi, connectDataAssetApi } from '@/service/DataAssets';
import { getCategoriesApi, addCategoriesApi, delCategoriesApi } from '@/service/Categories';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message, Modal, Input, Tree } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'umi';
import { Outlet } from 'umi'
import AddDataAsset from './AddDataAsset';
import UpdateDataAsset from './UpdateDataAsset';
import DataAssetDetailModal from './DataAssetDetailModal';
import { render } from 'react-dom';
// import DataAssetTest from './DataAssetTest';

// 数据资产数据
interface DataSource {
  description: string;//数据资产描述
  id: number;//数据资产id，自动递增
  chineseName: string;//数据资产名称，不可重复
  englishName: string//英文名称
  status: number;//0-未发布（草稿），1-已发布，2-已停用
  updateTime: string;//更新时间
}

// 数据资产详情数据
interface DataAssetDetail {
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
  const [createModalVisible, handleModalVisible] = useState<boolean>(false); // 新增数据资产
  const [detailModalVisible, handleDetailModalVisible] = useState<boolean>(false); // 查看数据资产详情
  const [DataAssetDetail, setDataAssetDetail] = useState<DataAssetDetail | null>(null);
  // const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  // const [stepFormValues, setStepFormValues] = useState<Partial<DataSource>>({});
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
  // const [testModalVisible, setTestModalVisible] = useState<boolean>(false); // 控制数据资产测试子组件显示与隐藏
  // const [currentDataAssetData, setCurrentDataAssetData] = useState<DataSource | null>(null); // 存储当前数据资产信息
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);//数据资产分类 ID

  const navigate = useNavigate();

  const handleAdd = () => {
    navigate('/dataAssets/AddDataAsset'); // 跳转到新增数据资产界面的路由路径
  };
  // 创建一个引用
  const addDataAssetRef = useRef<{ resetForm: () => void } | null>(null);

  //获取分类目录
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesApi({ type: 'asset' });
        if (response.code === 100200) {
          setCategoryTreeData(response.data);
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
      type: 'asset',
    };
    try {
      const response = await addCategoriesApi(requestData);
      if (response.code === 100200) {
        hide();
        message.success('子分类添加成功');
        setAddSubCategoryModalVisible(false);
        setNewSubCategoryName('');
        setParentIdForSubCategory(null);
        const newResponse = await getCategoriesApi({ type: 'asset' });
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

  // const handleAdd = async (fields: DataSource) => {
  //   const hide = message.loading('正在添加');
  //   try {
  //     const response = await addDataAssetApi(fields);
  //     if (response.code === 100200) {
  //       hide();
  //       message.success('添加成功');
  //       handleModalVisible(false);
  //       actionRef.current?.reload();
  //       if (addDataAssetRef.current) {
  //         addDataAssetRef.current.resetForm();
  //       }
  //       return true;
  //     } else {
  //       hide();
  //       message.error(response.msg || '添加失败，请重试');
  //       return false;
  //     }
  //   } catch (error) {
  //     hide();
  //     message.error('添加失败，请重试');
  //     return false;
  //   }
  // };

  const handleUpdate = async (fields: DataSource) => {
    const hide = message.loading('正在修改数据资产');
    try {
      const response = await updateDataAssetApi(fields);
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
        const response = await delDataAssetApi({ id });
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
      const response = await updateDataAssetStatusApi({
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

  const handleDisable = async (selectedRows: DataSource[]) => {
    const hide = message.loading('正在停用');
    try {
      const ids = selectedRows.map((row) => row.id);
      const response = await updateDataAssetStatusApi({
        ids:ids,
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
    const hide = message.loading('正在查看数据资产详情');
    try {
      const response = await getDataAssetApi({ id });
      if (response.code === 100200) {
        hide();
        message.success('查看数据资产详情成功');
        return response.data;
      } else {
        hide();
        message.error(response.msg || '查看数据资产详情失败，请重试');
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
      message.warning('不能同时选择已发布和已停用的数据资产');
    }

    return {
      publishDisabled: allPublished || hasBothStatus,
      disableDisabled: allDisabled || hasBothStatus,
    };
  };

  const { publishDisabled, disableDisabled } = checkSelectedStatus();

  const columns = [
    {
      title: '数据资产表中文名称',
      dataIndex: 'chineseName',
      valueType: 'text',
      // search:{
        placeholder:"请输入中文名称",
      // },
      render: (text: any, record: any) => (
        <a
          href=""
          onClick={async (e) => {
            e.preventDefault();
            const detail = await handleGetCode(record.id);
            if (detail) {
              setDataAssetDetail(detail);
              handleDetailModalVisible(true);
            }
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '数据资产表英文名称',
      dataIndex: 'englishName',
      valueType: 'text',
      render: (text: any, record: any) => (
        <a
          href=""
          onClick={async (e) => {
            e.preventDefault();
            const detail = await handleGetCode(record.id);
            if (detail) {
              setDataAssetDetail(detail);
              handleDetailModalVisible(true);
            }
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '数据资产表描述',
      dataIndex: 'description',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '数据资产状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '未发布', value: 0 },
          { label: '已发布', value: 1 },
          { label: '已停用', value: 2 },
        ],
      },
      // valueEnum: {
      //   close: { text: '未发布', value: 0 },
      //   online: { text: '已发布', status: 'Success' },
      //   error: { text: '已停用', status: 'Error' },
      // },
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
      render: (_: unknown, record: DataSource) => (
        <>
          {record.status === 0 || record.status === 2 ? (
            <a
              // onClick={async () => {
              //   handleUpdateModalVisible(true);
              //   const response = await getDataAssetApi({ id: record.id });
              //   if (response.code === 100200) {
              //     setStepFormValues(response.data);
              //   } else {
              //     message.error(response.msg || '获取数据资产信息失败，请重试');
              //   }
              // }}
              onClick={async () => {
                navigate(`/dataAssets/UpdateDataAsset/${record.id}/${record.status}`); // 跳转到编辑界面，并传递ID
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
      type: 'asset',
    };
    try {
      const response = await addCategoriesApi(requestData);
      if (response.code === 100200) {
        hide();
        message.success('目录添加成功');
        setAddCategoryModalVisible(false);
        setNewCategoryName('');
        const newResponse = await getCategoriesApi({ type: 'asset' });
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
        const newResponse = await getCategoriesApi({ type: 'asset' });
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
        title: '数据资产管理',
      }}

    >
      {/*查看数据资产详情子组件 */}
      <DataAssetDetailModal
        visible={detailModalVisible}
        detailData={DataAssetDetail}
        onCancel={() => {
          handleDetailModalVisible(false);
          setDataAssetDetail(null);
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
                onClick={handleAdd}
              >
                <Outlet />
                新增数据资产
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

              const response = await getDataAssetsApi(queryParams);
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
              pageSize: 20,//设置默认每页显示20条数据
              showSizeChanger: true,//显示每页条数选择器
              showQuickJumper: true,// 显示快速跳转输入框
              showTotal: (total) => `共 ${total} 条`,//显示总条数
              pageSizeOptions: ['10', '20', '50', '100'],//每页条数选项
              showLessItems: true,//当页数大于5时，只显示当前页和前后2页
              showPrevNextJumpers: true,//显示上一页/下一页跳转按钮
            }}
            options={false}//table 工具栏
            search={{
              labelWidth: 'auto', // 设置标签宽度
            }}
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
          {/* <AddDataAsset
            ref={addDataAssetRef}
            visible={createModalVisible}
            onCancel={() => handleModalVisible(false)}
            onSubmit={handleAdd}
          /> */}
          {/* {Object.keys(stepFormValues).length > 0 && (
            <UpdateDataAsset
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
          )} */}
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
      {/* <DataAssetTest
        visible={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        interfaceData={currentDataAssetData} // 传递当前数据资产信息
      /> */}
    </PageContainer>
  );
};

export default TableList;