import { useEffect, useState } from 'react';
import { Form, Input, Select, Upload, Button, Tag, Switch } from 'antd';
import { UploadOutlined, TagsOutlined, PictureOutlined, LoadingOutlined, HolderOutlined } from '@ant-design/icons';
import '@wangeditor/editor/dist/css/style.css';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { type IDomEditor, type IEditorConfig, type IToolbarConfig } from '@wangeditor/editor';
import type { Craft, CreateCraftParams } from '@/services/craft';
import type { Category } from '@/services/category';
import type { UploadFile, FormInstance } from 'antd';
import CraftPreview from '@/components/CraftPreview';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CraftEditorProps {
  mode: 'preview' | 'edit';
  craft: Craft | null;
  form: FormInstance;
  editor: IDomEditor | null;
  onEditorCreated: (editor: IDomEditor) => void;
  fileList: UploadFile[];
  onFileListChange: (fileList: UploadFile[]) => void;
  categories: Category[];
  customUpload: (options: {
    file: File;
    onSuccess: (result: Record<string, unknown>) => void;
    onError: (error: Error) => void;
  }) => void;
}

export default function CraftEditor({
  mode,
  craft,
  form,
  editor,
  onEditorCreated,
  fileList,
  onFileListChange,
  categories,
  customUpload,
}: CraftEditorProps) {
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const toolbarConfig: Partial<IToolbarConfig> = {
    excludeKeys: [],
  };

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入作品描述...',
    MENU_CONF: {
      uploadImage: {
        async customUpload(file: File, insertFn: (url: string) => void) {
          const reader = new FileReader();
          reader.onload = () => {
            insertFn(reader.result as string);
          };
          reader.readAsDataURL(file);
        },
      },
    },
  };

  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  useEffect(() => {
    if (craft) {
      form.setFieldsValue({
        title: craft.title,
        category_id: craft.category_id,
        tags: craft.tags,
        visibility: craft.status !== 'archived',
      });
      onFileListChange(
        (craft.images || []).map((img, i) => ({
          uid: String(i),
          name: `image-${i}`,
          status: 'done' as const,
          url: img.url,
          thumbUrl: img.thumbnailUrl,
        })),
      );
    } else {
      form.resetFields();
      onFileListChange([]);
    }
  }, [craft, form, onFileListChange]);

  const handleAiSuggestTags = async () => {
    setAiLoading((prev) => ({ ...prev, tags: true }));
    try {
      const imageUrl = fileList[0]?.url || (fileList[0]?.response as Record<string, unknown>)?.url as string || '';
      const description = editor?.getHtml() || '';

      const response = await fetch('/api/admin/ai/suggest-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ imageUrl, description }),
      });

      if (!response.ok) throw new Error('推荐失败');

      const data = await response.json();
      setSuggestedTags(data.tags || []);
    } catch {
      // handled
    } finally {
      setAiLoading((prev) => ({ ...prev, tags: false }));
    }
  };

  const handleAddSuggestedTag = (tag: string) => {
    const currentTags = form.getFieldValue('tags') || [];
    if (!currentTags.includes(tag)) {
      form.setFieldsValue({ tags: [...currentTags, tag] });
    }
  };

  // ---- Drag Sort ----
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fileList.findIndex((f) => f.uid === String(active.id));
    const newIndex = fileList.findIndex((f) => f.uid === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const newFileList = [...fileList];
    const [moved] = newFileList.splice(oldIndex, 1);
    newFileList.splice(newIndex, 0, moved);
    onFileListChange(newFileList);
  };

  function SortableImageItem({ file, onRemove }: { file: UploadFile; onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.uid });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div style={{
          position: 'relative',
          width: 100,
          height: 100,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid #E5E5E5',
        }}>
          <img
            src={file.thumbUrl || file.url}
            alt={file.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            {...listeners}
            style={{
              position: 'absolute',
              top: 2,
              left: 2,
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 4,
              cursor: 'grab',
              color: '#fff',
              fontSize: 12,
            }}
          >
            <HolderOutlined />
          </div>
          <button
            onClick={onRemove}
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              fontSize: 12,
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // ---- Preview Mode ----
  if (mode === 'preview') {
    const previewCraft: Craft | null = craft ? {
      ...craft,
      title: form.getFieldValue('title') || craft.title,
      description: editor?.getHtml() || craft.description,
      images: fileList
        .filter((f) => f.status === 'done')
        .map((f, i) => ({
          url: f.url || (f.response as Record<string, unknown>)?.url as string || '',
          thumbnailUrl: f.thumbUrl || '',
          width: 800,
          height: 600,
          sort: i,
        })),
    } : {
      id: '',
      title: form.getFieldValue('title') || '作品标题',
      description: editor?.getHtml() || '',
      images: fileList
        .filter((f) => f.status === 'done')
        .map((f, i) => ({
          url: f.url || (f.response as Record<string, unknown>)?.url as string || '',
          thumbnailUrl: f.thumbUrl || '',
          width: 800,
          height: 600,
          sort: i,
        })),
      video: null,
      category_id: '',
      category: categories.find((c) => c.id === form.getFieldValue('category_id')) || { id: '', name: '未分类' },
      tags: form.getFieldValue('tags') || [],
      status: 'draft' as const,
      like_count: 0,
      comment_count: 0,
      intent_count: 0,
      sort_order: 0,
      created_at: '',
      updated_at: '',
    };

    return (
      <div style={{ padding: 0 }}>
        <CraftPreview craft={previewCraft} />
      </div>
    );
  }

  // ---- Edit Mode ----
  return (
    <Form form={form} layout="vertical" size="small">
      <Form.Item label="作品图片">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fileList.map((f) => f.uid)} strategy={rectSortingStrategy}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {fileList.map((file) => (
                <SortableImageItem
                  key={file.uid}
                  file={file}
                  onRemove={() => onFileListChange(fileList.filter((f) => f.uid !== file.uid))}
                />
              ))}
              <Upload
                listType="picture-card"
                fileList={[]}
                customRequest={({ file, onSuccess, onError }) =>
                  customUpload({
                    file: file as File,
                    onSuccess: onSuccess as (result: Record<string, unknown>) => void,
                    onError: onError as (error: Error) => void,
                  })
                }
                onChange={({ fileList: newFileList }) => onFileListChange([...fileList, ...newFileList])}
                multiple
                accept="image/*"
                showUploadList={false}
              >
                <div style={{ width: 100, height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #E5E5E5', borderRadius: 8, cursor: 'pointer' }}>
                  <UploadOutlined style={{ fontSize: 20, color: '#999' }} />
                  <span style={{ fontSize: 12, color: '#999', marginTop: 4 }}>上传</span>
                </div>
              </Upload>
            </div>
          </SortableContext>
        </DndContext>
      </Form.Item>

      <Form.Item
        name="title"
        label="作品名称"
        rules={[{ required: true, message: '请输入作品名称' }, { max: 50 }]}
      >
        <Input placeholder="作品标题" maxLength={50} />
      </Form.Item>

      <Form.Item label="详细介绍">
        <div
          style={{
            border: '1px solid #E5E5E5',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <Toolbar
            editor={editor}
            defaultConfig={toolbarConfig}
            mode="default"
            style={{ borderBottom: '1px solid #E5E5E5' }}
          />
          <Editor
            defaultConfig={editorConfig}
            value={craft?.description || ''}
            onCreated={onEditorCreated}
            mode="default"
            style={{ height: 300, overflowY: 'hidden' }}
          />
        </div>
      </Form.Item>

      <div style={{ display: 'flex', gap: 16 }}>
        <Form.Item
          name="category_id"
          label="分类"
          rules={[{ required: true, message: '请选择分类' }]}
          style={{ flex: 1 }}
        >
          <Select
            placeholder="选择分类"
            options={categories.map((c) => ({ label: c.name, value: c.id }))}
          />
        </Form.Item>

        <Form.Item name="tags" label="标签" style={{ flex: 1 }}>
          <Select mode="tags" placeholder="输入标签后回车" />
        </Form.Item>
      </div>

      <Form.Item>
        <Space>
          <Button
            icon={aiLoading.tags ? <LoadingOutlined /> : <TagsOutlined />}
            onClick={handleAiSuggestTags}
            loading={aiLoading.tags}
            size="small"
          >
            AI推荐标签
          </Button>
          <Button
            icon={aiLoading.image ? <LoadingOutlined /> : <PictureOutlined />}
            loading={aiLoading.image}
            size="small"
          >
            AI图片建议
          </Button>
        </Space>
        {suggestedTags.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#999', marginRight: 8 }}>推荐标签：</span>
            {suggestedTags.map((tag) => (
              <Tag
                key={tag}
                style={{ cursor: 'pointer' }}
                onClick={() => handleAddSuggestedTag(tag)}
              >
                + {tag}
              </Tag>
            ))}
          </div>
        )}
      </Form.Item>

      <Form.Item name="visibility" label="公开可见" valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
      <div style={{ fontSize: 12, color: '#999', marginTop: -16, marginBottom: 16 }}>
        关闭后作品仅自己可见，适合作为草稿暂存
      </div>
    </Form>
  );
}
