import React, { useState } from 'react';
import { Select, Table, Modal, Checkbox } from 'antd';
import { getCodeTableApi } from '@/service/CodeTable';
const { Option } = Select;

interface CodeTableReferenceProps {
  visible: boolean; // 新增 visible 属性
  data: any[] | null; // 从父组件接收的码表列表数据
  onCancel: () => void; // 用于关闭弹框的回调函数
  onSelect: (checkedCodes: number[]) => void; // 新增回调函数
}

const AddCodeTableReference: React.FC<CodeTableReferenceProps> = ({ visible, data, onCancel, onSelect }) => {
  const [selectedTableId, setSelectedTableId] = useState(null); // 新增，用于存储选中的码表ID
  const [codeTableDetails, setCodeTableDetails] = useState([]); // 新增，用于存储获取到的码表详情数据
  const [checkedCodes, setCheckedCodes] = useState([]);//存储勾选的码值
  // 获取码表详情
  const handleSelectChange = async (value: any) => {
    setSelectedTableId(value);
    try {
      const res = await getCodeTableApi({ id: value }); // 调用接口获取数据
      if (res.code === 100200) {
        setCodeTableDetails(res.data.dictDataList); // 更新码表详情数据
      } else {
        console.error('获取码表值失败:', res.msg);
      }
    } catch (error) {
      console.error('获取码表值出错:', error);
    }
  };

  const handleAddOk = () => {
    // 这里可以添加将选中码表相关数据传递回父组件的逻辑
    if (checkedCodes) {
      onSelect(checkedCodes); // 将 勾选的码值传递给父组件
    }
    onCancel();
  };

  const columns = [
    {
      title: '',
      dataIndex: '',
      render: (_, record) => (
        <Checkbox
          key={record.id}
          checked={checkedCodes.some(obj => obj.id === record.id)} // 根据状态判断是否勾选
          onChange={(e) => {
            if (e.target.checked) {
              setCheckedCodes([...checkedCodes, record]);
            } else {
              setCheckedCodes(checkedCodes.filter(obj => obj.id !== record.id));
            }
          }}
        />
      ),
      width: 30
    },

    {
      title: '码值取值',
      dataIndex: 'dictValue',
    },
    {
      title: '码值名称',
      dataIndex: 'dictLabel',
    },
    {
      title: '码值含义',
      dataIndex: 'description',
    },
  ];

  return (
    <Modal
      visible={visible} // 设置 visible 属性
      title="引用码表"
      onCancel={onCancel}
      onOk={handleAddOk}
    >
      <div>
        <div style={{ marginBottom: 10 }}>
          <Select
            placeholder="码表选择"
            value={selectedTableId} // 绑定选中的ID
            onChange={handleSelectChange} // 监听选择变化
            style={{ width: 450 }}
          >
            {data?.map(table => (
              <Option key={table.id} value={table.id}
                size="large"
              >
                {table.dictName}
              </Option>
            ))}
          </Select>
        </div>
        <Table dataSource={codeTableDetails} columns={columns} />
      </div>
    </Modal>
  );
};

export default AddCodeTableReference;