import { useState } from 'react';
import {
  Table, Button, Tag, Space, Modal, Form, Input, Select, Upload, message, Popconfirm, Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCrafts, createCraft, updateCraft, deleteCraft, batchAction, getPresignedUrl, confirmUpload } from '@/services/craft';
import { getCategories } from '@/services/category';
import type { Craft, CreateCraftParams } from '@/services/craft';
import type { Category } from '@/services/category';
import type { UploadFile } from 'antd';

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: '草稿' },
  published: { color: 'green', label: '已发布' },
  archived: { color: 'orange', label: '已归档' },
};

export default function CraftsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCraft, setEditingCraft] = useState<Craft | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
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

  const handleEdit = (craft: Craft) => {
    setEditingCraft(craft);
    form.setFieldsValue({
      title: craft.title,
      description: craft.description,
      category_id: craft.category_id,
      tags: craft.tags,
      status: craft.status,
      sort_order: craft.sort_order,
    });
    setFileList(
      (craft.images || []).map((img, i) => ({
        uid: String(i),
        name: `image-${i}`,
        status: 'done' as const,
        url: img.url,
        thumbUrl: img.thumbnailUrl,
      })),
    );
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCraft(null);
    form.resetFields();
    setFileList([]);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const images = fileList
        .filter((f) => f.status === 'done')
        .map((f, i) => ({
          url: f.url || f.response?.url || '',
          thumbnailUrl: f.thumbUrl || f.response?.thumbnailUrl || '',
          width: f.response?.width || 800,
          height: f.response?.height || 600,
          sort: i,
        }));

      const params: CreateCraftParams = {
        ...values,
        images: images.length > 0 ? images : undefined,
      };

      if (editingCraft) {
        await updateCraft(editingCraft.id, params);
        message.success('更新成功');
      } else {
        await createCraft(params);
        message.success('创建成功');
      }

      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['crafts'] });
    } catch {
      // validation error
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCraft(id);
    message.success('删除成功');
    queryClient.invalidateQueries({ queryKey: ['crafts'] });
  };

  const handleBatch = async (action: string) => {
    if (selectedRowKeys.length === 0) return;
    await batchAction({ ids: selectedRowKeys, action: action as any });
    message.success('批量操作成功');
    setSelectedRowKeys([]);
    queryClient.invalidateQueries({ queryKey: ['crafts'] });
  };

  const customUpload = async ({ file, onSuccess, onError }: any) => {
    try {
      const filename = (file as File).name;
      const presign = await getPresignedUrl({ filename, fileType: 'image' });
      await fetch(presign.url, { method: 'PUT', body: file, headers: { 'Content-Type': (file as File).type } });
      const confirm = await confirmUpload({ key: presign.key });
      onSuccess?.({ url: confirm.url, thumbnailUrl: confirm.url, width: 800, height: 600 });
    } catch (err) {
      onError?.(err);
    }
  };

  const columns = [
    {
      title: '缩略图',
      dataIndex: 'images',
      width: 80,
      render: (images: Craft['images']) =>
        images?.[0] ? <Image src={images[0].thumbnailUrl || images[0].url} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} /> : '-',
    },
    { title: '标题', dataIndex: 'title', ellipsis: true },
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
      width: 120,
      render: (_: unknown, record: Craft) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
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
              <Popconfirm title="确认批量删除？" onConfirm={() => handleBatch('delete')}>
                <Button danger>批量删除</Button>
              </Popconfirm>
            </>
          )}
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建作品</Button>
      </div>

      <Table
        rowKey="id"
        dataSource={crafts}
        columns={columns}
        loading={isLoading}
        rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as string[]) }}
        pagination={{ pageSize: 20, showSizeChanger: false }}
      />

      <Modal
        title={editingCraft ? '编辑作品' : '新建作品'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        confirmLoading={submitting}
        width={700}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }, { max: 50 }]}>
            <Input placeholder="作品标题" />
          </Form.Item>
          <Form.Item name="description" label="描述" rules={[{ max: 2000 }]}>
            <Input.TextArea rows={4} placeholder="作品描述" />
          </Form.Item>
          <Form.Item name="category_id" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类" options={categories.map((c) => ({ label: c.name, value: c.id }))} />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入标签后回车" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select options={[
              { label: '草稿', value: 'draft' },
              { label: '已发布', value: 'published' },
              { label: '已归档', value: 'archived' },
            ]} />
          </Form.Item>
          <Form.Item label="图片">
            <Upload
              listType="picture-card"
              fileList={fileList}
              customRequest={customUpload}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              multiple
              accept="image/*"
            >
              <div><UploadOutlined /> 上传</div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
