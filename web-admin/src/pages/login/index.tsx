import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Checkbox, Button, message } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { login } from '@/services/auth';
import { COLORS } from '@/styles/theme';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(values);
      localStorage.setItem('admin_token', result.accessToken);
      message.success('登录成功');
      if (result.mustChangePassword) {
        message.warning('请修改初始密码');
      }
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || '登录失败';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff8f5',
      backgroundImage: 'radial-gradient(#E8D5C0 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: 40,
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        border: '1px solid #eae1db',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            backgroundColor: COLORS.primary,
            borderRadius: '50%',
            marginBottom: 16,
            boxShadow: '0 2px 8px rgba(196,149,106,0.3)',
          }}>
            <span style={{ fontSize: 32, color: '#fff' }}>&#xe906;</span>
          </div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 600,
            color: COLORS.heading,
            marginBottom: 4,
            letterSpacing: '-0.02em',
          }}>
            温暖匠心
          </h1>
          <p style={{ fontSize: 14, color: COLORS.textSecondary }}>
            后台管理系统
          </p>
        </div>

        {/* Form */}
        <Form onFinish={onFinish} size="large" requiredMark={false}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input
              prefix={<UserOutlined style={{ color: COLORS.textSecondary }} />}
              placeholder="管理员账号"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password
              prefix={<LockOutlined style={{ color: COLORS.textSecondary }} />}
              placeholder="密码"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          {/* Options row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            marginTop: -8,
          }}>
            <Checkbox style={{ fontSize: 14, color: COLORS.text }}>
              自动登录
            </Checkbox>
            <a style={{ fontSize: 14, color: COLORS.primary }} href="#">
              忘记密码？
            </a>
          </div>

          {/* Submit Button */}
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 44,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                boxShadow: '0 2px 12px rgba(196,149,106,0.3)',
              }}
              icon={!loading ? <ArrowRightOutlined /> : undefined}
              iconPosition="end"
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        {/* Footer */}
        <div style={{
          marginTop: 32,
          textAlign: 'center',
          fontSize: 12,
          color: COLORS.textSecondary,
        }}>
          &copy; 2024 温暖匠心 版权所有
        </div>
      </div>
    </div>
  );
}
