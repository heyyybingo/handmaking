import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, Button, Tag, Space, Select, message, Popconfirm, Image,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCrafts, deleteCraft,
  batchAction,
} from '@/services/craft';
import type { Craft } from '@/services/craft';
import type { Category } from '@/services/category';
import { getCategories } from '@/services/category';
import FloatingPreview from '@/components/FloatingPreview';
import CraftPreview from '@/components/CraftPreview';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  published: { color: 'green', label: '已发布' },
  archived: { color: 'orange', label: '已归档' },
};

export default function CraftsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCraft, setSelectedCraft] = useState<Craft | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const { data: craftsData, isLoading } = useQuery({
    queryKey: ['crafts', statusFilter],
    queryFn: () => getCrafts({ status: statusFilter, limit: 100 }),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const crafts = craftsData?.items ?? [];

  const handlePreview = (craft: Craft) => {
    setSelectedCraft(craft);
  };

  const handleClosePanel = () => {
    setSelectedCraft(null);
  };

  const handleDelete = async (id: string) => {
    await deleteCraft(id);
    message.success('删除成功');
    if (selectedCraft?.id === id) {
      handleClosePanel();
    }
    queryClient.invalidateQueries({ queryKey: ['crafts'] });
  };

  const handleBatch = async (action: string) => {
    if (selectedRowKeys.length === 0) return;
    await batchAction({ ids: selectedRowKeys, action: action as 'publish' | 'unpublish' | 'delete' });
    message.success('批量操作成功');
    setSelectedRowKeys([]);
    queryClient.invalidateQueries({ queryKey: ['crafts'] });
  };

  const columns = [
    {
      title: '缩略图',
      dataIndex: 'images',
      width: 80,
      render: (images: Craft['images']) =>
        images?.[0] ? (
          <Image
            src={images[0].thumbnailUrl || images[0].url}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 8 }}
            preview={false}
          />
        ) : (
          '-'
        ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status: string) => {
        const s = STATUS_MAP[status] || { color: 'default', label: status };
        return <Tag color={s.color}>{s.label}</Tag>;
      },
    },
    { title: '点赞', dataIndex: 'like_count', width: 70 },
    { title: '评论', dataIndex: 'comment_count', width: 70 },
    { title: '意向', dataIndex: 'intent_count', width: 70 },
    {
      title: '操作',
      width: 150,
      render: (_: unknown, record: Craft) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          />
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/crafts/${record.id}/edit`)}
          />
          <Popconfirm
            title="确认删除？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 120 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '草稿', value: 'draft' },
              { label: '已发布', value: 'published' },
              { label: '已归档', value: 'archived' },
            ]}
          />
          {selectedRowKeys.length > 0 && (
            <>
              <Button onClick={() => handleBatch('publish')}>批量发布</Button>
              <Button onClick={() => handleBatch('unpublish')}>批量下架</Button>
              <Popconfirm
                title="确认批量删除？"
                onConfirm={() => handleBatch('delete')}
              >
                <Button danger>批量删除</Button>
              </Popconfirm>
            </>
          )}
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/crafts/new')}>
          新建作品
        </Button>
      </div>

      {/* Table */}
      <Table
        rowKey="id"
        dataSource={crafts}
        columns={columns}
        loading={isLoading}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
        pagination={{ pageSize: 20, showSizeChanger: false }}
      />

      {/* Floating Preview Panel */}
      <FloatingPreview
        title="小程序预览"
        visible={selectedCraft !== null}
        onClose={handleClosePanel}
        width={420}
      >
        <CraftPreview craft={selectedCraft} />
      </FloatingPreview>
    </div>
  );
}
