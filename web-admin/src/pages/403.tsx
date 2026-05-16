import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { COLORS } from '@/styles/theme';

/**
 * 403 无权限访问页面
 */
export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
      }}
    >
      <Result
        status="403"
        title="403 - 无权限访问"
        subTitle={
          <span style={{ color: COLORS.text }}>
            抱歉，您没有权限访问此页面。
          </span>
        }
        extra={
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
            style={{
              backgroundColor: COLORS.primary,
              borderColor: COLORS.primary,
            }}
          >
            返回首页
          </Button>
        }
      />
    </div>
  );
}