import type { ProColumns } from '@ant-design/pro-components';
import {
  ProFormInstance, ProForm, EditableProTable,
  ProCard,
  ProFormRadio,
} from '@ant-design/pro-components';
import { ProFormText, StepsForm } from '@ant-design/pro-components';
import { useNavigate } from 'umi';
import { Button, message } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { addInterfaceApi, addInterfaceParamsApi } from '@/service/Interface';
import { history } from '@umijs/max';
import { request } from 'node_modules/axios/index.cjs';

// 数据标准接口类型定义（假设已有）
interface DataInterfaceSource {
  id: number;
  classifyId: number;
  interfaceName: string;
  source: string | null;
  description: any;
  protocol: string;
  ipAndPort: string;
  path: string;
  requestMethod: string;
  timeout: string;
}
//输入参数
type DataSourceInputParams = {
  id: number;
  paramName: string;
  position: string;
  dataType: string;
  notNull: string;
  defaultValue: string;
  desc: string;
  dictId: number;
  children?: DataSourceInputParams[];
};
//请求Body
type DataSourceRequestBody = {
  desc: string;
  dataType: string;
  paramName: string;
  notNull: string;
  defaultValue: string;
  dictId: number;
  children?: DataSourceRequestBody[];
};
//返回参数
type DataSourceReturnParams = {
  desc: string;
  dataType: string;
  paramName: string;
  dictId: number;
  children?: DataSourceReturnParams[];
};
// 码表详情数据
interface CodeTableData {
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
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
const AddExample = () => {
  const formMapRef = useRef<React.MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceInputParams[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>(
    'bottom',
  );
  // 在组件状态部分添加返回参数状态
  const [returnParamsDataSource, setReturnParamsDataSource] = useState<DataSourceReturnParams[]>([]);
  const [requestBodyDataSource, setRequestBodyDataSource] = useState<DataSourceRequestBody[]>([]);
  //新增接口的基本信息后返回的id
  const [interfaceDataId, setInterfaceDataId] = useState<number | null>(null);
  //存储请求方式
  const [requestMethodDataSource, setRequestMethodDataSource] = useState<string | null>(null);
  const navigate = useNavigate();
  // 输入参数表格
  const [inputParamsDataSource, setInputParamsDataSource] = useState<DataSourceInputParams[]>([]);

  const handleCancel = () => {
    formMapRef?.current?.forEach((formInstanceRef) => {
      formInstanceRef?.current?.resetFields();
    });
    navigate(-1);
  };

  // 下一步按钮请求
  const onSubmitInterface = async () => {
    try {
      const formData = await Promise.all(
        formMapRef.current.map((formInstanceRef) => {
          return formInstanceRef.current?.validateFields().catch((error) => {
            console.log('表单验证失败:', error);
            throw error;
          });
        })
      );
      const mergedData = formData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      console.log('合并后的数据：', mergedData);

      const requestData: DataInterfaceSource = {
        // id:;
        classifyId: mergedData.classifyId || 1,
        interfaceName: mergedData.interfaceName,
        source: mergedData.source,
        description: mergedData.description,
        protocol: mergedData.protocol,
        ipAndPort: mergedData.ipAndPort,
        path: mergedData.path,
        requestMethod: mergedData.requestMethod,
        timeout: mergedData.timeout,
      };


      const response = await addInterfaceApi(requestData);
      if (response.code === 100200) {
        message.success('提交成功');
        setInterfaceDataId(response.data);
        // setRequestMethodDataSource(mergedData.requestMethod);
        // console.log('请求方式1', mergedData.requestMethod);
        // console.log('请求方式2', requestMethodDataSource);
      } else {
        message.error(response.msg || '提交失败，请重试');
      }
    } catch (error) {
      console.error('提交失败，请检查表单信息', error); // 添加日志
      message.error('提交失败，请检查表单信息');
    }
  };

  //获取请求方式的值
  useEffect(() => {
    const initializeForm = async () => {
      try {
        const formData = await Promise.all(
          formMapRef.current.map((formInstanceRef) =>
            formInstanceRef.current?.validateFields().catch((error) => {
              console.log('表单验证失败:', error);
              throw error;
            })
          )
        );
        const mergedData = formData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setRequestMethodDataSource(mergedData.requestMethod);
        console.log("请求方式1", requestMethodDataSource);

      } catch (error) {
        console.error('初始化表单失败:', error);
      }
    };

    // 调用异步函数
    initializeForm();
  }, [formMapRef]);

  const handleSaveAndExit = async () => {
    try {
      const formData = await Promise.all(
        formMapRef.current.map((formInstanceRef) => formInstanceRef.current?.validateFields())
      );

      const mergedData = formData.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      const requestData: DataInterfaceSource = {
        id: interfaceDataId,
        classifyId: mergedData.classifyId || 1,
        interfaceName: mergedData.interfaceName,
        source: mergedData.source,
        description: mergedData.description,
        protocol: mergedData.protocol,
        ipAndPort: mergedData.ipAndPort,
        path: mergedData.path,
        requestMethod: mergedData.requestMethod,
        timeout: mergedData.timeout,
      };

      const response = await addInterfaceApi(requestData);
      if (response.code === 100200) {
        message.success('提交成功');
        navigate(-1);
      } else {
        message.error(response.msg || '提交失败，请重试');
      }
    } catch (error) {
      console.error('提交失败，请检查表单信息', error); // 添加日志
      message.error('提交失败，请检查表单信息');
    }
  };
  const handleSaveAndExitParams = async () => {
    // 检查接口 ID 是否已经设置
    if (!interfaceDataId) {
      message.error('接口 ID 未设置，请先完成第一步');
      return;
    }

    try {
      const formData = await Promise.all(
        formMapRef.current.map((formInstanceRef) => formInstanceRef.current?.validateFields())
      );

      const mergedData = formData.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      // 从状态中获取数据
      const inputParams = dataSource;
      const requestBodyParams = requestBodyDataSource;
      const returnParams = returnParamsDataSource;
      console.log('接口id', interfaceDataId.values);
      // 构造请求参数
      const requestData: {
        id: number;
        inputParam: DataSourceInputParams[];
        inputParamBody: DataSourceRequestBody[];
        outputParam: DataSourceReturnParams[];
      } = {
        id: interfaceDataId,
        inputParam: inputParams,
        inputParamBody: requestBodyParams,
        outputParam: returnParams
      };
      const response = await addInterfaceParamsApi(requestData);
      if (response.code === 100200) {
        message.success('提交成功');
        navigate(-1);
      } else {
        message.error(response.msg || '提交失败，请重试');
      }
    } catch (error) {
      console.error('提交失败，请检查表单信息', error); // 添加日志
      message.error('提交失败，请检查表单信息');
    }
  };  // 添加子节点函数
  const handleAddChild = (parentId: string) => {
    const parent = returnParamsDataSource.find(item => item.id === parentId);
    if (parent && (parent.dataType === 'Object' || parent.dataType === 'Array')) {
      const newChild: DataSourceReturnParams = {
        id: Math.random().toString(36).substr(2, 9),
        paramName: 'newChild',
        dataType: 'String',
        desc: '',
        parentId // 添加父级ID用于定位
      };

      setReturnParamsDataSource(prev =>
        prev.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newChild]
            };
          }
          // 递归处理子节点
          if (item.children) {
            return {
              ...item,
              children: handleNestedAdd(item.children, parentId)
            };
          }
          return item;
        })
      );
      // 更新 editableKeys 状态，将新添加的子节点的 id 加入
      setEditableRowKeys(prevKeys => [...prevKeys, newChild.id]);
    }
  };
  // 递归添加子节点辅助函数
  const handleNestedAdd = (children: DataSourceReturnParams[], parentId: string): DataSourceReturnParams[] => {
    return children.map(child => {
      if (child.id === parentId) {
        const parent = children.find(item => item.id === parentId);
        if (parent && (parent.dataType === 'Object' || parent.dataType === 'Array')) {
          const newChild: DataSourceReturnParams = {
            id: Math.random().toString(36).substr(2, 9),
            paramName: 'newChild',
            dataType: 'String',
            desc: ''
          };
          const updatedChild = {
            ...child,
            children: [...(child.children || []), newChild]
          };
          // 更新 editableKeys 状态，将新添加的子节点的 id 加入
          setEditableRowKeys(prevKeys => [...prevKeys, newChild.id]);
          return updatedChild;
        }
      }
      if (child.children) {
        return {
          ...child,
          children: handleNestedAdd(child.children, parentId)
        };
      }
      return child;
    });
  };

  // 删除记录函数（支持嵌套删除）
  const handleDeleteRecord = (id: string) => {
    const deleteNested = (items: DataSourceReturnParams[]): DataSourceReturnParams[] =>
      items
        .filter(item => item.id !== id)
        .map(item => ({
          ...item,
          children: item.children ? deleteNested(item.children) : undefined
        }));

    setReturnParamsDataSource(prev => deleteNested(prev));
  };

  const InputParams: ProColumns<DataSourceInputParams>[] = [

    {
      title: '参数名称',
      dataIndex: 'paramName',
      width: '15%',
    },
    {
      title: '参数位置',
      dataIndex: 'position',
      width: '15%',
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      valueType: 'select',
      valueEnum: {
        String: { text: 'String' },
        Int: { text: 'Int' },
        Float: { text: 'Float' },
        Object: { text: 'Object' },
        Array: { text: 'Array' }
      },
      formItemProps: {
        rules: [{ required: true, message: '请选择数据类型' }]
      }
    },
    {
      title: '是否必填',
      dataIndex: 'notNull',
      // editable: true,
      width: '10%',
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      // editable: true,
      width: '15%',
    },
    {
      title: '参数描述',
      dataIndex: 'desc',
      // editable: true,
      width: '20%',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (text, record, _, action) => {
        // const hasCodeValue = CodeTableData[record.id];
        const showCodeValueDefineButton = record.dataType === 'String' || record.dataType === 'Int';
        return [
          <a
            key="editable"
            onClick={() => action?.startEditable?.(record.id)}
          >
            编辑
          </a>,
          // showCodeValueDefineButton && (
          //   <a
          //     key="code-value-define"
          //     // onClick={() => handleCodeValueDefine(record.id)}
          //   >
          //     码值定义
          //   </a>
          // ),
          // hasCodeValue && (
          //   <a
          //     key="code-value-details"
          //     onClick={() => handleCodeValueDetails(record.id)}
          //   >
          //     码值详情
          //   </a>
          // ),
          <a
            key="delete"
            onClick={() => setDataSource(dataSource.filter((item) => item.id !== record.id))}
          >
            删除
          </a>,
        ];
      },
    },
  ];

  // 添加请求Body记录函数
  // const handleAddRequestBodyRecord = () => {
  //   const newRecord: DataSourceRequestBody = {
  //     id: Math.random().toString(36).substr(2, 9),
  //     paramName: 'newParam',
  //     dataType: 'String',
  //     desc: '',
  //     notNull: 'No',
  //     defaultValue: ''
  //   };
  //   setRequestBodyDataSource(prev => [...prev, newRecord]);
  // };

  // 删除请求Body记录函数
  const handleDeleteRequestBodyRecord = (id: string) => {
    setRequestBodyDataSource(prev => prev.filter(item => item.id !== id));
  };

  // 新增处理请求Body添加子集的函数
  const handleAddRequestBodyChild = (parentId: string) => {
    const parent = requestBodyDataSource.find(item => item.id === parentId);
    if (parent && (parent.dataType === 'Object' || parent.dataType === 'Array')) {
      const newChild: DataSourceRequestBody = {
        id: Math.random().toString(36).substr(2, 9),
        paramName: 'newChild',
        dataType: 'String',
        desc: '',
        notNull: 'No',
        defaultValue: '',
        parentId // 添加父级ID用于定位
      };

      setRequestBodyDataSource(prev =>
        prev.map(item => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children || []), newChild]
            };
          }
          // 递归处理子节点
          if (item.children) {
            return {
              ...item,
              children: handleNestedAddRequestBody(item.children, parentId)
            };
          }
          return item;
        })
      );
    }
  };

  // 新增递归处理请求Body子节点添加的辅助函数
  const handleNestedAddRequestBody = (children: DataSourceRequestBody[], parentId: string): DataSourceRequestBody[] => {
    return children.map(child => {
      if (child.id === parentId) {
        const parent = children.find(item => item.id === parentId);
        if (parent && (parent.dataType === 'Object' || parent.dataType === 'Array')) {
          const newChild: DataSourceRequestBody = {
            id: Math.random().toString(36).substr(2, 9),
            paramName: 'newChild',
            dataType: 'String',
            desc: '',
            notNull: 'No',
            defaultValue: ''
          };
          const updatedChild = {
            ...child,
            children: [...(child.children || []), newChild]
          };
          return updatedChild;
        }
      }
      if (child.children) {
        return {
          ...child,
          children: handleNestedAddRequestBody(child.children, parentId)
        };
      }
      return child;
    });
  };

  const RequestBodyParams: ProColumns<DataSourceRequestBody>[] = [
    {
      title: '参数名称',
      dataIndex: 'paramName',
      formItemProps: { rules: [{ required: true }] }
    },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      valueType: 'select',
      valueEnum: {
        String: 'String',
        Int: 'Int',
        Float: 'Float',
        Object: 'Object',
        Array: 'Array'
      }
    },
    {
      title: '参数说明',
      dataIndex: 'desc'
    },
    {
      title: '是否必填',
      dataIndex: 'notNull',
      valueType: 'select',
      valueEnum: {
        Yes: '是',
        No: '否'
      }
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue'
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => {
        const showAddChild = record.dataType === 'Object' || record.dataType === 'Array';
        const showCodeValueDefineButton = record.dataType === 'String' || record.dataType === 'Int';
        return [
          <a
            key="edit"
            onClick={() => {
              action?.startEditable?.(record.id);
            }}
          >
            编辑
          </a>,
          showAddChild && (<a
            key="add"
            onClick={() => handleAddRequestBodyChild(record.id)}
          >
            添加子级
          </a>
          ),
          <a
            key="delete"
            onClick={() => handleDeleteRequestBodyRecord(record.id)}
          >
            删除
          </a>,
          showCodeValueDefineButton && (
            <a
              key="code-value-define"
            // onClick={() => handleCodeValueDefine(record.id)}
            >
              码值定义
            </a>
          ),

        ]
      }
    }
  ];
  return (
    <StepsForm
      formMapRef={formMapRef}
      onFinish={async (values) => {
        try {
          const formData = await Promise.all(
            formMapRef.current.map((formInstanceRef) => formInstanceRef.current?.validateFields())
          );
          const mergedData = formData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          const requestData: DataInterfaceSource = {
            classifyId: mergedData.classifyId || 1,
            interfaceName: mergedData.interfaceName,
            source: mergedData.source,
            description: mergedData.description,
            protocol: mergedData.protocol,
            ipAndPort: mergedData.ipAndPort,
            path: mergedData.path,
            requestMethod: mergedData.requestMethod,
            timeout: mergedData.timeout,
          };
          const response = await addInterfaceParamsApi(requestData);
          if (response.code === 100200) {
            message.success('提交成功');
            return Promise.resolve(true);
          } else {
            message.error(response.msg || '提交失败，请重试');
            return Promise.resolve(false);
          }
        } catch (error) {
          console.error('提交失败，请检查表单信息', error); // 添加日志
          message.error('提交失败，请检查表单信息');
          return Promise.resolve(false);
        }
      }}
      submitter={{
        render: (props: any) => {
          if (props.step === 0) {
            return (
              <div>
                <Button onClick={handleCancel} style={{ marginRight: '8px' }}>
                  取消
                </Button>
                <Button type="primary" style={{ marginRight: '8px' }} onClick={async () => {
                  await onSubmitInterface();
                  props.onSubmit?.();
                }}>
                  下一步
                </Button>
                <Button type="primary" onClick={handleSaveAndExit}>
                  保存并退出1
                </Button>
              </div>
            );
          }
          if (props.step === 1) {
            return (
              <div>
                <Button onClick={handleCancel} style={{ marginRight: '8px' }}>
                  取消
                </Button>
                <Button type="primary" style={{ marginRight: '8px' }} onClick={async () => {
                  props.onPre?.();
                }}>
                  上一步
                </Button>
                <Button type="primary"
                  onClick={handleSaveAndExitParams}
                >
                  保存并退出2
                </Button>
              </div>
            );
          }
        }
      }}
    >
      {/* Step 1 */}
      <StepsForm.StepForm name="step1" title="基本参数">
        <ProForm.Group direction="vertical" label="基本信息">
          <ProFormText
            name="classifyId"
            label="接口分类ID"
            placeholder="请输入接口分类ID"
            initialValue={1}
            rules={[{ required: true, message: '请输入接口分类ID' }]}
            style={{ width: '1500px' }}
          />
          <ProFormText
            name="interfaceName"
            label="接口名称"
            placeholder="请输入接口名称"
            initialValue={'新增学习信息'}
            rules={[{ required: true, message: '请输入接口名称' }]}
          />
          <ProFormText
            name="source"
            label="接口来源"
            placeholder="请输入接口来源"
            initialValue={'接口来源1'}
            rules={[{ required: true, message: '请输入接口来源' }]}
          />
          <ProFormText
            name="description"
            label="描述"
            placeholder="请输入描述"
            initialValue={'接口描述1'}
            rules={[{ required: true, message: '请输入描述' }]}
          />
        </ProForm.Group>
        <ProForm.Group direction="vertical" label="API参数">
          <ProFormText
            name="protocol"
            label="协议"
            placeholder="请输入协议"
            initialValue={'接口协议1'}
            rules={[{ required: true, message: '请输入协议' }]}
          />
          <ProFormText
            name="ipAndPort"
            label="IP端口"
            placeholder="请输入IP端口"
            initialValue={'10.159.194.126:8080'}
            rules={[{ required: true, message: '请输入IP端口' }]}
          />
          <ProFormText
            name="path"
            label="Path"
            placeholder="请输入Path"
            initialValue={'/interface'}
            rules={[{ required: true, message: '请输入Path' }]}
          />
          <ProFormText
            name="requestMethod"
            label="请求方式"
            placeholder="请输入请求方式"
            initialValue={'post'}
            rules={[{ required: true, message: '请输入请求方式' }]}
          />
          <ProFormText
            name="timeout"
            label="超时时间"
            placeholder="请输入超时时间"
            initialValue={'20'}
            rules={[{ required: true, message: '请输入超时时间' }]}
          />
        </ProForm.Group>
      </StepsForm.StepForm>

      {/* Step 2 */}

      <StepsForm.StepForm name="step2" title="参数配置">
        {/* 在此处添加第二步的内容 */}
        <EditableProTable<DataSourceInputParams>
          rowKey="id"
          headerTitle="输入参数"
          maxLength={5}
          scroll={{
            x: 960,
          }}
          recordCreatorProps={
            position !== 'hidden'
              ? {
                newRecordType: 'dataSource',
                position: position as 'top',
                record: () => ({
                  id: (Math.random() * 1000000).toFixed(0),
                  paramName: '',
                  position: '',
                  dataType: '',
                  notNull: '',
                  defaultValue: '',
                  desc: '',
                }),
              }
              : false
          }
          loading={false}
          toolBarRender={() => [
            <ProFormRadio.Group
              key="render"
              fieldProps={{
                value: position,
                onChange: (e) => setPosition(e.target.value),
              }}
              options={[
                {
                  label: '添加到顶部',
                  value: 'top',
                },
                {
                  label: '添加到底部',
                  value: 'bottom',
                },
                {
                  label: '隐藏',
                  value: 'hidden',
                },
              ]}
            />,
          ]}
          columns={InputParams}
          // request={async () => ({
          //   data: [], // 这里可以根据实际情况返回初始数据
          //   total: 0,
          //   success: true,
          // })}
          value={dataSource}
          onChange={setDataSource}
          editable={{
            type: 'single',//单行编辑
            // type: 'multiple',//多行编辑
            editableKeys,
            actionRender: (row, config, dom) => {
              const buttons = [dom.save, dom.cancel];
              const InStr = row.dataType === 'Int' || row.dataType === 'String';
              // console.log("111",row,config);
              
              if (InStr) {
                buttons.push(<a key={'code'}
                // onClick={() => setCodeValueModal1(true)}
                >码值定义1</a>);
              }
              return buttons;
            },
            onValuesChange: (record, recordList) => {
              // console.log(record,recordList);
              setDataSource(recordList);
            },
            onChange: setEditableRowKeys,
          }}
        />

        {requestMethodDataSource !== 'get' && (<ProCard title="请求Body" style={{ marginTop: 24 }}>
          <EditableProTable<DataSourceRequestBody>
            rowKey="id"
            scroll={{ x: 1000 }}
            recordCreatorProps={{
              creatorButtonText: '添加根节点',
              record: () => ({
                id: Math.random().toString(36).substr(2, 9),
                paramName: 'newParam',
                dataType: 'String',
                desc: '',
                notNull: 'No',
                defaultValue: ''
              })
            }}
            columns={RequestBodyParams}
            value={requestBodyDataSource}
            onChange={setRequestBodyDataSource}
            editable={{
              type: 'multiple',
              onSave: async (key, row) => {
                console.log('保存请求Body参数:', row);
              },
              onChange: (keys) => {
                // 处理可编辑状态变化
              }
            }}
            expandable={{ defaultExpandAllRows: true }}
          />
        </ProCard>)}
        <ProCard title="返回参数" style={{ marginTop: 24 }}>
          <EditableProTable<DataSourceReturnParams>
            rowKey="id"
            // headerTitle="返回参数"
            scroll={{ x: 1000 }}
            recordCreatorProps={{
              creatorButtonText: '添加根节点',
              record: () => ({
                id: Math.random().toString(36).substr(2, 9),
                paramName: 'newParam',
                dataType: 'String',
                desc: ''
              })
            }}
            columns={[
              {
                title: '参数名称',
                dataIndex: 'paramName',
                formItemProps: { rules: [{ required: true }] }
              },
              {
                title: '数据类型',
                dataIndex: 'dataType',
                valueType: 'select',
                valueEnum: {
                  String: 'String',
                  Int: 'Int',
                  Float: 'Float',
                  Object: 'Object',
                  Array: 'Array'
                }
              },
              {
                title: '参数说明',
                dataIndex: 'desc'
              },
              {
                title: '操作',
                valueType: 'option',
                render: (text, record, _, action) => {
                  const showAddChild = record.dataType === 'Object' || record.dataType === 'Array';
                  return [
                    <a
                      key="edit"
                      onClick={() => {
                        action?.startEditable?.(record.id);
                      }}
                    >
                      编辑
                    </a>,
                    showAddChild && (<a
                      key="add"
                      onClick={() => handleAddChild(record.id)}
                    >
                      添加子级
                    </a>),
                    <a
                      key="delete"
                      onClick={() => handleDeleteRecord(record.id)}
                    >
                      删除
                    </a>
                  ]
                }
              }
            ]}
            value={returnParamsDataSource}
            onChange={setReturnParamsDataSource}
            editable={{
              type: 'multiple',
              editableKeys, // 确保使用最新的 editableKeys 状态
              onSave: async (key, row) => {
                console.log('保存返回参数:', row);
              },
              onChange: setEditableRowKeys
            }}
            expandable={{ defaultExpandAllRows: true }}
          />
        </ProCard>
      </StepsForm.StepForm>
    </StepsForm>
  );
};

export default AddExample;