import React, { useState } from 'react';
import { Modal, Button, message } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { ProDescriptions } from '@ant-design/pro-components';
import { ScriptTestApi } from '@/service/Script';

interface ScriptDetail {
    className: string;//类名
    classifyId: number;//脚本分类
    description: string | null;//脚本描述
    fileName: string;//文件名
    functionName: string;//函数名
    id: number;//脚本id
    inputParams: {
        defaultValue: string,//默认值
        notNull: string,//是否必填
        dataType: string,//数据类型
        paramName: string//参数名
    }[];//输入参数
    outputParams: {
        desc: string,
        dataType: string,
        paramName: string
    }[];//输出参数
    scriptFileUrl: string;//脚本文件
    scriptName: string;//脚本名称
    scriptType: string;//脚本类型，默认python
}

const ScriptTest: React.FC<{
    visible: boolean;
    onCancel: () => void;
    scriptData: ScriptDetail | null;
}> = ({ visible, onCancel, scriptData }) => {
    const [testResult, setTestResult] = useState(''); // 添加状态来存储测试结果
    const handleTest = async () => {
        if (scriptData) {
            const hide = message.loading('正在进行接口测试');
            try {
                // 构建传递给接口的参数
                const params = {
                    id: scriptData.id,
                    inputParam: scriptData.inputParams,
                };
                const response = await ScriptTestApi(params);
                if (response.code === 100200) {
                    hide();
                    message.success('接口测试成功');
                    setTestResult(JSON.stringify(response.data, null, 2)); // 将返回的数据存储到状态中
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
            title={<div style={{ textAlign: 'center' }}>脚本测试</div>}
            visible={visible}
            onCancel={onCancel}
            okText="关闭"
            width={800}
        >
            <div style={{ display: 'flex' }}>
                <div style={{ width: '50%', padding: 10 }}>
                    {scriptData && (
                        <ProDescriptions
                            column={1}
                            data={scriptData}
                        >
                            <ProDescriptions.Item label="脚本名称" >{scriptData.scriptName}</ProDescriptions.Item>
                        </ProDescriptions>
                    )}
                    {scriptData && (
                        <ProTable
                            title={() => <h3>输入参数</h3>}
                            dataSource={scriptData.inputParams} // 这里仅以 inputParam 为例，你可以根据需要展示更多字段
                            columns={[
                                {
                                    title: '参数名称',
                                    dataIndex: 'paramName',
                                    hideInSearch: true,
                                },
                                {
                                    title: '参数位置',
                                    dataIndex: 'dataType',
                                    hideInSearch: true,
                                },
                                {
                                    title: '数据类型',
                                    dataIndex: 'notNull',
                                    hideInSearch: true,
                                },
                                {
                                    title: '测试值',
                                    dataIndex: 'defaultValue',
                                    hideInSearch: true,
                                    render: (_, record) => (
                                        <input
                                            type="text"
                                            defaultValue={record.defaultValue}
                                            onChange={(e) => {
                                                // 更新输入参数的默认值
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

export default ScriptTest;