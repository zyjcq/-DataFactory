import React, { useEffect, useState } from 'react';
import { ProTable, ProDescriptions } from '@ant-design/pro-components';
import { Modal, Button, Form, Input, Space } from 'antd';
import { getCodeTablesApi, getCodeTableApi, addCodeTableApi } from '@/service/CodeTable';
import CodeTableReference from './CodeTableReference';
import AddCodeTableReference from './AddCodeTableReference';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

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

interface AddCodeTableDetail {
  dictDataList: {
    id: number;
    dictLabel: string;
    dictValue: string;
    description: string | null;
  }[];
}

interface CodeTableModalProps {
  visible: boolean;
  detailDataId: { id: number } | null;
  onCancel: () => void;
  onConfirm: (id: number) => void;
  onAddConfirm: (data: AddCodeTableDetail) =>void;
  onClearDetailDataId: () => void; // 新增回调函数
}

const CodeTableModal: React.FC<CodeTableModalProps> = ({
  visible,
  detailDataId,
  onCancel,
  onConfirm,
  onAddConfirm,
  onClearDetailDataId,
}) => {
  // 引用码表子组件显示与隐藏
  const [CodeTableReferenceVisible, setCodeTableReferenceVisible] = useState<boolean>(false);
  // 新增码表码值子组件显示与隐藏
  const [AddCodeTableReferenceVisible, setAddCodeTableReferenceVisible] = useState<boolean>(false);
  const [CodeTableData, setCodeTableData] = useState<CodeTableDetail | null>(null);
  // 引用码表获取的全部值
  const [CodeTableReferenceData, setCodeTableReferenceData] = useState<CodeTableDetail | null>(null);
  // 新增一个状态来管理 detailDataId，因为 props 不应该被直接修改
  const [codeTableDataId, setCodeTableDataId] = useState<{ id: number } | null>(detailDataId);
  // 新增一个状态来管理 detailDataId，因为 props 不应该被直接修改
  const [addCodeTableData, setAddCodeTableData] = useState<AddCodeTableDetail | null>(null);
  // 初始化表单实例
  const [form] = Form.useForm();

  // 码表引用
  const handleCodeTableSelect = (id: number) => {
    // 更新内部状态 internalDetailDataId
    setCodeTableDataId({ id });
    // console.log('selected id:', id);
  };

  // 新增码表码值
  const handleAddCodeTableSelect = (codeObjects: {
    id: number;
    dictLabel: string;
    dictValue: string;
    description: string | null;
  }[]) => {
    setAddCodeTableData({ dictDataList: codeObjects });
    // 回填数据到表单
    form.setFieldsValue({
      dictDataList: codeObjects
    });
    console.log('新增码表码值', codeObjects);
  };

  // 新增码表码值确定按钮点击事件
  const handleAddCodeTableSubmit = async () => {
    if (addCodeTableData) {
      try {
        // 获取表单的全部值
        const formValues = form.getFieldsValue();
        const { dictName, description, dictDataList } = formValues;
        const validDictDataList = dictDataList.filter((item) => item.dictValue || item.dictLabel || item.description);
        const dataToSubmit = {
          dictName,
          description,
          dictDataList: validDictDataList
        };
        // 调用接口并传递整理后的数据
        const res = await addCodeTableApi(dataToSubmit);
        if (res.code === 100200) {
          console.log('新增码表码值成功');
          // 打印返回的参数
          console.log('返回的参数:', res);
          setCodeTableDataId(res.data.id);
          console.log('设置新增返回codeTableDataId:', codeTableDataId);
          onConfirm(res.data.id);
          // 这里可以添加成功后的其他逻辑，比如关闭模态框等
          onCancel();
        } else {
          console.error('新增码表码值失败:', res.msg);
        }
      } catch (error) {
        console.error('新增码表码值出错:', error);
      }
    }
    setCodeTableData(null);
    // setCodeTableDataId(null);
    setAddCodeTableData(null);
    // console.log('新增码表码值', addCodeTableData);
    
  };

  // 监听 detailDataId 的变化
  useEffect(() => {
    if (detailDataId) {
      setCodeTableDataId(detailDataId);
    }
  }, [detailDataId]);
  // 引用码表确定按钮点击事件
  const handleOk = () => {
    if (codeTableDataId) {
      onConfirm(codeTableDataId.id); // 调用回调函数传递选中的 id
      setCodeTableDataId(null);
    } else if (addCodeTableData) {
      handleAddCodeTableSubmit();
    }
    setCodeTableData(null);
    // setCodeTableDataId(null);
    onCancel();
  };
  // 新增码表码值确定按钮点击事件
  // const handleAddOk = () => {
  //   if (addCodeTableData) {
  //     onAddConfirm(addCodeTableData); // 调用回调函数传递选中的 id
  //     setCodeTableDataId(null);
  //   }
  //   setCodeTableData(null);
  //   // setCodeTableDataId(null);
  //   onCancel();
  // };
   // 监听 addCodeTableData 的变化
useEffect(() => {
  if (addCodeTableData) {
    console.log('codeTableDataId 更新为:', addCodeTableData);
    onAddConfirm(addCodeTableData); // 在这里调用 onConfirm
  }
}, [addCodeTableData]);
  // 监听 codeTableDataId 的变化
useEffect(() => {
  if (codeTableDataId) {
    console.log('codeTableDataId 更新为:', codeTableDataId);
    onConfirm(codeTableDataId.id); // 在这里调用 onConfirm
  }
}, [codeTableDataId]);

  const handleClearCodeTable = () => {
    setCodeTableDataId(null);
    setCodeTableData(null);
    onClearDetailDataId();
    // 通知父组件更新相关的 dictId
    onConfirm(null);
    console.log('解除码表引用', codeTableDataId, detailDataId);
  };

  useEffect(() => {
    const fetchCodeTable = async () => {
      if (detailDataId || codeTableDataId) {
        try {
          let resquestId;
          if (codeTableDataId) {
            console.log("codeTableDataId:", codeTableDataId,detailDataId);

            resquestId = codeTableDataId;
          } else if (detailDataId) {
            console.log('detailDataId:', detailDataId);
            resquestId = detailDataId;
          }
          console.log('resquestId:', resquestId);
          
          const res = await getCodeTableApi(resquestId);
          if (res.code === 100200) {
            setCodeTableData(res.data);
          } else {
            console.error('获取码表数据失败:', res.msg);
          }
        } catch (error) {
          console.error('获取码表数据出错:', error);
        }
      } else {
        setCodeTableData(null);
      }
    };
    fetchCodeTable();
  }, [detailDataId, codeTableDataId]);

  return (
    <Modal
      title={<div style={{ textAlign: 'center' }}>码值定义</div>}
      visible={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
    >
      {CodeTableData ? (
        // 引用码表数据展示部分，保持不变
        <>
          <Button
            type="link"
            style={{ float: 'right' }}
            onClick={handleClearCodeTable}
          >
            解除码表引用
          </Button>
          <ProDescriptions
            column={2}
            data={CodeTableData}
          >
            <ProDescriptions.Item label="引用码表名称">{CodeTableData?.dictName}</ProDescriptions.Item>
          </ProDescriptions>
          <ProTable
            dataSource={CodeTableData?.dictDataList}
            columns={[
              {
                title: '码值取值',
                dataIndex: 'dictValue',
                hideInSearch: true,
              },
              {
                title: '码值名称',
                dataIndex: 'dictLabel',
                hideInSearch: true,
              },
              {
                title: '编码含义',
                dataIndex: 'description',
                hideInSearch: true,
              },
            ]}
            pagination={false}
            search={false}
            cardBordered={true}
            options={false}
          />
        </>
      ) : addCodeTableData ? (
        // 新增码表码值数据展示部分
        <>
          <Button type="primary" style={{ marginRight: 10 }}
            onClick={async () => {
              // setAddCodeTableReferenceVisible(true);s
              try {
                const res = await getCodeTablesApi({
                  current: 1,
                  size: 1000,
                });
                if (res.code === 100200) {
                  setCodeTableReferenceData(res.data.records);
                } else {
                  console.error('获取码表数据失败:', res.msg);
                }
              } catch (error) {
                console.error('获取码表数据出错:', error);
              }
            }}
          >
            新增码表码值
          </Button>
          <Button type="primary" style={{ marginRight: 10 }} onClick={() => add()}>
            新增自定义码值
          </Button>
          <Form form={form} layout="vertical">
            <Form.List name="dictDataList">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'dictValue']}
                        rules={[{ required: true, message: '请输入码值取值' }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="码值取值" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'dictLabel']}
                        rules={[{ required: true, message: '请输入码值名称' }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="码值名称" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'description']}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="码值含义" />
                      </Form.Item>
                      {index > 0 && (
                        <Button icon={<MinusOutlined />} onClick={() => remove(field.name)} />
                      )}
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()}>
                    <PlusOutlined /> 添加码值
                  </Button>
                </>
              )}
            </Form.List>
            <Form.Item
              name="dictName"
              label="码表名称"
              rules={[{ required: true, message: '请输入码表名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="码表描述"
            >
              <Input.TextArea />
            </Form.Item>
          </Form>
        </>
      ) : (
        // 没有数据时的操作按钮和子组件展示部分，保持不变
        <>
          <Button type="primary" style={{ marginRight: 10 }}
            onClick={async () => {
              setAddCodeTableReferenceVisible(true);
              try {
                const res = await getCodeTablesApi({
                  current: 1,
                  pageSize: 1000,
                });
                if (res.code === 100200) {
                  setCodeTableReferenceData(res.data.records);
                } else {
                  console.error('获取码表数据失败:', res.msg);
                }
              } catch (error) {
                console.error('获取码表数据出错:', error);
              }
            }}
          >
            新增码表码值
          </Button>
          <Button type="primary" style={{ marginRight: 10 }}>
            新增自定义码值
          </Button>
          <Button
            type="primary"
            onClick={async () => {
              setCodeTableReferenceVisible(true);
              try {
                const res = await getCodeTablesApi({
                  current: 1,
                  pageSize: 1000,
                });
                if (res.code === 100200) {
                  setCodeTableReferenceData(res.data.records);
                } else {
                  console.error('获取码表数据失败:', res.msg);
                }
              } catch (error) {
                console.error('获取码表数据出错:', error);
              }
            }}
          >
            引用码表
          </Button>
          {/* 引用码表子组件 */}
          <CodeTableReference
            visible={CodeTableReferenceVisible}
            onCancel={() => setCodeTableReferenceVisible(false)}
            data={CodeTableReferenceData}
            onSelect={handleCodeTableSelect}
          >
          </CodeTableReference>
          {/* 新增码表码值子组件 */}
          <AddCodeTableReference
            visible={AddCodeTableReferenceVisible}
            onCancel={() => setAddCodeTableReferenceVisible(false)}
            data={CodeTableReferenceData}
            onSelect={handleAddCodeTableSelect}
          >
          </AddCodeTableReference>
          <ProTable
            dataSource={[]}
            columns={[
              {
                title: '码值取值',
                dataIndex: 'dictValue',
                hideInSearch: true,
                formItemProps: {
                  rules: [{ required: true, message: '请输入码值取值' }],
                },
              },
              {
                title: '码值名称',
                dataIndex: 'dictLabel',
                hideInSearch: true,
                formItemProps: {
                  rules: [{ required: true, message: '请输入码值名称' }],
                },
              },
              {
                title: '编码含义',
                dataIndex: 'description',
                hideInSearch: true,
              },
            ]}
            pagination={false}
            search={false}
            cardBordered={true}
            options={false}
          />
        </>
      )}
    </Modal>
  );
};

export default CodeTableModal;