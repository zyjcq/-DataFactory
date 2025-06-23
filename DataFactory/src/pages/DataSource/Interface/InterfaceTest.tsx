import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { ProDescriptions } from '@ant-design/pro-components';
import { connectInterfaceApi } from '@/service/Interface';

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

const InterfaceDetailModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  interfaceData: InterfaceDetail | null;
}> = ({ visible, onCancel, interfaceData }) => {
  const [testResult, setTestResult] = useState(''); // 添加状态变量


  const handleTest = async () => {
    if (interfaceData) {
      const hide = message.loading('正在进行接口测试');
      try {
        // 构建传递给接口的参数
        const params = {
          id: interfaceData.id,
          inputParam: interfaceData.inputParam,
          requestMethod: interfaceData.requestMethod,
          url: interfaceData.protocol + "://" + interfaceData.ipAndPort + interfaceData.path,
        };
        // console.log("请求路径", params.url);
        const response = await connectInterfaceApi(params);
        if (response.code === 100200) {
          hide();
          message.success('接口测试成功');
          setTestResult(JSON.stringify(response.data, null, 2)); // 存储返回结果
        } else {
          hide();
          message.error(response.msg || '接口测试失败，请重试');
        }
      } catch (error) {
        hide();
        message.error('接口测试失败，请重试');
      }
    }
  };

  return (
    <Modal
      title={<div style={{ textAlign: 'center' }}>接口详情</div>}
      visible={visible}
      onCancel={() => {
        setTestResult('');
        onCancel();
      }}
      okText="关闭"
      width={1200}
    >
      {interfaceData && (
        <ProDescriptions
          column={1}
          title={<h4>接口名称:{interfaceData.interfaceName}</h4>}
          data={interfaceData}
        >
          {/* <ProDescriptions.Item label="接口名称" >{interfaceData.interfaceName}</ProDescriptions.Item> */}
          <ProDescriptions.Item label="请求协议" >{interfaceData.protocol}://{interfaceData.ipAndPort}{interfaceData.path}</ProDescriptions.Item>
          <ProDescriptions.Item label="请求方式" >{interfaceData.requestMethod}</ProDescriptions.Item>
        </ProDescriptions>
      )}
      <div style={{ display: 'flex' }}>
        <div style={{ width: '70%', padding: 10 }}>
          {interfaceData && (
            <ProTable
              title={() => <h1>输入参数</h1>}
              dataSource={interfaceData.inputParam} // 这里仅以 inputParam 为例，你可以根据需要展示更多字段
              columns={[
                {
                  title: '参数名称',
                  dataIndex: 'paramName',
                  hideInSearch: true,
                },
                {
                  title: '参数位置',
                  dataIndex: 'position',
                  hideInSearch: true,
                },
                {
                  title: '数据类型',
                  dataIndex: 'dataType',
                  hideInSearch: true,
                },
                {
                  title: '是否必填',
                  dataIndex: 'notNull',
                  hideInSearch: true,
                },
                {
                  title: '默认值',
                  dataIndex: 'defaultValue',
                  valueType: 'text',
                  hideInSearch: true,
                  render: (_, record) => (
                    <input
                      type="text"
                      defaultValue={record.defaultValue}
                      onChange={(e) => {
                        record.defaultValue = e.target.value;
                      }}
                    />
                  ),
                },
              ]}
              pagination={false}
              search={false}
              cardBordered={true}
              options={false}
            />
          )}
        </div>
        <div style={{ width: '50%', padding: 10 }}>
          返回结果
          <textarea
            rows={10}
            value={testResult}
            style={{ width: '100%' }}
            readOnly // 设置为只读，防止用户手动修改
          />
        </div>
      </div>
      <Button type="primary" onClick={handleTest}>测试</Button>
    </Modal>
  );
};

export default InterfaceDetailModal;