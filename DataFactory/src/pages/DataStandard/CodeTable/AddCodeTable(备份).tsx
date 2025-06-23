import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

interface DictDataItem {
  dictValue: string;
  dictLabel: string;
  description: string;
}

interface AddCodeTableProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (formData: any) => void;
}

const AddCodeTable = forwardRef<{ resetForm: () => void }, AddCodeTableProps>(({ visible, onCancel, onSubmit }, ref) => {
  const [form] = Form.useForm();
  const [dictDataList, setDictDataList] = useState<DictDataItem[]>([
    { dictValue: '', dictLabel: '', description: '' }
  ]);

  const handleAddCodeValue = () => {
    setDictDataList([...dictDataList, { dictValue: '', dictLabel: '', description: '' }]);
  };

  const handleRemoveCodeValue = (index: number) => {
    const newList = [...dictDataList];
    newList.splice(index, 1);
    setDictDataList(newList);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { dictName, description } = values;
      const formDictDataList = values.dictDataList || [];
      const validDictDataList = formDictDataList.filter((item: DictDataItem) => item.dictValue || item.dictLabel || item.description);
      const formData = {
        dictName,
        description,
        dictDataList: validDictDataList
      };
      onSubmit(formData);
    } catch (errorInfo) {
      console.log('表单验证失败:', errorInfo);
    }
  };

  // 重置表单的方法
  const resetForm = () => {
    form.resetFields();
    setDictDataList([{ dictValue: '', dictLabel: '', description: '' }]);
  };

  // 暴露重置方法给父组件
  useImperativeHandle(ref, () => ({
    resetForm
  }));

  return (
    <Modal
      title="新增码表"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Form form={form} layout="vertical">
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
        <Form.Item
          name="dictDataList"
          label="码值列表"
        >
          {dictDataList.map((item, index) => (
            <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
              <Form.Item
                name={['dictDataList', index, 'dictValue']}
                rules={[{ required: true, message: '请输入码值取值' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="码值取值" />
              </Form.Item>
              <Form.Item
                name={['dictDataList', index, 'dictLabel']}
                rules={[{ required: true, message: '请输入码值名称' }]}
                style={{ flex: 1 }}
              >
                <Input placeholder="码值名称" />
              </Form.Item>
              <Form.Item
                name={['dictDataList', index, 'description']}
                style={{ flex: 1 }}
              >
                <Input placeholder="码值含义" />
              </Form.Item>
              {index > 0 && (
                <Button icon={<MinusOutlined />} onClick={() => handleRemoveCodeValue(index)} />
              )}
            </Space>
          ))}
          <Button type="dashed" onClick={handleAddCodeValue}>
            <PlusOutlined /> 添加码值
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default AddCodeTable;