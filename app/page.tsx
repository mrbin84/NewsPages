import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getArticlePreviews, ArticlePreview } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';

export default async function Home() {
  let articles: ArticlePreview[] = [];
  let error: string | null = null;

  try {
    articles = await getArticlePreviews();
  } catch (e) {
    console.error('Error fetching articles directly from Supabase:', e);
    error = 'Failed to load articles. Please try again later.';
  }
  
  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">
            <p><strong>Error:</strong> {error}</p>
          </div>
        </div>
      </main>
    );
  }

  // 최근 13개 기사 표시
  const recentArticles = articles.slice(0, 13);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 메인 이미지 섹션 */}
        <section className="mb-12">
          <div className="grid grid-cols-1 gap-6">
            {/* 첫 번째 기사 (큰 카드) */}
            {recentArticles[0] && (
              <Card className="overflow-hidden group">
                <Link href={`/news/${recentArticles[0].id}`}>
                  <div className="relative aspect-[2/1] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
                    {recentArticles[0].thumbnail ? (
                      <img
                        src={recentArticles[0].thumbnail}
                        alt={recentArticles[0].title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-900" />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {recentArticles[0].title}
                      </h3>
                    </div>
                  </div>
                </Link>
              </Card>
            )}
            
            {/* 2-3번째 기사 (1/2 너비 카드) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentArticles.slice(1, 3).map((article) => (
                <Card key={article.id} className="overflow-hidden group">
                  <Link href={`/news/${article.id}`}>
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 z-10" />
                      {article.thumbnail ? (
                        <img
                          src={article.thumbnail}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-900" />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 최근 기사 섹션 */}
        <section>
          <h2 className="text-2xl font-bold mb-6">최근 기사</h2>
          <div className="grid gap-4">
            {recentArticles.slice(3).map((article) => {
              const isValidDate = article.created_at && !isNaN(new Date(article.created_at).getTime());

              return (
                <Card key={article.id} className="overflow-hidden hover:bg-accent transition-colors">
                  <Link href={`/news/${article.id}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center min-w-0">
                        <h3 className="font-medium truncate mr-4">{article.title}</h3>
                        <time className="text-xs text-muted-foreground flex-shrink-0">
                          {isValidDate
                            ? format(new Date(article.created_at), 'PPP', { locale: ko })
                            : '날짜 정보 없음'}
                        </time>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
