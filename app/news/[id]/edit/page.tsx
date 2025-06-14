'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function EditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/articles/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        toast({
          title: '에러',
          description: '기사를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
        router.push('/news');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [params.id, toast, router]);

  const handleSave = useCallback(async (data: { title: string; content: string }) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/articles/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update article');
      }

      toast({ title: '성공', description: '기사가 수정되었습니다.' });
      router.push(`/news/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating article:', error);
      toast({ title: '에러', description: '기사 수정에 실패했습니다.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }, [params.id, router, toast]);

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">기사 정보를 불러오는 중입니다...</div>;
  }

  if (!article) {
    return <div className="container mx-auto py-8 text-center">기사를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>기사 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <Editor
            initialTitle={article.title}
            initialContent={article.content}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            saveButtonText="수정 완료"
          />
        </CardContent>
      </Card>
    </div>
  );
} 