import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import NewsList from './NewsList';
import { getArticlePreviews, ArticlePreview } from '@/lib/data';

export default async function NewsPage() {
  const session = await getServerSession(authOptions);
  let articles: ArticlePreview[] = [];

  try {
    articles = await getArticlePreviews(50); // 한 번에 50개만 로드
  } catch (e: any) {
    console.error('Error fetching articles:', e);
    articles = []; // 에러시 빈 배열 반환
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">전체 기사</h1>
      </div>
      <NewsList articles={articles} session={session} />
    </div>
  );
}