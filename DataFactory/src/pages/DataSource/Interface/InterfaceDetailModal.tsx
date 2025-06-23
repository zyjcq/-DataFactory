import React from 'react';
import { Modal } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { ProDescriptions } from '@ant-design/pro-components';

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
  detailData: InterfaceDetail | null;
  onCancel: () => void;
}> = ({ visible, detailData, onCancel }) => {
  return (
    <Modal
      title={<div style={{ textAlign:'center'}}>接口详情</div>}
      visible={visible}
      onCancel={onCancel}
      okText="关闭"
      width={800}
    >
      {detailData && (
        <ProDescriptions
          column={2}
          title={<h1>基本信息</h1>}
          data={detailData}
        >
          <ProDescriptions.Item label="接口名称" >{detailData.interfaceName}</ProDescriptions.Item>
          <ProDescriptions.Item label="请求协议" >{detailData.protocol}</ProDescriptions.Item>
          <ProDescriptions.Item label="接口分类" >{detailData.classifyName}</ProDescriptions.Item>
          <ProDescriptions.Item label="请求方式" >{detailData.requestMethod}</ProDescriptions.Item>
          <ProDescriptions.Item label="支持格式" >JSON</ProDescriptions.Item>
          <ProDescriptions.Item label="IP端口" >{detailData.ipAndPort}</ProDescriptions.Item>
          <ProDescriptions.Item label="超时时间">{detailData.timeout}</ProDescriptions.Item>
          <ProDescriptions.Item label="Path" >{detailData.path}</ProDescriptions.Item>
          <ProDescriptions.Item label="接口描述" >{detailData.description}</ProDescriptions.Item>
        </ProDescriptions>
      )}
      {detailData && (
        <ProTable
          title={() => <h1>请求参数</h1>}
          dataSource={detailData.inputParam} // 这里仅以 inputParam 为例，你可以根据需要展示更多字段
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
              title: '默认请求参数',
              dataIndex: 'defaultValue',
              hideInSearch: true,
            },
            {
              title: '说明',
              dataIndex: 'desc',
              hideInSearch: true,
            },
          ]}
          pagination={false}
          search={false}
          cardBordered={true}
          options={false}
        />
      )}
      {detailData && (
        <ProTable
          title={() => <h1>请求Body</h1>}
          dataSource={detailData.inputParam} // 这里仅以 inputParam 为例，你可以根据需要展示更多字段
          columns={[
            {
              title: '参数名称',
              dataIndex: 'paramName',
              hideInSearch: true,
            },
            {
              title: '数据类型',
              dataIndex: 'dataType',
              hideInSearch: true,
            },
            {
              title: '参数说明',
              dataIndex: 'desc',
              hideInSearch: true,
            },
          ]}
          pagination={false}
          search={false}//搜索框
          cardBordered={true}//外边框
          options={false}//设置操作按钮
        />
      )}
      {detailData && (
        <ProTable
          title={() => <h1>接口返回参数</h1>}
          dataSource={detailData.outputParam} // 这里仅以 inputParam 为例，你可以根据需要展示更多字段
          columns={[
            {
              title: '参数名称',
              dataIndex: 'paramName',
              hideInSearch: true,
            },
            {
              title: '数据类型',
              dataIndex: 'dataType',
              hideInSearch: true,
            },
            {
              title: '参数说明',
              dataIndex: 'desc',
              hideInSearch: true,
            },
          ]}
          pagination={false}
          search={false}//搜索框
          cardBordered={true}//外边框
          options={false}//设置操作按钮
        />
      )}
    </Modal>
  );
};

export default InterfaceDetailModal;