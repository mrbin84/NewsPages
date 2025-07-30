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
  view_count?: number;
}

// HTML 컨텐츠에서 첫 번째 이미지 URL을 추출하는 함수 (개선된 버전)
export function extractFirstImageUrl(content: string): string | null {
  // Base64 이미지와 일반 URL 모두 지원
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = content.match(imgRegex);
  
  if (match && match[1]) {
    const src = match[1];
    // 유효한 이미지 src인지 확인
    if (src.startsWith('data:image/') || src.startsWith('http') || src.startsWith('/')) {
      return src;
    }
  }
  
  return null;
}

// Supabase 스토리지 URL 가져오기
function getStorageUrl(path: string | null): string | null {
  if (!path) return null;
  
  // Base64 이미지인 경우 그대로 반환
  if (path.startsWith('data:image/')) {
    return path;
  }
  
  // 이미 완전한 URL인 경우 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Supabase URL이 환경변수에 없는 경우 null 반환
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  
  // 스토리지 URL 생성
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
}

// 리스트 조회용 함수 - 캐시 비활성화로 대용량 콘텐츠 처리
export async function getArticlePreviews(limit: number = 13): Promise<ArticlePreview[]> {
    try {
      // 환경 변수 확인
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase environment variables');
        return [];
      }

      const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, thumbnail, created_at, view_count')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching article previews:', error);
        return [];
      }

      // thumbnail URL 처리
      const processedArticles = articles?.map(article => ({
        id: article.id,
        title: article.title,
        thumbnail: getStorageUrl(article.thumbnail),
        created_at: article.created_at,
        view_count: article.view_count || 0
      })) || [];

      return processedArticles;
    } catch (error) {
      console.error('Error in getArticlePreviews:', error);
      
      // 네트워크 에러인지 확인
      if (error instanceof Error) {
        if (error.message.includes('fetch failed') || error.message.includes('ENOTFOUND')) {
          console.error('Network error detected - Supabase project may be inactive or URL incorrect');
          throw new Error('Supabase 연결 실패: 프로젝트가 비활성 상태이거나 URL이 잘못되었습니다.');
        }
      }
      
      // 에러 발생 시 빈 배열 반환하여 앱이 크래시되지 않도록 함
      return [];
    }
}

// 추가: 더 많은 기사를 가져오는 함수
export const getMoreArticlePreviews = unstable_cache(
  async (offset: number, limit: number = 10): Promise<ArticlePreview[]> => {
    try {
      // 환경 변수 확인
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase environment variables');
        throw new Error('Supabase configuration is missing');
      }

      const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, thumbnail, created_at, view_count')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching more article previews from Supabase:', error);
        throw new Error(`Supabase query failed: ${error.message}`);
      }

      // thumbnail URL 처리
      const processedArticles = articles?.map(article => ({
        id: article.id,
        title: article.title,
        thumbnail: getStorageUrl(article.thumbnail),
        created_at: article.created_at,
        view_count: article.view_count || 0
      })) || [];

      return processedArticles;
    } catch (error) {
      console.error('Error in getMoreArticlePreviews:', error);
      return [];
    }
  },
  ['more-article-previews'],
  {
    revalidate: 3600,
    tags: ['articles'],
  }
);

// 단일 기사 조회용 함수 - 모든 필드 조회
// 조회수 순으로 많이 본 기사 가져오기
export async function getMostViewedArticles(limit: number = 5): Promise<ArticlePreview[]> {
  try {
    // 환경 변수 확인
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      throw new Error('Supabase configuration is missing');
    }

    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, thumbnail, created_at, view_count')
      .order('view_count', { ascending: false })
      .order('created_at', { ascending: false }) // 조회수가 같으면 최신순
      .limit(limit);

    if (error) {
      console.error('Error fetching most viewed articles:', error);
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    // thumbnail URL 처리
    const processedArticles = articles?.map(article => ({
      id: article.id,
      title: article.title,
      thumbnail: getStorageUrl(article.thumbnail),
      created_at: article.created_at,
      view_count: article.view_count || 0
    })) || [];

    return processedArticles;
  } catch (error) {
    console.error('Error in getMostViewedArticles:', error);
    return [];
  }
}

export const getArticle = unstable_cache(
  async (id: string): Promise<Article | null> => {
    try {
      // 환경 변수 확인
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Missing Supabase environment variables');
        throw new Error('Supabase configuration is missing');
      }

      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        return null;
      }

      // thumbnail URL 처리
      if (article) {
        return {
          ...article,
          thumbnail: getStorageUrl(article.thumbnail)
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getArticle:', error);
      return null;
    }
  },
  ['article-by-id'],
  { 
    revalidate: 3600,
    tags: ['articles'],
  }
);
