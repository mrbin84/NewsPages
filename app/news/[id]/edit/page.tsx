'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';

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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/news/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        const data = await response.json();
        setArticle(data);
        setTitle(data.title);
        setContent(data.content);
      } catch (error) {
        console.error('Error fetching article:', error);
        toast({
          title: '에러',
          description: '기사를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    };

    fetchArticle();
  }, [params.id, toast]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: '제목을 입력해주세요',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/news/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update article');
      }

      toast({
        title: '성공',
        description: '기사가 수정되었습니다.',
      });

      router.push(`/news/${params.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: '에러',
        description: '기사 수정에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!article) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold"
            />
            <Editor
              content={content}
              onChange={setContent}
            />
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 