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
import { ArticlePreview } from '@/lib/data';
import Image from 'next/image';

interface NewsListProps {
  articles: ArticlePreview[];
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
        <div className="mb-2 flex justify-end">
          <Button variant="outline" onClick={() => setIsDeleteMode(!isDeleteMode)}>
            {isDeleteMode ? '삭제 취소' : '기사 삭제'}
          </Button>
        </div>
      )}
      <div className="grid gap-1">
        {articles.length === 0 ? (
          <div className="text-center text-gray-500 col-span-full">등록된 기사가 없습니다.</div>
        ) : (
          articles.map((article) => {
            const isValidDate = article.created_at && !isNaN(new Date(article.created_at).getTime());

            return (
              <div key={article.id} className="flex items-center gap-2">
                <Link href={`/news/${article.id}`} className="flex-grow">
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-3">
                      <div className="flex gap-3 items-center">
                        <div className="flex-shrink-0 relative w-12 h-12 bg-muted rounded overflow-hidden">
                          {article.thumbnail ? (
                            <Image
                              src={article.thumbnail}
                              alt={article.title}
                              fill
                              className="object-cover"
                              sizes="48px"
                              priority={false}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow flex justify-between items-center min-w-0">
                          <h3 className="font-medium truncate mr-4">{article.title}</h3>
                          <time className="text-xs text-muted-foreground flex-shrink-0">
                            {isValidDate
                              ? format(new Date(article.created_at), 'PPP', { locale: ko })
                              : '날짜 정보 없음'}
                          </time>
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
