import { supabase } from '@/lib/supabase';
import { unstable_cache } from 'next/cache';

// Article 타입을 여기서 정의하여 여러 곳에서 재사용합니다.
export interface Article {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

// 리스트 뷰를 위한 경량화된 Article 타입
export interface ArticlePreview {
  id: string;
  title: string;
  thumbnail: string | null;
  created_at: string;
}

// HTML 컨텐츠에서 첫 번째 이미지 URL을 추출하는 함수
export function extractFirstImageUrl(content: string): string | null {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = content.match(imgRegex);
  return match ? match[1] : null;
}

// 리스트 조회용 함수 - content를 제외한 필요한 필드만 조회
export const getArticlePreviews = unstable_cache(
  async (): Promise<ArticlePreview[]> => {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, content, thumbnail, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching article previews from Supabase:', error);
      throw new Error('Supabase query failed');
    }

    // 각 기사의 content에서 첫 번째 이미지를 추출하여 thumbnail로 설정
    const articlesWithThumbnails = articles?.map(article => {
      if (!article.thumbnail) {
        article.thumbnail = article.content ? extractFirstImageUrl(article.content) : null;
      }
      const { content, ...preview } = article;
      return preview;
    }) || [];

    return articlesWithThumbnails;
  },
  ['article-previews'],
  {
    revalidate: 3600,
    tags: ['articles'],
  }
);

// 단일 기사 조회용 함수 - 모든 필드 조회
export const getArticle = unstable_cache(
  async (id: string): Promise<Article | null> => {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching article from Supabase:', error);
      throw new Error('Supabase query failed');
    }

    return article;
  },
  ['article'],
  {
    revalidate: 3600,
    tags: ['articles'],
  }
);

// 기사 내용에서 요약을 생성하는 헬퍼 함수
export function generateSummary(content: string, maxLength: number = 200): string {
  if (!content) return '';
  
  // HTML 태그 제거
  const plainText = content.replace(/<[^>]*>/g, '');
  
  // 최대 길이만큼 자르고 마지막 단어가 잘리지 않도록 처리
  if (plainText.length <= maxLength) return plainText;
  
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

export const addColumn = async (columnName: string, type: string = 'text', isArray: boolean = false) => {
  const { data, error } = await supabase.rpc('add_column', {
    table_name_in: 'articles',
    column_name_in: columnName,
    type_in: type,
    is_array: isArray
  });

  if (error) {
    console.error('Error adding column:', error);
    throw new Error('Failed to add column');
  }

  return data;
};
