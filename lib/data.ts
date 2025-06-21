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
    // Select only the necessary fields for the list, excluding the large 'content' field.
    // This prevents the Next.js data cache from exceeding its 2MB limit.
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, summary, thumbnail, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles from Supabase:', error);
      throw new Error('Supabase query failed');
    }

    // The database now provides the summary and thumbnail directly.
    return articles || [];
  },
  ['articles'], // 캐시를 위한 고유 키
  { 
    revalidate: 3600, // 1시간 동안 캐시 유지
    tags: ['articles'], // 태그 기반 캐시 무효화를 위한 태그
  }
);
