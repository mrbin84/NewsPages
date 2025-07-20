import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { compressImage } from '../lib/imageUtils';
import fetch from 'node-fetch';

// .env.local 파일 로딩
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function recompressImages() {
  try {
    // 모든 기사 가져오기
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, thumbnail')
      .not('thumbnail', 'is', null);

    if (articlesError) {
      throw articlesError;
    }

    console.log(`Found ${articles.length} articles with images`);

    // 각 이미지 처리
    for (const article of articles) {
      try {
        if (!article.thumbnail) continue;

        console.log(`Processing image for article ${article.id}...`);
        
        // 이미지 다운로드
        const imageBuffer = await downloadImage(article.thumbnail);
        
        // 이미지 재압축
        const compressedBuffer = await compressImage(imageBuffer, {
          maxWidth: 1200,
          quality: 70
        });

        // 새 파일 이름 생성
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2);
        const fileName = `recompressed/${timestamp}-${randomString}.webp`;

        // 압축된 이미지 업로드
        const { error: uploadError } = await supabase.storage
          .from('news-images')
          .upload(fileName, compressedBuffer, {
            contentType: 'image/webp',
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error(`Error uploading recompressed image for article ${article.id}:`, uploadError);
          continue;
        }

        // 새 URL 직접 구성
        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-images/${fileName}`;

        // 기사 업데이트
        const { error: updateError } = await supabase
          .from('articles')
          .update({ thumbnail: publicUrl })
          .eq('id', article.id);

        if (updateError) {
          console.error(`Error updating article ${article.id}:`, updateError);
          continue;
        }

        console.log(`Successfully recompressed image for article ${article.id}`);
      } catch (error) {
        console.error(`Error processing article ${article.id}:`, error);
      }
    }

    console.log('Image recompression completed');
  } catch (error) {
    console.error('Error in recompressImages:', error);
  }
}

// 스크립트 실행
recompressImages(); 