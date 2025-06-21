import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import NewsList from './NewsList';
import { getArticles, Article } from '@/lib/data';

export default async function NewsPage() {
  const session = await getServerSession(authOptions);
  let articles: Omit<Article, 'content'>[] = [];
  let error: string | null = null;

  try {
    articles = await getArticles();
  } catch (e: any) {
    console.error('Error fetching articles directly from Supabase:', e);
    error = 'Failed to load articles. Please try again later.';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">News</h1>
        {session && (
          <a
            href="/news/create"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create Article
          </a>
        )}
      </div>
      {error ? (
        <div className="text-red-500 bg-red-100 p-4 rounded-md">
          <p>
            <strong>Error:</strong> Failed to load articles.
          </p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      ) : (
        <NewsList articles={articles} session={session} />
      )}
    </div>
  );
}