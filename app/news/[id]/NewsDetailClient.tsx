'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Article } from '@/lib/data';
import { Session } from 'next-auth';

interface NewsDetailClientProps {
  article: Article;
  session: Session | null;
  isValidDate: boolean;
  articleId: string;
}

export default function NewsDetailClient({ 
  article, 
  session, 
  isValidDate, 
  articleId 
}: NewsDetailClientProps) {
  const router = useRouter();

  useEffect(() => {
    // 조회수 증가 API 호출 (백그라운드에서 실행)
    const incrementViewCount = async () => {
      try {
        await fetch(`/api/articles/${articleId}/view`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Failed to update view count:', error);
        // 조회수 업데이트 실패는 사용자에게 보여주지 않음
      }
    };

    incrementViewCount();
  }, [articleId]);

  const handleEdit = () => {
    router.push(`/news/${articleId}/edit`);
  };

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
              className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: article.content }} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}