import { getTasksApi, updateTaskStatusApi, delTaskApi, getTaskApi, addTaskApi, updateTaskApi, batchUpdateClassifyApi } from '@/service/Task';
import { getCategoriesApi, addCategoriesApi, delCategoriesApi } from '@/service/Categories';
import {
  ActionType,
  PageContainer,
  ProDetaskions,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message, Modal, Input, Tree, Popconfirm, Select } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
// import UpdateTask from './UpdateTask'
// import AddTask from './AddTask'
// import TaskDetailModal from './TaskDetailModal';
// import TaskTest from './TaskTest';

// 任务数据
interface DataSource {
  id: number,
        taskName: string,
        classifyId: number,
        classifyName: string,
        fullPath: string,
        detaskion: string,
        status: number,
        updateTime: string
}

// 任务详情数据
interface TaskDetail {
  className: string;//类名
  classifyId: number;//任务分类
  detaskion: string | null;//任务描述
  fileName: string;//文件名
  functionName: string;//函数名
  id: number;//任务id
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
  taskFileUrl: string;//任务文件
  taskName: string;//任务名称
  taskType: string;//任务类型，默认python
}

const TableList: React.FC<unknown> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false); // 新增任务
  const [detailModalVisible, handleDetailModalVisible] = useState<boolean>(false); // 查看任务详情
  const [TaskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
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
  const [testModalVisible, setTestModalVisible] = useState<boolean>(false); // 控制任务测试子组件显示与隐藏
  const [currentTaskData, setCurrentTaskData] = useState<DataSource | null>(null); // 存储当前任务信息
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);//任务分类 ID
  const [batchUpdateClassify, setBatchUpdateClassify] = useState<boolean>(false);//控制批量分类模态框
  const [categoryOptions, setCategoryOptions] = useState<{ value: number; label: string }[]>([]);//任务分类
  // const [batchUpdateClassify, setBatchUpdateClassifyModal] = useState<boolean>(false);
  // const navigate = useNavigate();

  // const handleAddTask = () => {
  //   navigate('/interface/addTask'); // 跳转到新增数据资产界面的路由路径
  // };
  // 创建一个引用
  const addTaskRef = useRef<{ resetForm: () => void } | null>(null);

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
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesApi({ type: 'task' });
        if (response.code === 100200) {
          setCategoryTreeData(response.data);
          const options = flattenCategories(response.data);
          setCategoryOptions(options);
        } else {
          message.error(response.msg || '获取任务分类数据失败，请重试');
        }
      } catch (error) {
        message.error('获取任务分类数据失败，请重试');
      }
    };

    fetchCategories();
  }, []);

  // 第二个 useEffect 优化
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
      type: 'task',
    };
    try {
      const response = await addCategoriesApi(requestData);
      if (response.code === 100200) {
        hide();
        message.success('子分类添加成功');
        setAddSubCategoryModalVisible(false);
        setNewSubCategoryName('');
        setParentIdForSubCategory(null);
        const newResponse = await getCategoriesApi({ type: 'task' });
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
      const response = await addTaskApi(fields);
      if (response.code === 100200) {
        hide();
        message.success('添加成功');
        handleModalVisible(false);
        actionRef.current?.reload();
        if (addTaskRef.current) {
          addTaskRef.current.resetForm();
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
    const hide = message.loading('正在修改任务');
    try {
      const response = await updateTaskApi(fields);
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
        const response = await delTaskApi({ id });
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
      const response = await updateTaskStatusApi({
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
      const response = await updateTaskStatusApi({
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

  const handleGetTask = async (id: number) => {
    const hide = message.loading('正在查看任务详情');
    try {
      const response = await getTaskApi({ id });
      if (response.code === 100200) {
        hide();
        message.success('查看任务详情成功');
        return response.data;
      } else {
        hide();
        message.error(response.msg || '查看任务详情失败，请重试');
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
    const noRowsSelected = selectedRowsState.length === 0;
    if (hasBothStatus) {
      message.warning('不能同时选择已发布和已停用的任务');
    }

    return {
      publishDisabled: allPublished || hasBothStatus || noRowsSelected,
      disableDisabled: allDisabled || hasBothStatus || noRowsSelected,
      batchUpdateDisabled: noRowsSelected,
    };
  };

  const { publishDisabled, disableDisabled,batchUpdateDisabled } = checkSelectedStatus();

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      valueType: 'text',
      render: (text: any, record: any) => (
        <a
          href=""
          onClick={async (e) => {
            e.preventDefault();
            const detail = await handleGetTask(record.id);
            if (detail) {
              setTaskDetail(detail);
              handleDetailModalVisible(true);
            }
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '任务说明',
      dataIndex: 'detaskion',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '任务分类',
      dataIndex: 'classifyName',
      valueType: 'text',
      hideInSearch: true,
    },
    {
      title: '任务状态',
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
      width: '250px',
      render: (_: unknown, record: DataSource) => (
        <>
          {record.status === 0 || record.status === 2 ? (
            <a
              onClick={async () => {
                handleUpdateModalVisible(true);
                const response = await getTaskApi({ id: record.id });
                if (response.code === 100200) {
                  setStepFormValues(response.data);
                } else {
                  message.error(response.msg || '获取任务信息失败，请重试');
                }
              }}
              style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
            >
              编辑
            </a>
          ) : null}
          {record.status === 0 || record.status === 2 ? (
            <Popconfirm
              title="确定要发布这个任务吗？"
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
              title="确定要停用这个任务吗？"
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
          <a onClick={(e) => {
            e.preventDefault();
            setTestModalVisible(true); // 显示任务测试子组件
            setCurrentTaskData(record); // 存储当前任务信息
          }}
            style={{ border: '1px solid #ccc', padding: '4px 8px', borderRadius: '4px' }}
          >任务测试</a>
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
      type: 'task',
    };
    try {
      const response = await addCategoriesApi(requestData);
      if (response.code === 100200) {
        hide();
        message.success('目录添加成功');
        setAddCategoryModalVisible(false);
        setNewCategoryName('');
        const newResponse = await getCategoriesApi({ type: 'task' });
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
        const newResponse = await getCategoriesApi({ type: 'task' });
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
        title: '任务管理',
      }}
    >
      {/*查看任务详情子组件 */}
      {/* <TaskDetailModal
        visible={detailModalVisible}
        detailData={TaskDetail}
        onCancel={() => {
          handleDetailModalVisible(false);
          setTaskDetail(null);
        }}
      /> */}
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
          {/* {Object.keys(stepFormValues).length > 0 && (
            <UpdateTask
              visible={updateModalVisible}
              values={stepFormValues}
              onSubmit={handleUpdate}
              onCancel={() => {
                handleUpdateModalVisible(false);
                setStepFormValues({});
              }}
            />
          )} */}
          <ProTable<DataSource>
            scroll={{ x:1000 }}//设置大小
            actionRef={actionRef}
            rowKey="id"
            toolBarRender={() => [
              <div key="batch-operations" style={{ display: 'flex', justifyContent: 'flex-start',alignItems: 'center', marginRight: 16 }}>
                <>
                  <Popconfirm
                    title="确定要批量发布任务吗？"
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
                  <Button
                    onClick={() => setBatchUpdateClassify(true)}
                    disabled={batchUpdateDisabled}
                  >
                    批量分类
                  </Button>
                </>
              </div>,
              <Button
                key="1"
                type="primary"
                onClick={() => handleModalVisible(true)}
              >
                新增任务
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
              const response = await getTasksApi(queryParams);
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
            // style={{ maxWidth: 1500 }} //限制最大宽度
          />
          {/* <AddTask
            ref={addTaskRef}
            visible={createModalVisible}
            onCancel={() => handleModalVisible(false)}
            onSubmit={handleAdd}
          />
          {Object.keys(stepFormValues).length > 0 && (
            <UpdateTask
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
              <ProDetaskions<DataSource>
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
      <Modal
        title="批量分类操作"
        visible={batchUpdateClassify}
        onOk={async () => {
          if (!selectedCategoryId) {
            message.error('请选择分类');
            return;
          }
          const hide = message.loading('正在进行批量分类...');
          const selectedIds = selectedRowsState.map((row) => row.id);
          try {
            const response = await batchUpdateClassifyApi({
              ids: selectedIds,
              classifyId: selectedCategoryId,
            });
            if (response.code === 100200) {
              hide();
              message.success('批量分类成功');
              setBatchUpdateClassify(false);
              setSelectedRowKeys([]);
              setSelectedRows([]);
              actionRef.current?.reload();
            } else {
              hide();
              message.error(response.msg || '批量分类失败，请重试');
            }
          } catch (error) {
            hide();
            message.error('批量分类失败，请重试');
          }
        }}

        onCancel={() => setBatchUpdateClassify(false)}
      >
        <Select
          placeholder="请选择分类"
          style={{ width: '100%' }}
          value={selectedCategoryId}
          onChange={(value) => setSelectedCategoryId(value)}
        >
          {categoryOptions.map((item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </Modal>
      {/* <TaskTest
        visible={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        taskData={currentTaskData} // 传递当前任务信息
      /> */}
    </PageContainer>
  );
};

export default TableList;