import React, { useState, useRef } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { getCodeTablesApi } from '@/service/CodeTable'

// 数据标准接口类型定义（假设已有）
interface DataSource {
  chineseName: string;
  englishName: string;
  description: string | null;
  institution: string;
  dataType: 'String' | 'Int' | 'Float' | 'Enum';
  length: number | null;
  dataAccuracy: number | null;
  min: string | null;
  max: string | null;
  dictId: number | null;
  notNull: string | null;
  defaultValue: string | null;
}


const AddDataStandard: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSubmit: (fields: DataSource) => Promise<boolean>;
  ref?: React.RefObject<{ resetForm: () => void }>;
}> = ({ visible, onCancel, onSubmit, ref }) => {
  const formRef = useRef<Form>();
  const [form] = Form.useForm();
  const [dataType, setDataType] = useState<DataSource['dataType']>('String');
  const [codeTableList, setCodeTableList] = useState<{ id: number; dictCode: string; dictName: string }[]>([]);
  // 数据类型选项
  const dataTypes = ['String', 'Int', 'Float', 'Enum'];

  // 提交表单的处理函数
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const isValid = validateFormValues(values);
      if (isValid) {
        const success = await onSubmit(values);
        if (success) {
          // 提交成功后重置表单
          if (formRef.current) {
            formRef.current.resetFields();
          }
        }
      } else {
        message.error('表单数据不合法，请检查');
      }
    } catch (error) {
      message.error('表单验证失败，请检查输入');
    }
  };




  // 表单数据合法性校验函数
  const validateFormValues = (values: DataSource) => {
    // 中文名称、英文名称、来源机构、数据类型4个字段不能为空（空格也算为空）
    if (!values.chineseName || !values.englishName || !values.institution || !values.dataType) {
      return false;
    }
    // 中文名称字段只支持中文及英文大小写
    if (!/^[a-zA-Z\u4e00-\u9fff]+$/.test(values.chineseName)) {
      return false;
    }
    // 英文名称字段只支持英文大小写、数字及下划线且只能英文开头
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(values.englishName)) {
      return false;
    }
    // 数据类型只支持String、Int、Float、Enum4种
    if (!dataTypes.includes(values.dataType)) {
      return false;
    }
    // 当数据类型为String时，可以编辑数据长度，而数据精度、取值范围最小值、取值范围最大值、枚举范围（导入时为“引用码表编号”）必须为空
    if (values.dataType === 'String') {
      if (values.dataAccuracy || values.min || values.max || values.dictId) {
        return false;
      }
      if (values.length && (!Number.isInteger(Number(values.length)) || Number(values.length) <= 0)) {
        return false;
      }
    }
    // 当数据类型为Int时，可以编辑取值范围最小值及取值范围最大值，而数据长度、数据精度、枚举范围（导入时为“引用码表编号”）必须为空
    if (values.dataType === 'Int') {
      if (values.dataAccuracy || values.length || values.dictId) {
        return false;
      }
      if (values.min && (!Number.isInteger(Number(values.min)))) {
        return false;
      }
      if (values.max && (!Number.isInteger(Number(values.max)))) {
        return false;
      }
    }
    // 当数据类型为Float时，可以编辑数据精度、取值范围最小值、取值范围最大值，而数据长度、枚举范围（导入时为“引用码表编号”）必须为空
    if (values.dataType === 'Float') {
      if (values.length || values.dictId) {
        return false;
      }
      if (values.dataAccuracy && (!Number.isInteger(Number(values.dataAccuracy)) || Number(values.dataAccuracy) < 0)) {
        return false;
      }
      if (values.min && (!Number.isInteger(Number(values.min)) && isNaN(Number(values.min)))) {
        return false;
      }
      if (values.max && (!Number.isInteger(Number(values.max)) && isNaN(Number(values.max)))) {
        return false;
      }
    }
    // 当数据类型为Enum时，可以编辑枚举范围（导入时为“引用码表编号”），而数据长度、数据精度、取值范围最小值、取值范围最大值必须为空
    if (values.dataType === 'Enum') {
      if (values.dataAccuracy || values.min || values.max || values.length) {
        return false;
      }
    }
    // 数据长度只能是正整数
    if (values.length && (!Number.isInteger(Number(values.length)) || Number(values.length) <= 0)) {
      return false;
    }
    // 数据精度是非负整数
    if (values.dataAccuracy && (!Number.isInteger(Number(values.dataAccuracy)) || Number(values.dataAccuracy) < 0)) {
      return false;
    }
    return true;
  };

  const handleDataTypeChange = async (value: DataSource['dataType']) => {
    setDataType(value);
    if (value === 'Enum') {
      try {
        const response = await getCodeTablesApi({
          current: 2,
          size: 10,
          dictName: "",
          status: ""
        });
        if (response.code === 100200) {
          setCodeTableList(response.data.records);
        }
      } catch (error) {
        message.error('获取码表列表失败，请重试');
      }
    } else {
      setCodeTableList([]);
    }
  };

  return (
    <Modal
      visible={visible}
      title="新增数据标准"
      onCancel={onCancel}
      okText="提交"
      cancelText="取消"
    >
      <Form
        ref={formRef}
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="chineseName"
          label="中文名称"
          rules={[{ required: true, message: '中文名称为必填项' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="englishName"
          label="英文名称"
          rules={[{ required: true, message: '英文名称为必填项' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="标准说明"
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="institution"
          label="来源机构"
          rules={[{ required: true, message: '来源机构为必填项' }]}
        >
          <Select>
            {/* 假设这里从后端获取数据填充选项，暂时写死示例 */}
            <Select.Option value="数宜信">数宜信</Select.Option>
            <Select.Option value="数宜信/数据中心">数宜信/数据中心</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="dataType"
          label="数据类型"
          rules={[{ required: true, message: '数据类型为必填项' }]}
        >
          <Select onChange={handleDataTypeChange}>
            {dataTypes.map(type => (
              <Select.Option key={type} value={type}>{type}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        {dataType === 'String' && (
          <Form.Item
            name="length"
            label="数据长度"
          >
            <Input />
          </Form.Item>
        )}
        {dataType === 'Int' && (
          <>
            <Form.Item
              name="min"
              label="取值范围最小值"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="max"
              label="取值范围最大值"
            >
              <Input />
            </Form.Item>
          </>
        )}
        {dataType === 'Float' && (
          <>
            <Form.Item
              name="dataAccuracy"
              label="数据精度"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="min"
              label="取值范围最小值"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="max"
              label="取值范围最大值"
            >
              <Input />
            </Form.Item>
          </>
        )}
        {dataType === 'Enum' && (
          <Form.Item
            name="dictId"
            label="枚举范围（引用码表编号）"
          >
            <Select>
              {codeTableList.map(item => (
                <Select.Option key={item.id} value={item.id}>
                  {item.dictName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
        <Form.Item
          name="defaultValue"
          label="默认值"
        >
          <Input />
        </Form.Item>
      </Form>
      <Button
        type="primary"
        htmlType="submit"
        onClick={handleSubmit}
      >
        提交
      </Button>
    </Modal>
  );
};

export default AddDataStandard;