# 환경 변수 설정 가이드

## 로컬 개발 환경 (.env.local)

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth 설정
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Vercel 배포 환경

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

### 필수 환경 변수
1. `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon Key
3. `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key
4. `NEXTAUTH_SECRET` - NextAuth Secret (32자 이상의 랜덤 문자열)
5. `NEXTAUTH_URL` - 배포된 사이트 URL (예: https://your-app.vercel.app)

### NEXTAUTH_SECRET 생성 방법

터미널에서 다음 명령어를 실행하여 안전한 secret을 생성하세요:

```bash
# 방법 1: openssl 사용
openssl rand -base64 32

# 방법 2: node 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 방법 3: 온라인 생성기 사용
# https://generate-secret.vercel.app/32
```

## 환경 변수 확인

로컬에서 환경 변수가 올바르게 설정되었는지 확인:

```bash
yarn check-env
```

## 문제 해결

### 1. NextAuth Secret 에러
- `NEXTAUTH_SECRET`이 설정되지 않았거나 너무 짧은 경우
- 32자 이상의 랜덤 문자열을 사용하세요

### 2. Supabase 연결 실패
- `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 네트워크 연결 상태 확인

### 3. Vercel 배포 실패
- 모든 환경 변수가 Vercel 대시보드에 설정되었는지 확인
- 환경 변수 이름에 오타가 없는지 확인
- 배포 후 환경 변수가 적용되었는지 확인

## 보안 주의사항

- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용
- `NEXTAUTH_SECRET`은 절대 공개하지 마세요
- 프로덕션에서는 강력한 secret을 사용하세요 