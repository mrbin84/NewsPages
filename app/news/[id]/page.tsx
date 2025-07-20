import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getArticle, Article } from '@/lib/data';
import { notFound } from 'next/navigation';
import NewsDetailClient from './NewsDetailClient';

interface NewsDetailPageProps {
  params: { id: string };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const session = await getServerSession(authOptions);
  
  // 서버에서 기사 데이터 가져오기
  const article = await getArticle(params.id);
  
  if (!article) {
    notFound();
  }

  const isValidDate = Boolean(article.created_at && !isNaN(new Date(article.created_at).getTime()));

  return (
    <NewsDetailClient 
      article={article}
      session={session}
      isValidDate={isValidDate}
      articleId={params.id}
    />
  );
} 