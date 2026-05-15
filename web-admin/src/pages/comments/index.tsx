import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Popconfirm, message, Select } from 'antd';
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getComments, replyComment, deleteComment } from '@/services/comment';
import type { Comment, CommentListParams } from '@/services/comment';

export default function CommentsPage() {
  const queryClient = useQueryClient();
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyForm] = Form.useForm();
  const [craftFilter, setCraftFilter] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', craftFilter],
    queryFn: () => getComments({ craft_id: craftFilter, limit: 100 }),
  });

  const comments = commentsData?.items ?? [];

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    replyForm.resetFields();
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async () => {
    try {
      const values = await replyForm.validateFields();
      setSubmitting(true);
      await replyComment(replyingTo!.id, values);
      message.success('回复成功');
      setReplyModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    } catch {
      // validation
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteComment(id);
    message.success('删除成功');
    queryClient.invalidateQueries({ queryKey: ['comments'] });
  };

  const columns = [
    {
      title: '评论内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'author_name',
      width: 120,
      render: (name: string, record: Comment) => (
        <Space>
          <span>{name}</span>
          {record.is_author_reply && <Tag color="orange">作者</Tag>}
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'author_type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'admin' ? 'orange' : 'blue'}>{type === 'admin' ? '管理员' : '访客'}</Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 160,
      render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-',
    },
    {
      title: '操作',
      width: 140,
      render: (_: unknown, record: Comment) => (
        <Space>
          <Button type="link" size="small" icon={<MessageOutlined />} onClick={() => handleReply(record)}>回复</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Select
          placeholder="按作品筛选"
          allowClear
          style={{ width: 200 }}
          value={craftFilter}
          onChange={setCraftFilter}
          options={[...new Map(comments.filter((c) => c.craft_id).map((c) => [c.craft_id, { label: c.craft_title || c.craft_id, value: c.craft_id }])).values()]}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={comments}
        columns={columns}
        loading={isLoading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={`回复 ${replyingTo?.author_name || ''} 的评论`}
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        onOk={handleReplySubmit}
        confirmLoading={submitting}
        destroyOnClose
      >
        <div style={{ marginBottom: 12, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <span style={{ color: '#999' }}>原评论：</span>{replyingTo?.content}
        </div>
        <Form form={replyForm} layout="vertical">
          <Form.Item name="content" rules={[{ required: true, message: '请输入回复内容' }, { max: 500 }]}>
            <Input.TextArea rows={3} placeholder="输入回复内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
