// scripts/check-users-anon.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env.local 파일 로딩
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL or Anon Key is not defined in .env.local');
  process.exit(1);
}

// Anon client 생성 (Public Anon Key 사용)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsersWithAnonKey() {
  console.log('🔍 Checking public.users table with Anon Key');
  console.log('============================================');

  try {
    // 1. 테이블 접근 시도 (anon key로)
    console.log('📋 Trying to access users table...');
    
    const { data: users, error: queryError, count } = await supabase
      .from('users')
      .select('id, email, name', { count: 'exact' });

    if (queryError) {
      console.error('❌ Error with anon key:', queryError.message);
      console.log('🔍 Error details:', {
        code: queryError.code,
        hint: queryError.hint,
        details: queryError.details
      });

      // RLS 정책 문제일 가능성
      if (queryError.code === 'PGRST116' || queryError.message.includes('JWT')) {
        console.log('🔒 This might be due to Row Level Security (RLS) policies');
        console.log('💡 The table exists but requires authentication to access');
      }
      
      // 테이블이 없는 경우
      if (queryError.message.includes('does not exist')) {
        console.log('❌ The users table does not exist in the database');
        return;
      }
    } else {
      console.log(`✅ Successfully accessed users table with anon key!`);
      console.log(`📊 Found ${count} users`);
      
      if (users && users.length > 0) {
        console.log('\n👥 Users (limited by RLS):');
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.name})`);
        });
      }
    }

    // 2. 테이블 구조 확인 (빈 쿼리로)
    console.log('\n🔍 Checking table structure...');
    const { data: structure, error: structureError } = await supabase
      .from('users')
      .select('*')
      .limit(0);

    if (structureError) {
      console.log('⚠️  Could not get structure:', structureError.message);
    } else {
      console.log('✅ Table structure is accessible');
    }

  } catch (error: any) {
    console.error('💥 Unexpected error:', error.message);
  }

  console.log('\n============================================');
  console.log('🏁 Anon key check completed');
}

checkUsersWithAnonKey();