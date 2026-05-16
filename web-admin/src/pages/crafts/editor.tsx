import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, message } from 'antd';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCraft, createCraft, updateCraft } from '@/services/craft';
import { getCategories } from '@/services/category';
import type { CreateCraftParams } from '@/services/craft';
import type { IDomEditor } from '@wangeditor/editor';
import type { UploadFile } from 'antd';
import HamburgerMenu from '@/components/HamburgerMenu';
import CraftEditor from '@/components/CraftEditor';
import {
  getPresignedUrl,
  confirmUpload,
} from '@/services/craft';

export default function CraftEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [form] = Form.useForm();
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const { data: craft, isLoading: craftLoading } = useQuery({
    queryKey: ['craft', id],
    queryFn: () => getCraft(id!),
    enabled: isEditing,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleSave = async (values: CreateCraftParams, status: 'draft' | 'published') => {
    const params = { ...values, status };

    try {
      if (isEditing && id) {
        await updateCraft(id, params);
        message.success(status === 'draft' ? '草稿已保存' : '作品已发布');
      } else {
        const created = await createCraft(params);
        message.success(status === 'draft' ? '草稿已创建' : '作品已发布');
        queryClient.invalidateQueries({ queryKey: ['crafts'] });
        navigate(`/crafts/${created.id}/edit`, { replace: true });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['crafts'] });
    } catch {
      // handled by request interceptor
    }
  };

  const handleSaveAsDraft = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      const images = fileList
        .filter((f) => f.status === 'done')
        .map((f, i) => ({
          url: f.url || (f.response as Record<string, unknown>)?.url as string || '',
          thumbnailUrl: f.thumbUrl || (f.response as Record<string, unknown>)?.thumbnailUrl as string || '',
          width: ((f.response as Record<string, unknown>)?.width as number) || 800,
          height: ((f.response as Record<string, unknown>)?.height as number) || 600,
          sort: i,
        }));

      const params: CreateCraftParams = {
        ...values,
        description: editor ? editor.getHtml() : '',
        images: images.length > 0 ? images : undefined,
      };

      await handleSave(params, 'draft');
    } catch {
      // validation error
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const values = await form.validateFields();
      const images = fileList
        .filter((f) => f.status === 'done')
        .map((f, i) => ({
          url: f.url || (f.response as Record<string, unknown>)?.url as string || '',
          thumbnailUrl: f.thumbUrl || (f.response as Record<string, unknown>)?.thumbnailUrl as string || '',
          width: ((f.response as Record<string, unknown>)?.width as number) || 800,
          height: ((f.response as Record<string, unknown>)?.height as number) || 600,
          sort: i,
        }));

      const params: CreateCraftParams = {
        ...values,
        description: editor ? editor.getHtml() : '',
        images: images.length > 0 ? images : undefined,
      };

      await handleSave(params, 'published');
    } catch {
      // validation error
    } finally {
      setPublishing(false);
    }
  };

  const customUpload = async ({ file, onSuccess, onError }: {
    file: File;
    onSuccess: (result: Record<string, unknown>) => void;
    onError: (error: Error) => void;
  }) => {
    try {
      const presign = await getPresignedUrl({ filename: file.name, fileType: 'image' });
      await fetch(presign.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      const confirm = await confirmUpload({ key: presign.key });
      onSuccess?.({ url: confirm.url, thumbnailUrl: confirm.url, width: 800, height: 600 });
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error('Upload failed'));
    }
  };

  if (isEditing && craftLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F5F5F5' }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column' }}>
      <HamburgerMenu />

      <div style={{ display: 'flex', flex: 1, paddingTop: 56 }}>
        {/* Left: Phone Preview */}
        <div style={{ width: 375, flexShrink: 0, padding: '16px 16px 80px 64px', overflow: 'auto' }}>
          <div style={{
            width: 375,
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            minHeight: 600,
          }}>
            <CraftEditor
              mode="preview"
              craft={craft || null}
              form={form}
              editor={editor}
              onEditorCreated={setEditor}
              fileList={fileList}
              onFileListChange={setFileList}
              categories={categories}
              customUpload={customUpload}
            />
          </div>
        </div>

        {/* Right: Form Area */}
        <div style={{ flex: 1, padding: '16px 24px 80px 16px', overflow: 'auto' }}>
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#2D2D2D', marginBottom: 24 }}>
              {isEditing ? '编辑手工作品' : '新建手工作品'}
            </h2>
            <CraftEditor
              mode="edit"
              craft={craft || null}
              form={form}
              editor={editor}
              onEditorCreated={setEditor}
              fileList={fileList}
              onFileListChange={setFileList}
              categories={categories}
              customUpload={customUpload}
            />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: '#fff',
        borderTop: '1px solid #E5E5E5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        padding: '0 24px',
        zIndex: 1000,
      }}>
        <button
          onClick={() => navigate('/crafts')}
          style={{
            padding: '6px 16px',
            borderRadius: 8,
            border: '1px solid #E5E5E5',
            background: '#fff',
            color: '#666',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          取消
        </button>
        <button
          onClick={handleSaveAsDraft}
          disabled={saving}
          style={{
            padding: '6px 16px',
            borderRadius: 8,
            border: '1px solid #E5E5E5',
            background: '#fff',
            color: '#666',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: 14,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? '保存中...' : '另存草稿'}
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          style={{
            padding: '6px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#C4956A',
            color: '#fff',
            cursor: publishing ? 'not-allowed' : 'pointer',
            fontSize: 14,
            opacity: publishing ? 0.6 : 1,
          }}
        >
          {publishing ? '发布中...' : '发布作品'}
        </button>
      </div>
    </div>
  );
}
