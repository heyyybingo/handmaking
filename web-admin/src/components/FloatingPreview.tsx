import { useEffect, useRef, useState, useCallback } from 'react';

interface FloatingPreviewProps {
  title: string;
  visible: boolean;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

export default function FloatingPreview({
  title,
  visible,
  onClose,
  width = 400,
  children,
}: FloatingPreviewProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible && !initialized) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const x = vw - width - 40;
      const y = Math.max(20, (vh - 500) / 2);
      setPosition({ x, y });
      setInitialized(true);
    }
    if (!visible) {
      setInitialized(false);
    }
  }, [visible, width, initialized]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    document.body.style.userSelect = 'none';
  }, [position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1050,
        width,
        maxHeight: 'calc(100vh - 40px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #E5E5E5',
          cursor: 'move',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: '#2D2D2D' }}>
          {title}
        </span>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: '#999999',
            padding: 0,
            lineHeight: 1,
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F5F5F5';
            e.currentTarget.style.color = '#2D2D2D';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#999999';
          }}
        >
          &#10005;
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
}
