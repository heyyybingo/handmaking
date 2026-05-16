import { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Select,
  Avatar,
  Typography,
} from 'antd';
import { DeleteOutlined, MessageOutlined, UserOutlined, LinkOutlined } from '@ant-design/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getComments, replyComment, deleteComment } from '@/services/comment';
import type { Comment } from '@/services/comment';
import { COLORS } from '@/styles/theme';

const { Paragraph } = Typography;

export default function CommentsPage() {
  const queryClient = useQueryClient();
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [replyForm] = Form.useForm();
  const [craftFilter, setCraftFilter] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', craftFilter],
    queryFn: () => getComments({ craft_id: craftFilter, limit: 100 }),
  });

  const allComments = commentsData?.items ?? [];

  // Local client-side filtering by search text (content, author name, or craft title)
  const comments = useMemo(() => {
    if (!searchText.trim()) return allComments;
    const lower = searchText.toLowerCase();
    return allComments.filter(
      (c) =>
        c.content.toLowerCase().includes(lower) ||
        c.author_name.toLowerCase().includes(lower) ||
        (c.craft_title && c.craft_title.toLowerCase().includes(lower)),
    );
  }, [allComments, searchText]);

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
      // validation errors are handled by the form
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
      title: '头像',
      dataIndex: 'author_avatar',
      width: 64,
      render: (avatar: string) => (
        <Avatar src={avatar || undefined} icon={<UserOutlined />} size={32} />
      ),
    },
    {
      title: '作者',
      dataIndex: 'author_name',
      width: 160,
      render: (name: string, record: Comment) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            <span style={{ fontWeight: 500, color: COLORS.heading }}>{name}</span>
            {record.is_author_reply && (
              <Tag
                color="orange"
                style={{ fontSize: 11, lineHeight: '18px', padding: '0 4px', margin: 0 }}
              >
                作者
              </Tag>
            )}
          </Space>
          <Tag
            color={record.author_type === 'admin' ? COLORS.primary : COLORS.celadonGreen}
            style={{ fontSize: 11, margin: 0 }}
          >
            {record.author_type === 'admin' ? '管理员' : '访客'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      render: (content: string) => (
        <Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
          style={{ marginBottom: 0, color: COLORS.text, maxWidth: 360 }}
        >
          {content}
        </Paragraph>
      ),
    },
    {
      title: '所属作品',
      dataIndex: 'craft_title',
      width: 180,
      render: (title: string | undefined, record: Comment) => (
        <Space size={4}>
          <LinkOutlined style={{ color: COLORS.primary, fontSize: 12 }} />
          <span style={{ color: COLORS.primary }}>{title || record.craft_id}</span>
        </Space>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      width: 170,
      render: (v: string) => (v ? new Date(v).toLocaleString('zh-CN') : '-'),
    },
    {
      title: '操作',
      width: 140,
      render: (_: unknown, record: Comment) => (
        <Space>
          <Button type="link" size="small" icon={<MessageOutlined />} onClick={() => handleReply(record)}>
            回复
          </Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <Input.Search
          placeholder="搜索评论内容、作者或作品"
          allowClear
          style={{ width: 320 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) => setSearchText(value)}
        />
        <Select
          placeholder="按作品筛选"
          allowClear
          style={{ width: 200 }}
          value={craftFilter}
          onChange={setCraftFilter}
          options={[
            ...new Map(
              allComments
                .filter((c) => c.craft_id)
                .map((c) => [c.craft_id, { label: c.craft_title || c.craft_id, value: c.craft_id }]),
            ).values(),
          ]}
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
        title={
          <Space>
            <Avatar src={replyingTo?.author_avatar || undefined} icon={<UserOutlined />} size={28} />
            <span>回复 {replyingTo?.author_name || ''} 的评论</span>
          </Space>
        }
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        onOk={handleReplySubmit}
        confirmLoading={submitting}
        destroyOnClose
      >
        <div style={{ marginBottom: 12, padding: 12, background: COLORS.background, borderRadius: 8 }}>
          <span style={{ color: COLORS.textSecondary }}>原评论：</span>
          {replyingTo?.content}
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