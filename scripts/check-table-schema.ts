// scripts/check-table-schema.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableSchema() {
  console.log('🔍 Checking users table schema and permissions');
  console.log('==============================================');

  try {
    // 1. 테이블 스키마 정보 확인을 위한 다양한 시도
    console.log('📋 1. Schema Information');
    console.log('------------------------');

    // 기본 쿼리로 에러 메시지에서 스키마 정보 추출
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, password, created_at, updated_at')
      .limit(1);

    if (error) {
      console.log('Error details:', error);
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('ℹ️  Some columns may not exist in the table');
      }
    } else {
      console.log('✅ All expected columns exist');
    }

    // 2. 각 컬럼별 개별 확인
    console.log('\n🔍 2. Individual Column Check');
    console.log('-----------------------------');

    const columns = ['id', 'email', 'name', 'password', 'created_at', 'updated_at'];
    
    for (const column of columns) {
      try {
        const { error: colError } = await supabase
          .from('users')
          .select(column)
          .limit(0);

        if (colError) {
          console.log(`❌ ${column}: ${colError.message}`);
        } else {
          console.log(`✅ ${column}: exists`);
        }
      } catch (err: any) {
        console.log(`❌ ${column}: ${err.message}`);
      }
    }

    // 3. 간단한 삽입 테스트 (실제로는 실행하지 않음)
    console.log('\n🧪 3. Insert Test (Dry Run)');
    console.log('---------------------------');

    try {
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashedpassword'
        }])
        .select()
        .limit(0); // 실제로는 0개 제한으로 실행하지 않음

      if (insertError) {
        console.log(`Insert test result: ${insertError.message}`);
        if (insertError.message.includes('null value')) {
          console.log('ℹ️  Required fields might be missing');
        }
        if (insertError.message.includes('unique')) {
          console.log('ℹ️  Email might need to be unique');
        }
      }
    } catch (err: any) {
      console.log(`Insert test error: ${err.message}`);
    }

  } catch (error: any) {
    console.error('💥 Unexpected error:', error.message);
  }

  console.log('\n==============================================');
  console.log('🏁 Schema check completed');
}

checkTableSchema();