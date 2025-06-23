import React from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

interface DictDataItem {
  dictValue: string;
  dictLabel: string;
  description: string;
}

interface UpdateCodeTableProps {
  visible: boolean;
  values: any;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const UpdateCodeTable: React.FC<UpdateCodeTableProps> = ({ visible, values, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  // 当传入的 values 发生变化时，更新表单数据
  React.useEffect(() => {
    if (Object.keys(values).length > 0) {
      form.setFieldsValue({
        dictName: values.dictName,
        description: values.description,
        dictDataList: values.dictDataList || []
      });
    }
  }, [values, form]);
  // console.log("传入的码值数据",form.dictDataList);
  const handleSubmit = async () => {
    try {
      const formValues = await form.validateFields();
      const { dictName, description } = formValues;
      const formDictDataList = formValues.dictDataList || [];
      // 过滤掉空的码值项
      const validDictDataList = formDictDataList.filter((item: DictDataItem) => item.dictValue || item.dictLabel || item.description);
      const formData = {
        id: values.id,
        dictName,
        description,
        dictDataList: validDictDataList
      };
      onSubmit(formData);
    } catch (errorInfo) {
      console.log('表单验证失败:', errorInfo);
    }
  };

  return (
    <Modal
      title="编辑码表"
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
            {/* 修改添加码值按钮的点击事件 */}
            <Button type="dashed" onClick={() => add()}>
              <PlusOutlined /> 添加码值
            </Button>
          </>
        )}
      </Form.List>
      </Form>
    </Modal>
  );
};

export default UpdateCodeTable;