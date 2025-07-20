import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env.local 파일 로딩
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function backfillThumbnails() {
  console.log('Starting thumbnail backfill process...');

  try {
    // 썸네일이 없는 모든 기사 가져오기
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, content, thumbnail')
      .is('thumbnail', null);

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      throw articlesError;
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found with missing thumbnails. Exiting.');
      return;
    }

    console.log(`Found ${articles.length} articles with missing thumbnails. Processing...`);

    let updatedCount = 0;
    for (const article of articles) {
      if (article.content) {
        const imageUrl = extractFirstImageUrl(article.content);

        if (imageUrl) {
          console.log(`Found image for article ${article.id}. Updating thumbnail...`);
          const { error: updateError } = await supabase
            .from('articles')
            .update({ thumbnail: imageUrl })
            .eq('id', article.id);

          if (updateError) {
            console.error(`Failed to update thumbnail for article ${article.id}:`, updateError);
          } else {
            console.log(`Successfully updated thumbnail for article ${article.id}.`);
            updatedCount++;
          }
        }
      }
    }

    console.log('--- Backfill complete ---');
    console.log(`Total articles processed: ${articles.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log('-------------------------');

  } catch (error) {
    console.error('An unexpected error occurred during the backfill process:', error);
  }
}

backfillThumbnails(); 