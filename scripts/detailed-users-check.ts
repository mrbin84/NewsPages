// scripts/detailed-users-check.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env.local 파일 로딩
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase URL or Anon Key is not defined');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function detailedUsersCheck() {
  console.log('🔍 Detailed public.users Table Analysis');
  console.log('======================================');
  console.log(`🌐 Supabase URL: ${supabaseUrl}`);
  console.log('');

  try {
    // 1. 기본 데이터 조회
    console.log('📊 1. Basic Data Query');
    console.log('----------------------');
    
    const { data: users, error: basicError, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (basicError) {
      console.error('❌ Basic query error:', basicError.message);
      console.log('   Code:', basicError.code);
      console.log('   Hint:', basicError.hint);
    } else {
      console.log(`✅ Query successful`);
      console.log(`📊 Total count: ${count}`);
      console.log(`📄 Returned rows: ${users?.length || 0}`);
      
      if (users && users.length > 0) {
        console.log('\n👥 User Data:');
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ID: ${user.id}`);
          console.log(`     Email: ${user.email || 'N/A'}`);
          console.log(`     Name: ${user.name || 'N/A'}`);
          console.log(`     Created: ${user.created_at || 'N/A'}`);
          console.log(`     Updated: ${user.updated_at || 'N/A'}`);
          console.log('     ---');
        });
      } else {
        console.log('📝 No users found in the table');
      }
    }

    // 2. 테이블 메타데이터 조회
    console.log('\n🔍 2. Table Structure Check');
    console.log('---------------------------');
    
    const { data: structure, error: structureError } = await supabase
      .from('users')
      .select('*')
      .limit(0);

    if (structureError) {
      console.error('❌ Structure query error:', structureError.message);
    } else {
      console.log('✅ Table structure is accessible');
    }

    // 3. 특정 필드만 조회
    console.log('\n📋 3. Field-specific Query');
    console.log('--------------------------');
    
    const { data: emailsOnly, error: fieldsError } = await supabase
      .from('users')
      .select('id, email, name');

    if (fieldsError) {
      console.error('❌ Fields query error:', fieldsError.message);
    } else {
      console.log(`✅ Field query successful: ${emailsOnly?.length || 0} rows`);
      if (emailsOnly && emailsOnly.length > 0) {
        emailsOnly.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.name})`);
        });
      }
    }

    // 4. 최근 생성된 사용자 조회
    console.log('\n⏰ 4. Recent Users Check');
    console.log('-----------------------');
    
    const { data: recentUsers, error: recentError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('❌ Recent users query error:', recentError.message);
    } else {
      console.log(`✅ Recent users query: ${recentUsers?.length || 0} rows`);
      if (recentUsers && recentUsers.length > 0) {
        recentUsers.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} - ${user.created_at}`);
        });
      }
    }

    // 5. 테이블 존재 확인 (다른 방법)
    console.log('\n🔍 5. Table Existence Verification');
    console.log('----------------------------------');
    
    try {
      // 빈 insert 시도 (실제로는 실행되지 않음)
      const { error: insertError } = await supabase
        .from('users')
        .insert([])
        .select();

      if (insertError) {
        if (insertError.message.includes('new row violates') || 
            insertError.message.includes('null value') ||
            insertError.code === '23502') {
          console.log('✅ Table exists (empty insert validation error expected)');
        } else if (insertError.message.includes('does not exist')) {
          console.log('❌ Table does not exist');
        } else {
          console.log(`ℹ️  Insert test result: ${insertError.message}`);
        }
      } else {
        console.log('✅ Table exists and accepts inserts');
      }
    } catch (error: any) {
      console.log(`ℹ️  Insert test error: ${error.message}`);
    }

  } catch (error: any) {
    console.error('💥 Unexpected error during analysis:', error.message);
  }

  console.log('\n======================================');
  console.log('🏁 Detailed analysis completed');
}

detailedUsersCheck();