# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://supabase.com 에서 새 프로젝트 생성
2. 프로젝트 이름과 데이터베이스 비밀번호 설정
3. 지역 선택 (가까운 지역 권장)

## 2. API 키 확인

### Project Settings > API에서 다음 정보 확인:

```
Project URL: https://your-project-id.supabase.co
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. 로컬 환경 변수 설정

`.env.local` 파일을 다음과 같이 수정:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth 설정
NEXTAUTH_SECRET=YhaoRnWJzPC3E71eLsQOBeBA0Go1QtOIHfFEoSQBIdI=
NEXTAUTH_URL=http://localhost:3000
```

## 4. 데이터베이스 테이블 생성

### SQL Editor에서 다음 쿼리 실행:

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기사 테이블
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 기사 테이블 정책 (모든 사용자가 읽기 가능)
CREATE POLICY "Articles are viewable by everyone" ON articles
  FOR SELECT USING (true);

-- 기사 테이블 정책 (인증된 사용자만 쓰기 가능)
CREATE POLICY "Users can insert articles" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update articles" ON articles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete articles" ON articles
  FOR DELETE USING (auth.role() = 'authenticated');
```

## 5. Storage 버킷 설정

### Storage > Buckets에서:

1. **새 버킷 생성**: `article-images`
2. **Public bucket으로 설정**
3. **File size limit**: 2MB
4. **Allowed MIME types**: image/jpeg, image/png, image/webp

### Storage > Policies에서:

```sql
-- 모든 사용자가 이미지 읽기 가능
CREATE POLICY "Images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

-- 인증된 사용자만 이미지 업로드 가능
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');
```

## 6. 연결 테스트

```bash
# 환경 변수 확인
yarn check-env

# Supabase 연결 테스트
yarn test-supabase
```

## 7. Vercel 배포 설정

Vercel 대시보드에서 다음 환경 변수 설정:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_SECRET=YhaoRnWJzPC3E71eLsQOBeBA0Go1QtOIHfFEoSQBIdI=
NEXTAUTH_URL=https://your-app-name.vercel.app
```

## 문제 해결

### 1. 연결 실패
- 프로젝트 URL과 API 키가 정확한지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 네트워크 연결 상태 확인

### 2. 테이블 접근 오류
- RLS 정책이 올바르게 설정되었는지 확인
- 테이블이 존재하는지 확인

### 3. Storage 오류
- 버킷이 생성되었는지 확인
- Storage 정책이 설정되었는지 확인 