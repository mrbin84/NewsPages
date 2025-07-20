// scripts/create-user-workaround.ts
// Service Role Key 없이 사용자를 생성하는 우회 방법

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Creating User Without Service Role Key');
console.log('=========================================');

async function createUserWorkaround() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables');
    return;
  }

  try {
    // 1. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash('admin1234', 10);
    console.log('🔐 Password hashed successfully');

    // 2. SQL 구문 생성
    console.log('\n📝 SQL Statements to Execute:');
    console.log('=============================');

    // RLS 정책을 임시 비활성화하고 사용자 생성
    const sqlStatements = `
-- 1. RLS 임시 비활성화 (관리자 권한 필요)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. 사용자 생성
INSERT INTO public.users (email, name, password, created_at) 
VALUES (
  'admin@bizfocus.com',
  'BizFocus Admin',
  '${hashedPassword}',
  NOW()
);

-- 3. 추가 사용자들
INSERT INTO public.users (email, name, password, created_at) 
VALUES 
  ('editor@bizfocus.com', 'BizFocus Editor', '${await bcrypt.hash('admin1234', 10)}', NOW()),
  ('writer@bizfocus.com', 'BizFocus Writer', '${await bcrypt.hash('admin1234', 10)}', NOW());

-- 4. RLS 다시 활성화 (선택사항)
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. 사용자 조회 확인
SELECT id, email, name, created_at FROM public.users;
`;

    console.log(sqlStatements);

    // 3. 대안: RLS 정책 생성 SQL
    console.log('\n🔒 Alternative: Create RLS Policy for Insert');
    console.log('============================================');

    const rlsPolicySQL = `
-- 인증된 사용자가 자신의 데이터를 삽입할 수 있도록 허용
CREATE POLICY "Users can insert their own data" ON public.users
FOR INSERT 
WITH CHECK (true);

-- 또는 모든 사용자가 삽입 가능하도록 (개발용)
CREATE POLICY "Allow all inserts" ON public.users
FOR INSERT 
TO public
USING (true)
WITH CHECK (true);
`;

    console.log(rlsPolicySQL);

    // 4. 임시 해결책: Auth 우회
    console.log('\n⚡ Temporary Fix: Bypass Auth for Development');
    console.log('============================================');
    
    console.log(`
수정할 파일: lib/auth.ts
다음 코드를 authorize 함수 시작 부분에 추가:

// 임시 개발용 우회 (프로덕션에서는 제거 필요)
if (credentials?.email === 'admin@bizfocus.com' && credentials?.password === 'admin1234') {
  return {
    id: 'temp-admin-id',
    email: 'admin@bizfocus.com',
    name: 'BizFocus Admin'
  };
}
`);

  } catch (error: any) {
    console.error('💥 Error:', error.message);
  }

  console.log('\n=========================================');
  console.log('🏁 Workaround solutions generated');
  console.log('\n💡 Choose one of these solutions:');
  console.log('   1. Execute SQL in Supabase Dashboard');
  console.log('   2. Add RLS policy for inserts');
  console.log('   3. Temporarily bypass auth in code');
}

createUserWorkaround();