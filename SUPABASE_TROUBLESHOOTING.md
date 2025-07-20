# Supabase 연결 문제 해결 가이드

## 현재 문제: DNS 해석 실패 (ENOTFOUND)

에러 메시지: `getaddrinfo ENOTFOUND qofpoxynzgpkgvveqvid.supabase.co`

## 해결 방법

### 1. Supabase 프로젝트 상태 확인

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - 로그인 후 프로젝트 목록 확인

2. **프로젝트 상태 확인**
   - 프로젝트가 "Active" 상태인지 확인
   - 프로젝트가 "Paused" 또는 "Suspended" 상태라면 활성화

3. **프로젝트 URL 재확인**
   - 프로젝트 클릭 → Settings → API
   - Project URL이 올바른지 확인

### 2. 프로젝트가 비활성 상태인 경우

#### 무료 플랜 한도 초과
- 무료 플랜은 월 500MB 데이터베이스, 1GB 파일 저장소
- 한도를 초과하면 프로젝트가 일시 중지됨

#### 해결 방법:
1. **데이터 정리**: 불필요한 데이터 삭제
2. **업그레이드**: Pro 플랜으로 업그레이드
3. **새 프로젝트**: 새 프로젝트 생성

### 3. 새 프로젝트 생성 (권장)

1. **새 프로젝트 생성**
   ```
   https://supabase.com/dashboard → New Project
   ```

2. **프로젝트 설정**
   - 프로젝트 이름: `newspages`
   - 데이터베이스 비밀번호 설정
   - 지역 선택 (가까운 지역 권장)

3. **API 키 확인**
   - Settings → API에서 다음 정보 복사:
     - Project URL
     - anon public key
     - service_role key

4. **환경 변수 업데이트**
   ```bash
   # .env.local 파일 수정
   NEXT_PUBLIC_SUPABASE_URL=https://new-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4. 데이터베이스 테이블 생성

새 프로젝트에서 SQL Editor에서 실행:

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

-- RLS 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 기사 테이블 정책
CREATE POLICY "Articles are viewable by everyone" ON articles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert articles" ON articles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update articles" ON articles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete articles" ON articles
  FOR DELETE USING (auth.role() = 'authenticated');
```

### 5. Storage 버킷 설정

1. **Storage → Buckets → New Bucket**
   - Name: `article-images`
   - Public bucket 체크
   - File size limit: 2MB

2. **Storage → Policies에서 정책 설정**:
   ```sql
   -- 모든 사용자가 이미지 읽기 가능
   CREATE POLICY "Images are publicly accessible" ON storage.objects
     FOR SELECT USING (bucket_id = 'article-images');

   -- 인증된 사용자만 이미지 업로드 가능
   CREATE POLICY "Users can upload images" ON storage.objects
     FOR INSERT WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');
   ```

### 6. 연결 테스트

```bash
# 환경 변수 확인
yarn check-env

# Supabase 연결 테스트
yarn test-supabase

# 상세 진단
yarn debug-supabase
```

### 7. Vercel 환경 변수 업데이트

Vercel 대시보드에서 환경 변수 업데이트:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 예상 결과

올바른 설정 후:
- ✅ 모든 테스트 통과
- ✅ 로컬에서 정상 작동
- ✅ Vercel 배포에서 정상 작동

## 추가 도움

문제가 지속되면:
1. Supabase 지원팀 문의
2. 프로젝트 로그 확인
3. 네트워크 연결 상태 확인 