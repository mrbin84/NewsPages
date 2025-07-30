'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getArticlePreviews, getMostViewedArticles } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [mostViewedArticles, setMostViewedArticles] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesResponse, mostViewedResponse] = await Promise.all([
          fetch('/api/articles').then(res => res.json()),
          fetch('/api/articles?mostViewed=true&limit=5').then(res => res.json())
        ]);
        
        setArticles(articlesResponse.slice(0, 15));
        setMostViewedArticles(mostViewedResponse);
      } catch (e) {
        console.error('Error fetching articles:', e);
        setError(e instanceof Error ? e.message : 'Failed to load articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="bg-coinreaders-gray min-h-screen">
        <div className="max-w-md mx-auto">
          <div className="px-2 py-4">
            <div className="text-center">로딩 중...</div>
          </div>
        </div>
      </main>
    );
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

  const mainArticle = articles[0];

  return (
    <main className="bg-coinreaders-gray min-h-screen">
      <div className="max-w-md mx-auto">
        {/* Breaking News Banner */}
        <div className="bg-coinreaders-blue text-white px-2 py-3">
          <div className="flex items-center gap-2">
            <span className="bg-white text-coinreaders-blue px-2 py-1 rounded text-xs font-bold">
              BREAKING
            </span>
            <span className="text-sm font-medium">
              주요 뉴스를 실시간으로 업데이트합니다
            </span>
          </div>
        </div>
        
        <div className="px-2 py-4 space-y-6">

        {/* 메인 톱 뉴스 */}
        <section>
          {mainArticle && (
            <Card className="overflow-hidden shadow-md bg-white border-0 mb-3">
              <Link href={`/news/${mainArticle.id}`}> 
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  {mainArticle.thumbnail ? (
                    mainArticle.thumbnail.startsWith('data:image/') ? (
                      <img
                        src={mainArticle.thumbnail}
                        alt={mainArticle.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={mainArticle.thumbnail}
                        alt={mainArticle.title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-coinreaders-gray-dark" />
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-coinreaders-blue text-white px-2 py-1 rounded text-xs font-medium">
                      TOP NEWS
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                    <h2 className="text-lg font-bold text-white line-clamp-2 leading-tight">{mainArticle.title}</h2>
                  </div>
                </div>
              </Link>
            </Card>
          )}
          
          {/* 추가 뉴스 2개 (같은 라인) */}
          {articles.length > 1 && (
            <div className="grid grid-cols-2 gap-3">
              {articles.slice(1, 3).map(article => (
                <Card key={article.id} className="overflow-hidden shadow-sm bg-white border-0">
                  <Link href={`/news/${article.id}`}>
                    <div className="relative aspect-[3/2] w-full overflow-hidden">
                      {article.thumbnail ? (
                        article.thumbnail.startsWith('data:image/') ? (
                          <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={article.thumbnail}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="50vw"
                          />
                        )
                      ) : (
                        <div className="absolute inset-0 bg-coinreaders-gray-dark" />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                        <h4 className="text-sm font-semibold text-white line-clamp-2 leading-tight">{article.title}</h4>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>


        {/* 최신 이슈 */}
        <section>
          <div className="flex items-center mb-3">
            <h3 className="text-lg font-bold text-gray-900">최신 이슈</h3>
          </div>
          <Card className="bg-white border-0 shadow-sm">
            <div className="divide-y divide-gray-100">
              {articles.slice(3, 8).map((article, index) => (
                <Link key={article.id} href={`/news/${article.id}`} className="block p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-coinreaders-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">{article.title}</h5>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </section>

        {/* 많이 본 기사 */}
        <section>
          <div className="flex items-center mb-3">
            <h3 className="text-lg font-bold text-gray-900">많이 본 기사</h3>
          </div>
          <Card className="bg-white border-0 shadow-sm">
            <div className="divide-y divide-gray-100">
              {mostViewedArticles.map((article, index) => (
                <Link key={article.id} href={`/news/${article.id}`} className="block p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-coinreaders-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 leading-tight">{article.title}</h5>
                      <div className="text-xs text-coinreaders-gray-dark">
                        <span>조회 {article.view_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </section>

        {/* 하단 더보기 버튼 */}
        <div className="pt-6 pb-8">
          <Link href="/news">
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center py-4">
                <span className="text-coinreaders-blue font-medium">전체 뉴스 보기</span>
              </div>
            </Card>
          </Link>
        </div>
        
        </div>
      </div>
    </main>
  );
}
