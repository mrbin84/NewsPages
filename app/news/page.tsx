import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import NewsList from './NewsList'; // 클라이언트 컴포넌트를 임포트
import { getAbsoluteUrl } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  summary: string;
  thumbnail: string | null;
  created_at: string;
}

async function getArticles(): Promise<Article[]> {
  const res = await fetch(getAbsoluteUrl('/api/articles'), {
    next: { revalidate: 3600 }, // 1시간 캐시
  });

  if (!res.ok) {
    throw new Error('Failed to fetch articles');
  }
  return res.json();
}

export default async function NewsPage() {
  const session = await getServerSession(authOptions);
  let articles: Article[] = [];
  let error: string | null = null;

  try {
    articles = await getArticles();
  } catch (err) {
    console.error('Error fetching articles:', err);
    error = '기사를 불러오는데 실패했습니다.';
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <NewsList articles={articles} session={session} />
    </div>
  );
} 