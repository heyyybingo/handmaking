import { useState } from 'react';
import { Card, Form, Input, Select, Slider, Switch, Button, message, Tabs, Space, Typography } from 'antd';
import { SaveOutlined, UndoOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AiConfig {
  feature: string;
  promptTemplate: string;
  model: string;
  temperature: number;
  isEnabled: boolean;
}

const defaultConfigs: Record<string, AiConfig> = {
  description: {
    feature: 'description',
    promptTemplate: '请根据以下图片和标签，为这件手工作品生成一段吸引人的描述：\n\n图片：{{imageUrls}}\n标签：{{tags}}\n\n要求：\n1. 描述要突出作品的特点和匠心\n2. 语言温暖、有感染力\n3. 长度在100-200字之间',
    model: 'gpt-4',
    temperature: 0.7,
    isEnabled: true,
  },
  tags: {
    feature: 'tags',
    promptTemplate: '请为以下手工作品图片推荐3-5个合适的标签：\n\n图片：{{imageUrl}}\n描述：{{description}}\n\n要求：\n1. 标签要能准确描述作品类型、材质、风格\n2. 标签长度在2-6个字之间\n3. 返回JSON数组格式',
    model: 'gpt-4',
    temperature: 0.5,
    isEnabled: true,
  },
  image: {
    feature: 'image',
    promptTemplate: '请为以下手工作品图片提供优化建议：\n\n图片：{{imageUrl}}\n\n要求：\n1. 从构图、光线、背景等方面给出建议\n2. 建议要具体、可操作\n3. 语言简洁明了',
    model: 'gpt-4',
    temperature: 0.6,
    isEnabled: true,
  },
};

const modelOptions = [
  { label: 'GPT-4', value: 'gpt-4' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Claude 3 Opus', value: 'claude-3-opus' },
  { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet' },
];

export default function AiConfigPage() {
  const [configs, setConfigs] = useState<Record<string, AiConfig>>(defaultConfigs);
  const [activeTab, setActiveTab] = useState('description');
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setConfigs((prev) => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], ...values },
      }));
      message.success('保存成功');
    } catch {
      message.error('请检查表单');
    }
  };

  const handleReset = () => {
    const defaultConfig = defaultConfigs[activeTab];
    form.setFieldsValue(defaultConfig);
    message.info('已恢复默认配置');
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    form.setFieldsValue(configs[key]);
  };

  const items = [
    {
      key: 'description',
      label: 'AI描述生成',
      children: (
        <Form form={form} layout="vertical" initialValues={configs.description}>
          <Form.Item
            name="isEnabled"
            label="启用功能"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="promptTemplate"
            label="Prompt模板"
            rules={[{ required: true, message: '请输入Prompt模板' }]}
          >
            <TextArea rows={8} placeholder="输入Prompt模板..." />
          </Form.Item>

          <Form.Item name="model" label="AI模型">
            <Select options={modelOptions} />
          </Form.Item>

          <Form.Item name="temperature" label="温度参数">
            <Slider min={0} max={2} step={0.1} marks={{ 0: '精确', 1: '平衡', 2: '创意' }} />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'tags',
      label: 'AI标签建议',
      children: (
        <Form form={form} layout="vertical" initialValues={configs.tags}>
          <Form.Item
            name="isEnabled"
            label="启用功能"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="promptTemplate"
            label="Prompt模板"
            rules={[{ required: true, message: '请输入Prompt模板' }]}
          >
            <TextArea rows={8} placeholder="输入Prompt模板..." />
          </Form.Item>

          <Form.Item name="model" label="AI模型">
            <Select options={modelOptions} />
          </Form.Item>

          <Form.Item name="temperature" label="温度参数">
            <Slider min={0} max={2} step={0.1} marks={{ 0: '精确', 1: '平衡', 2: '创意' }} />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'image',
      label: 'AI图片优化',
      children: (
        <Form form={form} layout="vertical" initialValues={configs.image}>
          <Form.Item
            name="isEnabled"
            label="启用功能"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="promptTemplate"
            label="Prompt模板"
            rules={[{ required: true, message: '请输入Prompt模板' }]}
          >
            <TextArea rows={8} placeholder="输入Prompt模板..." />
          </Form.Item>

          <Form.Item name="model" label="AI模型">
            <Select options={modelOptions} />
          </Form.Item>

          <Form.Item name="temperature" label="温度参数">
            <Slider min={0} max={2} step={0.1} marks={{ 0: '精确', 1: '平衡', 2: '创意' }} />
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>AI配置管理</Title>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={items}
        />
        <Space style={{ marginTop: 16 }}>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存配置
          </Button>
          <Button icon={<UndoOutlined />} onClick={handleReset}>
            恢复默认
          </Button>
        </Space>
      </Card>
    </div>
  );
}
