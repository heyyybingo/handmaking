import { Carousel, Divider, Tag, Button, Image } from 'antd';
import { EditOutlined, DeleteOutlined, LikeOutlined, MessageOutlined, HeartOutlined } from '@ant-design/icons';
import { COLORS } from '@/styles/theme';
import type { Craft } from '@/services/craft';

interface CraftPreviewProps {
  craft: Craft | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CraftPreview({ craft, onEdit, onDelete }: CraftPreviewProps) {
  if (!craft) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300,
          color: COLORS.textSecondary,
          fontSize: 14,
        }}
      >
        点击左侧作品查看预览
      </div>
    );
  }

  return (
    <div>
      {/* Image Carousel */}
      {craft.images && craft.images.length > 0 ? (
        <Carousel
          dots
          autoplay={false}
          style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}
        >
          {craft.images.map((img, i) => (
            <div key={i}>
              <Image
                src={img.url}
                width="100%"
                height={260}
                style={{ objectFit: 'cover' }}
                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNiZmJmYmYiIGZvbnQtc2l6ZT0iMTQiPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4="
                preview={{ mask: '点击预览' }}
              />
            </div>
          ))}
        </Carousel>
      ) : (
        <div
          style={{
            width: '100%',
            height: 200,
            background: COLORS.background,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.textSecondary,
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          暂无图片
        </div>
      )}

      {/* Title */}
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: COLORS.heading,
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {craft.title}
      </h2>

      <Divider style={{ margin: '12px 0' }} />

      {/* Description */}
      {craft.description && (
        <div
          className="craft-description"
          style={{
            fontSize: 14,
            color: COLORS.text,
            lineHeight: 1.8,
            marginBottom: 12,
          }}
          dangerouslySetInnerHTML={{ __html: craft.description }}
        />
      )}

      {/* Category */}
      {craft.category && (
        <Tag
          color={COLORS.primary}
          style={{ marginBottom: 8, border: 'none' }}
        >
          {craft.category.name}
        </Tag>
      )}

      {/* Tags */}
      {craft.tags && craft.tags.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {craft.tags.map((tag) => (
            <Tag key={tag} style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
        </div>
      )}

      <Divider style={{ margin: '12px 0' }} />

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          fontSize: 13,
          color: COLORS.textSecondary,
          marginBottom: 16,
        }}
      >
        <span>
          <LikeOutlined style={{ marginRight: 4 }} />
          {craft.like_count}
        </span>
        <span>
          <MessageOutlined style={{ marginRight: 4 }} />
          {craft.comment_count}
        </span>
        <span>
          <HeartOutlined style={{ marginRight: 4 }} />
          {craft.intent_count}
        </span>
      </div>

      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <div style={{ display: 'flex', gap: 8 }}>
          {onEdit && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={onEdit}
              style={{ flex: 1 }}
            >
              编辑作品
            </Button>
          )}
          {onDelete && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={onDelete}
              style={{ flex: 1 }}
            >
              删除作品
            </Button>
          )}
        </div>
      )}
    </div>
  );
}