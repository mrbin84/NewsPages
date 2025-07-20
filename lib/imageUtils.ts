import { supabase } from './supabase';
import sharp from 'sharp';

interface CompressOptions {
  maxWidth?: number;
  quality?: number;
}

export async function compressImage(buffer: Buffer, options: CompressOptions = {}): Promise<Buffer> {
  const { maxWidth = 1200, quality = 50 } = options;
  
  try {
    // 이미지 메타데이터 가져오기
    const metadata = await sharp(buffer).metadata();
    
    // 원본 크기 (MB)
    const originalSizeMB = buffer.length / (1024 * 1024);
    
    // 파일 크기에 따른 품질 조정
    let finalQuality = quality;
    if (originalSizeMB > 5) {
      finalQuality = 50;  // 더 강한 압축
    } else if (originalSizeMB > 2) {
      finalQuality = 60;
    } else if (originalSizeMB > 1) {
      finalQuality = 65;
    } else {
      finalQuality = 70;  // 기본 품질도 낮춤
    }

    // 이미지 처리 파이프라인 구성
    let pipeline = sharp(buffer);

    // 이미지 크기 조정 (항상 리사이즈)
    if (metadata.width) {
      const targetWidth = Math.min(metadata.width, maxWidth);
      pipeline = pipeline.resize(targetWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      });
    }

    // WebP 형식으로 변환 및 압축
    const compressedBuffer = await pipeline
      .webp({ 
        quality: finalQuality,
        effort: 6
      })
      .toBuffer();

    return compressedBuffer;
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
}

export async function uploadImage(file: File): Promise<string> {
  try {
    // File을 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 이미지 압축
    const compressedBuffer = await compressImage(buffer);

    // 파일 이름 생성
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomString}.webp`;

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('news-images')
      .upload(fileName, compressedBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Storage error details:', error);
      throw error;
    }

    // 업로드된 이미지의 공개 URL 직접 구성
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-images/${fileName}`;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
} 