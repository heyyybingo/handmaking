import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import {
  AppstoreOutlined,
  HeartOutlined,
  CommentOutlined,
  LikeOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/dashboard';
import type { DashboardStats } from '@/services/dashboard';

const { Title } = Typography;

const statCards = [
  { key: 'totalCrafts' as const, title: '作品总数', icon: <AppstoreOutlined />, color: '#C4956A' },
  { key: 'totalLikes' as const, title: '点赞总数', icon: <LikeOutlined />, color: '#FF6B6B' },
  { key: 'totalComments' as const, title: '评论总数', icon: <CommentOutlined />, color: '#7BA98F' },
  { key: 'totalIntents' as const, title: '意向总数', icon: <HeartOutlined />, color: '#8B6F4E' },
  { key: 'todayVisitors' as const, title: '今日访客', icon: <EyeOutlined />, color: '#1890FF' },
];

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>数据概览</Title>
      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} md={8} lg={4} key={card.key}>
            <Card hoverable style={{ borderRadius: 12 }}>
              <Statistic
                title={card.title}
                value={stats?.[card.key] ?? 0}
                prefix={<span style={{ color: card.color, marginRight: 4 }}>{card.icon}</span>}
                valueStyle={{ color: card.color, fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Title level={5} style={{ margin: '32px 0 16px' }}>近7天趋势</Title>
      <Row gutter={[16, 16]}>
        {(['crafts', 'likes', 'comments', 'intents'] as const).map((metric) => (
          <Col xs={24} md={12} key={metric}>
            <Card title={metric === 'crafts' ? '新增作品' : metric === 'likes' ? '新增点赞' : metric === 'comments' ? '新增评论' : '新增意向'} size="small">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
                {stats?.trends?.[metric]?.map((item, i) => {
                  const maxVal = Math.max(...(stats?.trends?.[metric]?.map((d) => d.value) || [1]), 1);
                  const height = Math.max((item.value / maxVal) * 80, 4);
                  return (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        height,
                        background: '#C4956A',
                        borderRadius: 4,
                        transition: 'height 0.3s',
                      }} />
                      <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                        {item.date?.slice(5)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
