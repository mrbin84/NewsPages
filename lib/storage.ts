import { supabase } from './supabase';

const BUCKET_NAME = 'article-images';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// 버킷이 없으면 생성하는 함수
export async function ensureBucketExists() {
  try {
    const { data: bucket, error } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (error && error.message.includes('not found')) {
      const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: MAX_FILE_SIZE
      });
      
      if (createError) {
        throw createError;
      }
    } else if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

// 이미지 크기별 최적 품질 설정
const getInitialQuality = (fileSize: number): number => {
  const sizeMB = fileSize / (1024 * 1024);
  if (sizeMB > 5) return 0.6;     // 5MB 초과: 60% 품질
  if (sizeMB > 2) return 0.7;     // 2MB-5MB: 70% 품질
  if (sizeMB > 1) return 0.75;    // 1MB-2MB: 75% 품질
  if (sizeMB > 0.5) return 0.8;   // 500KB-1MB: 80% 품질
  return 0.85;                     // 500KB 이하: 85% 품질
};

// 이미지 크기별 최적 해상도 설정
const getMaxDimension = (width: number, height: number): number => {
  const maxSize = Math.max(width, height);
  if (maxSize > 2000) return 1500;      // 2000px 초과
  if (maxSize > 1500) return 1200;      // 1500-2000px
  if (maxSize > 1000) return 1000;      // 1000-1500px
  return maxSize;                        // 1000px 이하는 유지
};

// 이미지 압축 함수
export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = async () => {
      URL.revokeObjectURL(img.src);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      // 이미지 크기에 따른 최적 해상도 계산
      const maxDimension = getMaxDimension(img.width, img.height);
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // 파일 크기에 따른 초기 품질 설정으로 압축 시도
      const tryCompression = async (quality: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          if (!canvas.toBlob) {
            reject(new Error('Canvas toBlob not supported'));
            return;
          }

          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // 2MB 초과시에만 추가 압축 시도
              if (blob.size > MAX_FILE_SIZE && quality > 0.1) {
                // 현재 크기와 목표 크기의 비율을 기반으로 다음 품질 레벨 계산
                const nextQuality = Math.max(0.1, quality * (MAX_FILE_SIZE / blob.size) * 0.95);
                try {
                  const recompressedBlob = await tryCompression(nextQuality);
                  resolve(recompressedBlob);
                } catch (error) {
                  reject(error);
                }
              } else {
                resolve(blob);
              }
            },
            'image/webp',
            quality
          );
        });
      };

      try {
        // 파일 크기에 따른 초기 품질 설정
        const initialQuality = getInitialQuality(file.size);
        const compressedBlob = await tryCompression(initialQuality);
        resolve(compressedBlob);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
  });
}

// 이미지 업로드 함수
export async function uploadImage(file: File, userId?: string): Promise<string> {
  try {
    // 버킷 존재 확인
    await ensureBucketExists();
    
    // 모든 이미지 압축 적용
    const compressedImage = await compressImage(file);
    
    // 압축 후에도 크기가 제한을 초과하면 에러
    if (compressedImage.size > MAX_FILE_SIZE) {
      throw new Error('Failed to compress image to target size');
    }
    
    // 파일 이름 생성 (사용자ID + 타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const userPrefix = userId ? `${userId}/` : '';
    const fileName = `${userPrefix}${timestamp}-${randomString}.webp`;
    
    // 압축된 이미지 업로드
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, compressedImage, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      throw error;
    }
    
    // 공개 URL 반환
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
} 