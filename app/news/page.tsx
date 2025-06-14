'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

function extractFirstImage(content: string): string | null {
  const imgMatch = content.match(/<img[^>]+src="([^" >]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

export default function NewsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('기사를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete the article.');
      }

      toast({ title: '성공', description: '기사를 삭제했습니다.' });
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      const errorMessage = error instanceof Error ? error.message : '기사 삭제에 실패했습니다.';
      toast({ title: '오류', description: errorMessage, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">로딩 중...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
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
            const thumbnail = extractFirstImage(article.content);
            return (
              <div key={article.id} className="flex items-center gap-4">
                <Link href={`/news/${article.id}`} className="flex-grow">
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
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
                            {article.content.replace(/<[^>]*>/g, '')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(article.createdAt), 'PPP', { locale: ko })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                {isDeleteMode && (
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
    </div>
  );
} 