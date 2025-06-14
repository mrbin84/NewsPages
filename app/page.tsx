'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEffect, useState } from 'react';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

// Extract first image from content
function extractFirstImage(content: string): string | null {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch ? imgMatch[1] : null;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch('/api/articles');
        if (!res.ok) throw new Error('Failed to fetch articles');
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : data.news || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError('Failed to load articles');
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">로딩 중...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-red-500 py-8">{error}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">최신 뉴스</h1>
        <div className="space-y-6">
          {articles.length === 0 ? (
            <p className="text-gray-500 text-center py-8">등록된 기사가 없습니다.</p>
          ) : (
            articles.map((article: Article) => {
              const thumbnailUrl = extractFirstImage(article.content);
              return (
                <article key={article.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/news/${article.id}`} className="block">
                    <div className="p-6">
                      <div className="flex gap-6">
                        {thumbnailUrl && (
                          <div className="flex-shrink-0 w-48 h-32">
                            <img
                              src={thumbnailUrl}
                              alt={article.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-grow">
                          <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                            {article.title}
                          </h2>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {article.content.replace(/<[^>]*>/g, '')}
                          </p>
                          <time className="text-sm text-gray-500">
                            {format(new Date(article.createdAt), 'PPP', { locale: ko })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
