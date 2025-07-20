import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

console.log('🔍 Supabase Connection Test');
console.log('==========================');

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL is not set or still has placeholder value');
  process.exit(1);
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set or still has placeholder value');
  process.exit(1);
}

console.log('✅ Environment variables are set');

// Supabase 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔄 Testing Supabase connection...');
    
    // 간단한 쿼리로 연결 테스트
    const { data, error } = await supabase
      .from('articles')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      console.log('Error details:', error);
      return false;
    }

    console.log('✅ Supabase connection successful!');
    console.log('📊 Articles table is accessible');
    return true;
  } catch (error) {
    console.log('❌ Unexpected error:', error);
    return false;
  }
}

// 연결 테스트 실행
testConnection().then((success) => {
  if (success) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Connection test failed');
    process.exit(1);
  }
}); 