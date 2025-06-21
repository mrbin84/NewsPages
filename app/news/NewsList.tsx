'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';

interface Article {
  id: string;
  title: string;
  summary: string;
  thumbnail: string | null;
  created_at: string;
}

interface NewsListProps {
  articles: Article[];
  session: Session | null;
}

export default function NewsList({ articles: initialArticles, session }: NewsListProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = `Error: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Failed to delete article';
        } catch (e) {
          // Ignore if response is not JSON
        }
        throw new Error(errorMessage);
      }

      toast({ title: '성공', description: '기사를 삭제했습니다.' });
      setArticles(articles.filter(article => article.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Error deleting article:', error);
      const errorMessage = error instanceof Error ? error.message : '기사 삭제에 실패했습니다.';
      toast({ title: '오류', description: errorMessage, variant: 'destructive' });
    }
  };

  return (
    <>
      {session && (
        <div className="mb-4 flex justify-end">
          <Button variant="outline" onClick={() => setIsDeleteMode(!isDeleteMode)}>
            {isDeleteMode ? '삭제 취소' : '기사 삭제'}
          </Button>
        </div>
      )}
      <div className="grid gap-6">
        {articles.length === 0 ? (
          <div className="text-center text-gray-500 col-span-full">등록된 기사가 없습니다.</div>
        ) : (
          articles.map((article) => {
            const isValidDate = article.created_at && !isNaN(new Date(article.created_at).getTime());

            return (
              <div key={article.id} className="flex items-center gap-4">
                <Link href={`/news/${article.id}`} className="flex-grow">
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          {article.thumbnail ? (
                            <img
                              src={article.thumbnail}
                              alt={article.title}
                              className="w-32 h-32 object-cover rounded"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-muted flex items-center justify-center rounded">
                              <span className="text-sm text-muted-foreground">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <h2 className="text-lg font-semibold mb-2">{article.title}</h2>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {article.summary}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isValidDate
                              ? format(new Date(article.created_at), 'PPP', { locale: ko })
                              : '날짜 정보 없음'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                {isDeleteMode && session && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(article.id);
                    }}
                  >
                    삭제
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
