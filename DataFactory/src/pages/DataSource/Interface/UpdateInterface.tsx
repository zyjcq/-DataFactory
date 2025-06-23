import React, { useRef, useState, useEffect } from 'react';
import { Button, message } from 'antd';
import {
  ProFormInstance,
  ProForm,
  EditableProTable,
  ProCard,
  ProFormText,
  StepsForm,
} from '@ant-design/pro-components';
import { useParams, history } from '@umijs/max';
import { getInterfaceApi, updateInterfaceApi,addInterfaceParamsApi } from '@/service/Interface';
// 数据标准接口类型定义
interface DataInterfaceSource {
  id:number;
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
  id: string;
  paramName: string;
  position: string;
  dataType: string;
  notNull: string;
  defaultValue: string;
  desc: string;
  children?: DataSourceInputParams[];
};

//请求Body
type DataSourceRequestBody = {
  id: string;
  desc: string;
  dataType: string;
  paramName: string;
  notNull: string;
  defaultValue: string;
  children?: DataSourceInputParams[];
};

//返回参数
type DataSourceReturnParams = {
  id: string;
  desc: string;
  dataType: string;
  paramName: string;
  children?: DataSourceReturnParams[];
};

const UpdateInterface: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const formMapRef = useRef<React.MutableRefObject<ProFormInstance<any> | undefined>[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceInputParams[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [returnParamsDataSource, setReturnParamsDataSource] = useState<DataSourceReturnParams[]>([]);
  const [requestBodyDataSource, setRequestBodyDataSource] = useState<DataSourceRequestBody[]>([]);
  const [formValues, setFormValues] = useState<any>({});
  // 获取接口详情
  useEffect(() => {
    const fetchInterfaceDetail = async () => {
      try {
        const response = await getInterfaceApi({ id: Number(id) });
        if (response.code === 100200) {
          // const data = response.data;
          // 设置表单值，确保数据类型正确
          // formValues.set
          setFormValues({
            classifyId: String(response.data.classifyId),
            interfaceName: response.data.interfaceName,
            source: response.data.source,
            description: response.data.description,
            protocol: response.data.protocol,
            ipAndPort: response.data.ipAndPort,
            path: response.data.path,
            requestMethod: response.data.requestMethod,
            timeout: String(response.data.timeout),
          });
          console.log("获取的数据", formValues);

          // 设置输入参数、请求体和返回参数数据
          if (response.data.inputParam) {
            setDataSource(response.data.inputParam);
          }
          if (response.data.inputParamBody) {
            setRequestBodyDataSource(response.data.inputParamBody);
          }
          if (response.data.outputParam) {
            // 为返回参数添加唯一ID
            const processedOutputParams = response.data.outputParam.map((param: any, index: number) => ({
              ...param,
              id: param.id || `output-${index}`,
              children: param.children?.map((child: any, childIndex: number) => ({
                ...child,
                id: child.id || `output-${index}-child-${childIndex}`,
              }))
            }));
            setReturnParamsDataSource(processedOutputParams);
          }
        } else {
          message.error(response.msg || '获取接口信息失败');
        }
      } catch (error) {
        message.error('获取接口信息失败，请重试');
      }
    };

    if (id) {
      fetchInterfaceDetail();
    }
  }, [id]);
  console.log("获取的数据", formValues);
  React.useEffect(() => {
    // 当formValues变化时，更新表单的初始值
    if(Object.keys(formValues).length > 0){
      formMapRef.current?.forEach((formInstanceRef) => {
        formInstanceRef?.current?.setFieldsValue(formValues);
      });
    }
    // 这里可以添加一些调试语句，确保formValues正确更新
    // console.log('获取的表单值', formValues);
    // console.log('输入参数', dataSource);
    // console.log('请求体', requestBodyDataSource);
    // console.log('返回参数', returnParamsDataSource);
  }, [formValues,formMapRef]);
  const handleCancel = () => {
    formMapRef?.current?.forEach((formInstanceRef) => {
      formInstanceRef?.current?.resetFields();
    });
    history.push('/dataSource/interface');
  };
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

      const requestData: DataInterfaceSource = {
        id: Number(id),
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

      console.log('Request Data:', requestData); // 添加日志

      const response = await updateInterfaceApi(requestData);
      if (response.code === 100200) {
        message.success('提交成功');
      } else {
        message.error(response.msg || '提交失败，请重试');
      }
    } catch (error) {
      console.error('提交失败，请检查表单信息', error); // 添加日志
      message.error('提交失败，请检查表单信息');
    }
  };

const handleSaveAndExitParams = async () => {
    try {
      const formData = await Promise.all(
        formMapRef.current.map((formInstanceRef) => formInstanceRef.current?.validateFields())
      );
  
      const mergedData = formData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  
      // 从状态中获取数据
      const inputParams = dataSource;
      const requestBodyParams = requestBodyDataSource;
      const returnParams = returnParamsDataSource;
  
      // 构造请求参数
      const requestData: {
        id: number;
        inputParam: DataSourceInputParams[];
        inputParamBody: DataSourceRequestBody[];
        outputParam: DataSourceReturnParams[];
      } = {
        id:Number(id),
        inputParam: inputParams,
        inputParamBody: requestBodyParams,
        outputParam: returnParams
      };
  
      // console.log('Request Data:', requestData); // 添加日志
  
      const response = await addInterfaceParamsApi(requestData);
      if (response.code === 100200) {
        message.success('提交成功');
        // navigate(-1);
        history.push('/dataSource/interface');
        
      } else {
        message.error(response.msg || '提交失败，请重试');
      }
    } catch (error) {
      console.error('提交失败，请检查表单信息', error); // 添加日志
      message.error('提交失败，请检查表单信息');
    }
  }
  // 添加子节点函数
  const handleAddChild = (parentId: string) => {
    const newChild: DataSourceReturnParams = {
      id: Math.random().toString(36).substr(2, 9),
      paramName: 'newChild',
      dataType: 'String',
      desc: ''
    };

    setReturnParamsDataSource(prev =>
      prev.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...(item.children || []), newChild]
          };
        }
        if (item.children) {
          return {
            ...item,
            children: handleNestedAdd(item.children, parentId)
          };
        }
        return item;
      })
    );
    setEditableRowKeys(prevKeys => [...prevKeys, newChild.id]);
  };

  // 递归添加子节点辅助函数
  const handleNestedAdd = (children: DataSourceReturnParams[], parentId: string): DataSourceReturnParams[] => {
    return children.map(child => {
      if (child.id === parentId) {
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
        setEditableRowKeys(prevKeys => [...prevKeys, newChild.id]);
        return updatedChild;
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

  // 删除记录函数
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

  const handleSubmit = async (formData: any) => {
    try {
      // 处理返回参数，移除临时ID
      const processedReturnParams = returnParamsDataSource.map(param => ({
        ...param,
        id: param.id.startsWith('output-') ? undefined : param.id,
        children: param.children?.map(child => ({
          ...child,
          id: child.id.startsWith('output-') ? undefined : child.id,
        }))
      }));

      const response = await updateInterfaceApi({
        id: Number(id),
        ...formData,
        inputParam: dataSource,
        inputParamBody: requestBodyDataSource,
        outputParam: processedReturnParams
      });
      if (response.code === 100200) {
        message.success('修改成功');
        history.push('/dataSource/interface');
      } else {
        message.error(response.msg || '修改失败，请重试');
      }
    } catch (error) {
      message.error('修改失败，请重试');
    }
  };

  const InputParams = [
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
      width: '10%',
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      width: '15%',
    },
    {
      title: '参数描述',
      dataIndex: 'desc',
      width: '20%',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (text: any, record: DataSourceInputParams, _: any, action: any) => [
        <a
          key="editable"
          onClick={() => action?.startEditable?.(record.id)}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.id !== record.id));
          }}
        >
          删除
        </a>,
      ],
    },
  ];

 // 删除请求Body记录函数
 const handleDeleteRequestBodyRecord = (id: string) => {
  setRequestBodyDataSource(prev => prev.filter(item => item.id !== id));
};
  // 新增处理请求Body添加子集的函数
  const handleAddRequestBodyChild = (parentId: string) => {
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
  };

  // 新增递归处理请求Body子节点添加的辅助函数
  const handleNestedAddRequestBody = (children: DataSourceRequestBody[], parentId: string): DataSourceRequestBody[] => {
    return children.map(child => {
      if (child.id === parentId) {
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
      if (child.children) {
        return {
          ...child,
          children: handleNestedAddRequestBody(child.children, parentId)
        };
      }
      return child;
    });
  };
  const RequestBodyParams = [
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
      render: (text, record, _, action) => [
        <a
          key="edit"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="add"
          onClick={() => handleAddRequestBodyChild(record.id)}
        >
          添加子级
        </a>,
        <a
          key="delete"
          onClick={() => handleDeleteRequestBodyRecord(record.id)}
        >
          删除
        </a>
      ]

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

          console.log('修改按钮', requestData); // 添加日志

          const response = await updateInterfaceApi(requestData);
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
                <Button type="primary" onClick={async () => {
                  const formData = await Promise.all(
                    formMapRef.current.map((formInstanceRef) => formInstanceRef.current?.validateFields())
                  );
                  const mergedData = formData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
                  await handleSubmit(mergedData);
                }}>
                  保存并退出
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
                <Button type="primary" onClick={handleSaveAndExitParams
                  // async () => {
                //   const formData = await Promise.all(
                //     formMapRef.current.map((formInstanceRef) => formInstanceRef.current?.validateFields())
                //   );
                //   const mergedData = formData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
                //   await handleSubmit(mergedData);
                  
                // }}
                }
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
      <StepsForm.StepForm name="step1" title="基本参数" initialValues={formValues}>
        <ProForm.Group direction="vertical" label="基本信息">
          <ProFormText
            name="classifyId"
            label="接口分类ID"
            placeholder="请输入接口分类ID"
            // value={formValues.classifyId}
            rules={[{ required: true, message: '请输入接口分类ID' }]}
          />
          <ProFormText
            name="interfaceName"
            label="接口名称"
            placeholder="请输入接口名称"
            // initialValue={formValues.interfaceName}
            // value={formValues.interfaceName}
            rules={[{ required: true, message: '请输入接口名称' }]}
          />
          <ProFormText
            name="source"
            label="接口来源"
            placeholder="请输入接口来源"
            // value={formValues.source}
            rules={[{ required: true, message: '请输入接口来源' }]}
          />
          <ProFormText
            name="description"
            label="描述"
            placeholder="请输入描述"
            // value={formValues.description}
            rules={[{ required: true, message: '请输入描述' }]}
          />
        </ProForm.Group>
        <ProForm.Group direction="vertical" label="API参数">
          <ProFormText
            name="protocol"
            label="协议"
            placeholder="请输入协议"
            // value={formValues.protocol}
            rules={[{ required: true, message: '请输入协议' }]}
          />
          <ProFormText
            name="ipAndPort"
            label="IP端口"
            placeholder="请输入IP端口"
            // value={formValues.ipAndPort}
            rules={[{ required: true, message: '请输入IP端口' }]}
          />
          <ProFormText
            name="path"
            label="Path"
            placeholder="请输入Path"
            // value={formValues.path}
            rules={[{ required: true, message: '请输入Path' }]}
          />
          <ProFormText
            name="requestMethod"
            label="请求方式"
            placeholder="请输入请求方式"
            // value={formValues.requestMethod}
            rules={[{ required: true, message: '请输入请求方式' }]}
          />
          <ProFormText
            name="timeout"
            label="超时时间"
            placeholder="请输入超时时间"
            // value={formValues.timeout}
            rules={[{ required: true, message: '请输入超时时间' }]}
          />
        </ProForm.Group>
      </StepsForm.StepForm>

      {/* Step 2 */}
      <StepsForm.StepForm name="step2" title="参数配置">
        <EditableProTable<DataSourceInputParams>
          rowKey="id"
          headerTitle="输入参数"
          maxLength={5}
          scroll={{ x: 960 }}
          recordCreatorProps={{
            record: () => ({
              id: (Math.random() * 1000000).toFixed(0),
              paramName: '',
              position: '',
              dataType: '',
              notNull: '',
              defaultValue: '',
              desc: '',
            }),
          }}
          loading={false}
          columns={InputParams}
          value={dataSource}
          onChange={setDataSource}
          editable={{
            type: 'multiple',
            editableKeys,
            onSave: async (rowKey, data) => {
              setDataSource((prevData) => {
                const index = prevData.findIndex((item) => item.id === rowKey);
                if (index !== -1) {
                  const newData = [...prevData];
                  newData[index] = { ...newData[index], ...data };
                  return newData;
                }
                return prevData;
              });
            },
            onChange: setEditableRowKeys,
          }}
        />

        <ProCard title="请求Body" style={{ marginTop: 24 }}>
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
              onChange: () => {
                // 处理可编辑状态变化
              }
            }}
            expandable={{ defaultExpandAllRows: true }}
          />
        </ProCard>

        <ProCard title="返回参数" style={{ marginTop: 24 }}>
          <EditableProTable<DataSourceReturnParams>
            rowKey="id"
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
                render: (text, record, _, action) => [
                  <a
                    key="edit"
                    onClick={() => {
                      action?.startEditable?.(record.id);
                    }}
                  >
                    编辑
                  </a>,
                  <a
                    key="add"
                    onClick={() => handleAddChild(record.id)}
                  >
                    添加子级
                  </a>,
                  <a
                    key="delete"
                    onClick={() => handleDeleteRecord(record.id)}
                  >
                    删除
                  </a>
                ]
              }
            ]}
            value={returnParamsDataSource}
            onChange={setReturnParamsDataSource}
            editable={{
              type: 'multiple',
              editableKeys,
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

export default UpdateInterface;