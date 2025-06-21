import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getArticles, Article } from '@/lib/data';

export default async function Home() {
  let articles: Omit<Article, 'content'>[] = [];
  let error: string | null = null;

  try {
    articles = await getArticles();
  } catch (e) {
    console.error('Error fetching articles directly from Supabase:', e);
    error = 'Failed to load articles. Please try again later.';
  }
  
  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">
            <p><strong>Error:</strong> {error}</p>
          </div>
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
            articles.map((article) => {
              const isValidDate = article.created_at && !isNaN(new Date(article.created_at).getTime());

              return (
                <article key={article.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/news/${article.id}`} className="block">
                    <div className="p-6">
                      <div className="flex gap-6">
                        {article.thumbnail && (
                          <div className="flex-shrink-0 w-48 h-32">
                            <img
                              src={article.thumbnail}
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
                            {article.summary}
                          </p>
                          <time className="text-sm text-gray-500">
                            {isValidDate
                              ? format(new Date(article.created_at), 'PPP', { locale: ko })
                              : '날짜 정보 없음'}
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
