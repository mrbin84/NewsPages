import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// .env.local 파일 로드 (가장 먼저)
dotenv.config({ path: '.env.local' });

// HTML 컨텐츠에서 첫 번째 이미지 URL을 추출하는 함수
function extractFirstImageUrl(content: string): string | null {
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

async function checkThumbnails() {
  try {
    console.log('환경 변수 확인:');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '없음');
    console.log('SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '없음');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('환경변수가 설정되지 않았습니다.');
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('\n데이터베이스 연결 확인 중...');
    
    // 최근 10개 기사 조회
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, content, thumbnail, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching articles:', error);
      return;
    }

    console.log(`\n총 ${articles?.length || 0}개의 기사를 찾았습니다.\n`);

    if (articles) {
      articles.forEach((article, index) => {
        console.log(`--- 기사 ${index + 1} ---`);
        console.log(`ID: ${article.id}`);
        console.log(`제목: ${article.title}`);
        console.log(`작성일: ${article.created_at}`);
        console.log(`현재 thumbnail 값: ${article.thumbnail || 'NULL'}`);
        
        // 콘텐츠에서 첫 번째 이미지 추출
        const extractedImage = extractFirstImageUrl(article.content);
        console.log(`콘텐츠에서 추출된 이미지: ${extractedImage || '없음'}`);
        
        // 썸네일이 없지만 콘텐츠에 이미지가 있는 경우
        if (!article.thumbnail && extractedImage) {
          console.log('⚠️  썸네일이 누락되었지만 콘텐츠에 이미지가 있습니다!');
        }
        
        console.log('');
      });
    }

  } catch (error) {
    console.error('스크립트 실행 중 오류:', error);
  }
}

checkThumbnails();