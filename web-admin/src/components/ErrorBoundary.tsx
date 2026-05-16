import { Component, type ReactNode } from 'react';
import { Button, Result } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { COLORS } from '@/styles/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 全局错误边界组件
 * 捕获子组件树中的 JavaScript 错误，展示友好的错误页面
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] 捕获到未处理的错误:', error);
    console.error('[ErrorBoundary] 组件堆栈:', errorInfo.componentStack);
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  handleRefresh = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
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
            status="error"
            title="页面出现错误"
            subTitle={
              <span style={{ color: COLORS.text }}>
                抱歉，页面发生了意外错误。请尝试刷新页面或返回首页。
              </span>
            }
            extra={[
              <Button
                key="home"
                type="primary"
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
                style={{
                  backgroundColor: COLORS.primary,
                  borderColor: COLORS.primary,
                }}
              >
                返回首页
              </Button>,
              <Button
                key="refresh"
                icon={<ReloadOutlined />}
                onClick={this.handleRefresh}
              >
                刷新页面
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}