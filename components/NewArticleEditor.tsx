'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Editor } from './Editor';

interface NewArticleEditorProps {
  onSaveSuccess: () => void;
}

export const NewArticleEditor = ({ onSaveSuccess }: NewArticleEditorProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: { title: string; content: string }) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save article');
      }

      toast({ title: '성공', description: '기사가 성공적으로 저장되었습니다.' });
      router.refresh();
      onSaveSuccess();
    } catch (error) {
      console.error('Save error:', error);
      const message = error instanceof Error ? error.message : '기사 저장 중 오류가 발생했습니다.';
      toast({
        title: '저장 실패',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Editor
      onSave={handleSave}
      isSaving={isSaving}
      onCancel={onSaveSuccess} // Close dialog on cancel
      saveButtonText="기사 저장"
    />
  );
};
