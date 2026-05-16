import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { COLORS } from '@/styles/theme';

/**
 * 404 页面不存在
 */
export default function NotFoundPage() {
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
        status="404"
        title="404 - 页面不存在"
        subTitle={
          <span style={{ color: COLORS.text }}>
            抱歉，您访问的页面不存在。
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