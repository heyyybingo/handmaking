import { useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TagsOutlined,
  CommentOutlined,
  HeartOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { getAdminInfo, changePassword } from '@/services/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Input, message } from 'antd';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
  { key: '/crafts', icon: <AppstoreOutlined />, label: '作品管理' },
  { key: '/categories', icon: <TagsOutlined />, label: '分类管理' },
  { key: '/comments', icon: <CommentOutlined />, label: '评论管理' },
  { key: '/intents', icon: <HeartOutlined />, label: '意向管理' },
  { key: '/config', icon: <SettingOutlined />, label: '系统配置' },
];

export default function AdminLayout() {
  const token = localStorage.getItem('admin_token');
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(false);
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [pwdForm] = Form.useForm();
  const { token: themeToken } = theme.useToken();

  const { data: adminInfo } = useQuery({
    queryKey: ['adminInfo'],
    queryFn: getAdminInfo,
    enabled: !!token,
  });

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const selectedKey = '/' + (location.pathname.split('/')[1] || 'dashboard');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    queryClient.clear();
    navigate('/login');
  };

  const handleChangePassword = async (values: { oldPassword: string; newPassword: string }) => {
    try {
      await changePassword(values);
      message.success('密码修改成功');
      setPwdModalOpen(false);
      pwdForm.resetFields();
    } catch {
      message.error('密码修改失败');
    }
  };

  const dropdownItems = [
    { key: 'password', icon: <UserOutlined />, label: '修改密码' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];

  const handleDropdownClick = ({ key }: { key: string }) => {
    if (key === 'logout') handleLogout();
    if (key === 'password') setPwdModalOpen(true);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: themeToken.colorBgContainer,
          borderRight: `1px solid ${themeToken.colorBorderSecondary}`,
        }}
      >
        <div style={{
          height: 48,
          margin: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          paddingBottom: 12,
        }}>
          <span style={{
            fontSize: collapsed ? 16 : 18,
            fontWeight: 600,
            color: themeToken.colorPrimary,
            whiteSpace: 'nowrap',
          }}>
            {collapsed ? '手作' : '手作管理后台'}
          </span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          background: themeToken.colorBgContainer,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
        }}>
          <Dropdown menu={{ items: dropdownItems, onClick: handleDropdownClick }} trigger={['click']}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" icon={<UserOutlined />} src={adminInfo?.avatar_url} />
              <span>{adminInfo?.nickname || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: themeToken.colorBgContainer, borderRadius: themeToken.borderRadiusLG }}>
          <Outlet />
        </Content>
      </Layout>

      <Modal
        title="修改密码"
        open={pwdModalOpen}
        onCancel={() => setPwdModalOpen(false)}
        onOk={() => pwdForm.submit()}
      >
        <Form form={pwdForm} onFinish={handleChangePassword} layout="vertical">
          <Form.Item name="oldPassword" label="旧密码" rules={[{ required: true, message: '请输入旧密码' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 8, message: '密码至少8位' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: '需包含大小写字母和数字' },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
