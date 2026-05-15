import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSystemConfigs, updateSystemConfigs } from '@/services/dashboard';

export default function ConfigPage() {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const { data: configs, isLoading } = useQuery({
    queryKey: ['systemConfigs'],
    queryFn: getSystemConfigs,
  });

  useEffect(() => {
    if (configs) {
      form.setFieldsValue(configs);
    }
  }, [configs, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const configs = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      await updateSystemConfigs(configs);
      message.success('保存成功');
      queryClient.invalidateQueries({ queryKey: ['systemConfigs'] });
    } catch {
      // validation
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div style={{ maxWidth: 600 }}>
      <Card title="系统配置" style={{ borderRadius: 12 }}>
        <Form form={form} layout="vertical">
          <Form.Item name="site_name" label="站点名称" rules={[{ required: true, message: '请输入站点名称' }]}>
            <Input placeholder="手作展示" />
          </Form.Item>
          <Form.Item name="announcement" label="公告">
            <Input.TextArea rows={3} placeholder="站点公告内容" />
          </Form.Item>
          <Form.Item name="notification_enabled" label="通知开关">
            <Input placeholder="true/false" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              保存配置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
