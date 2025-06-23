import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { ProTable, ProDescriptions } from '@ant-design/pro-components';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import axios from 'axios';
import { options } from 'node_modules/axios/index.cjs';

interface ScriptDetail {
  className: string;
  classifyId: number;
  classifyName: string;
  description: string | null;
  fileName: string;
  functionName: string;
  id: number;
  inputParams: {
    desc: string;
    notNull: string;
    dataType: string;
    paramName: string;
  }[];
  outputParams: {
    desc: string;
    dataType: string;
    paramName: string;
  }[];
  scriptFileUrl: string;
  scriptName: string;
  scriptType: string;
}

const ScriptDetailModal: React.FC<{
  visible: boolean;
  detailData: ScriptDetail | null;
  onCancel: () => void;
}> = ({ visible, detailData, onCancel }) => {
  const [scriptContent, setScriptContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [scriptContentVisible, handleScriptContentVisible] = useState<boolean>(false); // 查看脚本内容

  useEffect(() => {
    if (detailData) {
      fetchScriptContent(detailData.scriptFileUrl);
    }
  }, [detailData]);

  const fetchScriptContent = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('网络请求失败');
      const content = await response.text();
      setScriptContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取脚本内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (url: string) => {
    try {
      const res = await axios.get(url, { timeout: 60000, responseType: 'blob' });
      const binaryData = [];
      binaryData.push(res.data);
      let urlObject = window.URL.createObjectURL(
        new Blob(binaryData, { type: "application/pdf" })
      );
      window.open(urlObject);
    } catch (error) {
      console.error('文件预览出错:', error);
    }
  };
  return (
    <Modal
      title={<div style={{ textAlign: 'center' }}>脚本详情</div>}
      visible={visible}
      onCancel={onCancel}
      okText="关闭"
      width={800}
      footer={null}//控制左下角的取消、确定按钮
    >
      {detailData && (
        <ProDescriptions
          column={1}
          title={<h2>基本信息</h2>}
          data={detailData}
        >
          <ProDescriptions.Item label="脚本名称">
            <a
              onClick={async (e) => {
                e.preventDefault();
                await fetchScriptContent(detailData.scriptFileUrl);
                // if(scriptContent){
                handleScriptContentVisible(true);
                // }
              }}
            >
              {detailData.scriptName}
            </a>
          </ProDescriptions.Item>
          <ProDescriptions.Item label="脚本分类">{detailData.classifyName}</ProDescriptions.Item>
          <ProDescriptions.Item label="脚本类型">{detailData.scriptType}</ProDescriptions.Item>
          <ProDescriptions.Item label="类名">{detailData.className}</ProDescriptions.Item>
          <ProDescriptions.Item label="函数名">{detailData.functionName}</ProDescriptions.Item>
          <ProDescriptions.Item label="描述">{detailData.description}</ProDescriptions.Item>
        </ProDescriptions>
      )}
      <Modal
        title={'脚本内容'}
        width={600}
        visible={scriptContentVisible}
        onCancel={() => {
          handleScriptContentVisible(false);
        }}
        footer={null}//控制左下角的取消、确定按钮
      >
        {loading && <div style={{ padding: '16px' }}>正在加载代码...</div>}
        {error && <div style={{ color: 'red', padding: '16px' }}>{error}</div>}
        {scriptContent && (
          <div style={{ padding: '16px', whiteSpace: 'pre-wrap' }}>
            <SyntaxHighlighter
              language="python"
              style={vs}
              showLineNumbers={true}
              wrapLines={true}
            >
              {scriptContent}
            </SyntaxHighlighter>
          </div>
        )}
      </Modal>
      <h1>参数信息</h1>
      {detailData && (
        <ProTable
          title={() => <h3>输入参数</h3>}
          dataSource={detailData.inputParams}
          columns={[
            { title: '参数名称', dataIndex: 'paramName' },
            { title: '数据类型', dataIndex: 'dataType' },
            { title: '是否必填', dataIndex: 'notNull' },
            { title: '参数描述', dataIndex: 'desc' },
          ]}
          pagination={false}
          search={false}
          cardBordered
          options={false}
        />
      )}
      {detailData && (
        <ProTable
          title={() => <h3>输出参数</h3>}
          dataSource={detailData.outputParams}
          columns={[
            { title: '参数名称', dataIndex: 'paramName' },
            { title: '数据类型', dataIndex: 'dataType' },
            { title: '参数描述', dataIndex: 'desc' },
          ]}
          pagination={false}
          search={false}
          cardBordered
          options={false}
        />
      )}
    </Modal>
  );
};

export default ScriptDetailModal;