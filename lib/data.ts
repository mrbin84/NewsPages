import { supabase } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';

// Article 타입을 여기서 정의하여 여러 곳에서 재사용합니다.
export interface Article {
  id: string;
  title: string;
  summary: string;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
  content?: string; // content는 선택적으로 포함될 수 있습니다.
}

// unstable_cache를 사용하여 데이터베이스 요청 결과를 캐시합니다.
// 이는 fetch의 revalidate 옵션과 동일한 효과를 냅니다.
export const getArticles = unstable_cache(
  async (): Promise<Omit<Article, 'content'>[]> => {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, created_at, updated_at, content')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles from Supabase:', error);
      // 실제 운영 환경에서는 더 구체적인 오류 처리가 필요합니다.
      throw new Error('Supabase query failed');
    }

    if (!articles) {
      return [];
    }

    const processedArticles = articles.map(article => {
      let thumbnail = null;
      let summary = '';

      if (article.content) {
        const imgMatch = article.content.match(/<img[^>]+src="([^" >]+)"/);
        thumbnail = imgMatch ? imgMatch[1] : null;
        summary = article.content.replace(/<[^>]*>/g, '').substring(0, 150);
      }
      
      return {
        id: article.id,
        title: article.title,
        created_at: article.created_at,
        updated_at: article.updated_at,
        thumbnail,
        summary,
      };
    });

    return processedArticles;
  },
  ['articles'], // 캐시를 위한 고유 키
  { 
    revalidate: 3600, // 1시간 동안 캐시 유지
    tags: ['articles'], // 태그 기반 캐시 무효화를 위한 태그
  }
);
