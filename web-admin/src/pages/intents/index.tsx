import { useState } from 'react';
import { Table, Tag, Button, Space, Select, Card, Statistic, Row, Col, message } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getIntents, getIntentStats, updateIntentStatus } from '@/services/intent';
import type { Intent, IntentListParams } from '@/services/intent';

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  want_collect: { label: '喜欢想收藏', color: 'red' },
  want_custom: { label: '想定制类似的', color: 'orange' },
  want_know_more: { label: '想了解更多', color: 'blue' },
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'orange' },
  viewed: { label: '已查看', color: 'blue' },
  replied: { label: '已回复', color: 'green' },
};

export default function IntentsPage() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data: intentsData, isLoading } = useQuery({
    queryKey: ['intents', typeFilter, statusFilter],
    queryFn: () => getIntents({ type: typeFilter, status: statusFilter, limit: 100 }),
  });

  const { data: stats } = useQuery({
    queryKey: ['intentStats'],
    queryFn: getIntentStats,
  });

  const intents = intentsData?.items ?? [];

  const handleStatusChange = async (id: string, status: string) => {
    await updateIntentStatus(id, status);
    message.success('状态更新成功');
    queryClient.invalidateQueries({ queryKey: ['intents'] });
    queryClient.invalidateQueries({ queryKey: ['intentStats'] });
  };

  const columns = [
    { title: '作品', dataIndex: 'craft_title', width: 120, render: (v: string, r: Intent) => v || r.craft_id },
    {
      title: '类型',
      dataIndex: 'type',
      width: 120,
      render: (type: string) => {
        const t = TYPE_MAP[type] || { label: type, color: 'default' };
        return <Tag color={t.color}>{t.label}</Tag>;
      },
    },
    { title: '留言', dataIndex: 'message', ellipsis: true },
    { title: '访客', dataIndex: 'visitor_name', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string, record: Intent) => (
        <Select
          value={status}
          size="small"
          style={{ width: 100 }}
          onChange={(val) => handleStatusChange(record.id, val)}
          options={[
            { label: '待处理', value: 'pending' },
            { label: '已查看', value: 'viewed' },
            { label: '已回复', value: 'replied' },
          ]}
        />
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 160,
      render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-',
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small"><Statistic title="意向总数" value={stats?.total ?? 0} valueStyle={{ color: '#C4956A' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="今日新增" value={stats?.todayNew ?? 0} valueStyle={{ color: '#1890FF' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="待处理" value={stats?.pending ?? 0} valueStyle={{ color: '#FAAD14' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>类型分布</div>
            <Space direction="vertical" size={2}>
              <span>收藏 {stats?.byType?.want_collect ?? 0}</span>
              <span>定制 {stats?.byType?.want_custom ?? 0}</span>
              <span>了解 {stats?.byType?.want_know_more ?? 0}</span>
            </Space>
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 8 }}>
        <Select
          placeholder="类型筛选"
          allowClear
          style={{ width: 140 }}
          value={typeFilter}
          onChange={setTypeFilter}
          options={Object.entries(TYPE_MAP).map(([k, v]) => ({ label: v.label, value: k }))}
        />
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 120 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={Object.entries(STATUS_MAP).map(([k, v]) => ({ label: v.label, value: k }))}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={intents}
        columns={columns}
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
