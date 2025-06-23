import React, { ReactNode } from 'react';
import { Modal } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { ProDescriptions } from '@ant-design/pro-components';

// 定义分类项接口
interface ClassifyItem {
    classifyId: number;
    classifyName: string;
}

interface DataAssetDetail {
    chineseName: string;
    englishName: string;
    description: string;
    classifyNameList: Array<ClassifyItem> | string;
    dataAssetFieldList:
    {
        englishName: string,
        chineseName: string,
        description: string,
        dataType: string,
        length: string,
        dataAccuracy: string,
        defaultValue: string,
        min: string,
        max: string,
        dictName?: string
    }[];
    dictVO:
    {
        dictName: string,
    }[];
}

const DataAssetDetailModal: React.FC<{
    visible: boolean;
    detailData: DataAssetDetail | null;
    onCancel: () => void;
}> = ({ visible, detailData, onCancel }) => {
    const processedFields = React.useMemo(() => {
        if (!detailData?.dataAssetFieldList) return [];
        
        return detailData.dataAssetFieldList.map(field => {
            return {
                ...field,
                min: field.min || '',
                max: field.max || '',
                defaultValue: field.defaultValue || '',
                dataAccuracy: field.dataAccuracy || '',
                length: field.length || '',
            };
        });
    }, [detailData]);

    // 处理分类名称列表
    const renderClassifyNames = (): ReactNode => {
        if (!detailData) return null;
        
        const { classifyNameList } = detailData;
        
        // 如果是字符串，直接返回
        if (typeof classifyNameList === 'string') {
            return classifyNameList;
        }
        
        // 如果是数组，则将其转换为字符串
        if (Array.isArray(classifyNameList)) {
            return classifyNameList.map((item: ClassifyItem) => item.classifyName).join(', ');
        }
        
        // 如果是单个对象（非数组）
        if (classifyNameList && typeof classifyNameList === 'object') {
            try {
                // 尝试将对象转换为字符串
                return JSON.stringify(classifyNameList);
            } catch (e) {
                return '无法解析的分类信息';
            }
        }
        
        return '无分类信息';
    };

    return (
        <Modal
            title={<div style={{ textAlign: 'center' }}>数据资产详情</div>}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            {detailData && (
                <ProDescriptions
                    column={1}
                    title={<h1>基本信息</h1>}
                    dataSource={detailData}
                >
                    <ProDescriptions.Item label="中文名称">{detailData.chineseName}</ProDescriptions.Item>
                    <ProDescriptions.Item label="英文名称">{detailData.englishName}</ProDescriptions.Item>
                    <ProDescriptions.Item label="数据资产表描述">{detailData.description}</ProDescriptions.Item>
                    <ProDescriptions.Item label="所属目录">{renderClassifyNames()}</ProDescriptions.Item>
                </ProDescriptions>
            )}
            {detailData && (
                <ProTable
                    title={() => <h1>字段信息</h1>}
                    dataSource={processedFields}
                    rowKey="englishName"
                    columns={[
                        {
                            title: '字段英文名称',
                            dataIndex: 'englishName',
                            hideInSearch: true,
                        },
                        {
                            title: '字段中文名称',
                            dataIndex: 'chineseName',
                            hideInSearch: true,
                        },
                        {
                            title: '字段说明',
                            dataIndex: 'description',
                            hideInSearch: true,
                        },
                        {
                            title: '数据类型',
                            dataIndex: 'dataType',
                            hideInSearch: true,
                        },
                        {
                            title: '数据长度',
                            dataIndex: 'length',
                            hideInSearch: true,
                        },
                        {
                            title: '数据精度',
                            dataIndex: 'dataAccuracy',
                            hideInSearch: true,
                        },
                        {
                            title: '默认值',
                            dataIndex: 'defaultValue',
                            hideInSearch: true,
                            render: (text) => text || '-'
                        },
                        {
                            title: '取值范围',
                            dataIndex: 'range',
                            hideInSearch: true,
                            render: (_, record) => {
                                if (!record.min && !record.max) return '-';
                                return <span>{record.min || '无限制'}-{record.max || '无限制'}</span>;
                            }
                        },
                        {
                            title: '枚举范围',
                            dataIndex: 'dictName',
                            hideInSearch: true,
                            render: (text) => text || '-'
                        },
                    ]}
                    pagination={false}
                    search={false}//重置、搜索按钮
                    cardBordered={true}//边框
                    options={false}//table 工具栏
                />
            )}
        </Modal>
    );
};

export default DataAssetDetailModal;