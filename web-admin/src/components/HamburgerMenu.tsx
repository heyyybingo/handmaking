import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  AppstoreOutlined,
  TagsOutlined,
  CommentOutlined,
  HeartOutlined,
  SettingOutlined,
  RobotOutlined,
} from '@ant-design/icons';

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
  { key: '/crafts', icon: <AppstoreOutlined />, label: '作品管理' },
  { key: '/categories', icon: <TagsOutlined />, label: '分类管理' },
  { key: '/comments', icon: <CommentOutlined />, label: '评论管理' },
  { key: '/intents', icon: <HeartOutlined />, label: '意向管理' },
  { key: '/ai-config', icon: <RobotOutlined />, label: 'AI配置' },
  { key: '/config', icon: <SettingOutlined />, label: '系统配置' },
];

export default function HamburgerMenu() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: 'fixed', top: 16, left: 16, zIndex: 1060 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          background: hovered ? '#F5F5F5' : 'transparent',
          cursor: 'pointer',
          transition: 'background 0.2s',
          fontSize: 20,
          color: '#2D2D2D',
        }}
      >
        ☰
      </div>

      {hovered && (
        <div
          style={{
            position: 'absolute',
            top: 44,
            left: 0,
            minWidth: 160,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
          }}
        >
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={() => navigate(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 14,
                color: '#2D2D2D',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F5F5F5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
