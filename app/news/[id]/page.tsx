'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Article {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  imageUrl?: string;
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
                const response = await fetch(`/api/articles/${params.id}`);
        if (!response.ok) {
          throw new Error('기사를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setArticle(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  const handleEdit = () => {
    router.push(`/news/${params.id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">기사를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const isValidDate = article.created_at && !isNaN(new Date(article.created_at).getTime());

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{article.title}</h1>
          {session && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              수정
            </Button>
          )}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              {isValidDate
                ? new Date(article.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '날짜 정보 없음'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 