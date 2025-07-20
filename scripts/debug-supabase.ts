import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

console.log('🔍 Supabase Debug Test');
console.log('=====================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 Environment Variables:');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseAnonKey ? '***SET***' : 'MISSING'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

// URL 형식 확인
if (!supabaseUrl.includes('supabase.co')) {
  console.log('❌ Invalid Supabase URL format');
  process.exit(1);
}

console.log('✅ Environment variables look good');

// 1. 기본 fetch 테스트
async function testBasicFetch() {
  try {
    console.log('\n🔄 Testing basic fetch to Supabase...');
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey!,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`OK: ${response.ok}`);
    
    if (response.ok) {
      console.log('✅ Basic fetch successful');
      return true;
    } else {
      console.log('❌ Basic fetch failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Basic fetch error:', error);
    return false;
  }
}

// 2. Supabase 클라이언트 테스트
async function testSupabaseClient() {
  try {
    console.log('\n🔄 Testing Supabase client...');
    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    
    const { data, error } = await supabase
      .from('articles')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Supabase client error:', error.message);
      console.log('Error details:', error);
      return false;
    }

    console.log('✅ Supabase client successful');
    return true;
  } catch (error) {
    console.log('❌ Supabase client exception:', error);
    return false;
  }
}

// 3. 네트워크 연결 테스트
async function testNetworkConnection() {
  try {
    console.log('\n🔄 Testing network connection...');
    
    // DNS 확인
    const url = new URL(supabaseUrl!);
    console.log(`Hostname: ${url.hostname}`);
    
    // ping 테스트 (Node.js에서는 fetch로 대체)
    const start = Date.now();
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey!
      }
    });
    const end = Date.now();
    
    console.log(`Response time: ${end - start}ms`);
    console.log(`Status: ${response.status}`);
    
    return response.ok;
  } catch (error) {
    console.log('❌ Network test failed:', error);
    return false;
  }
}

// 모든 테스트 실행
async function runAllTests() {
  console.log('\n🚀 Running all tests...\n');
  
  const networkTest = await testNetworkConnection();
  const basicFetchTest = await testBasicFetch();
  const clientTest = await testSupabaseClient();
  
  console.log('\n📊 Test Results:');
  console.log(`Network: ${networkTest ? '✅' : '❌'}`);
  console.log(`Basic Fetch: ${basicFetchTest ? '✅' : '❌'}`);
  console.log(`Supabase Client: ${clientTest ? '✅' : '❌'}`);
  
  if (networkTest && basicFetchTest && clientTest) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed');
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if Supabase project is active');
    console.log('2. Verify API keys are correct');
    console.log('3. Check network connectivity');
    console.log('4. Try accessing Supabase dashboard');
  }
}

runAllTests(); 