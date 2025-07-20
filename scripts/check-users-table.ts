// scripts/check-users-table.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env.local 파일 로딩
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Supabase URL or Service Role Key is not defined in .env.local');
  process.exit(1);
}

// Admin client 생성 (Service Role Key 사용)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkUsersTable() {
  console.log('🔍 Checking Supabase public.users table');
  console.log('=====================================');

  try {
    // 1. 테이블 존재 여부 확인 (메타데이터 조회)
    console.log('📋 Checking table structure...');
    const { data: columns, error: structureError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(0);

    if (structureError) {
      console.error('❌ Error accessing users table:', structureError.message);
      
      // 테이블이 존재하지 않는 경우
      if (structureError.code === 'PGRST106' || structureError.message.includes('does not exist')) {
        console.log('💡 The users table does not exist.');
        console.log('💡 You may need to create it or run migrations.');
        return;
      }
      
      // 권한 문제인 경우
      if (structureError.code === 'PGRST301' || structureError.message.includes('permission')) {
        console.log('🔒 Permission denied. Checking with different approach...');
      }
    } else {
      console.log('✅ users table exists and is accessible');
    }

    // 2. 테이블 데이터 조회 시도
    console.log('\n📊 Checking table data...');
    const { data: users, error: dataError, count } = await supabaseAdmin
      .from('users')
      .select('id, email, name, created_at', { count: 'exact' });

    if (dataError) {
      console.error('❌ Error querying users table:', dataError.message);
      console.log('🔍 Error details:', {
        code: dataError.code,
        hint: dataError.hint,
        details: dataError.details
      });
    } else {
      console.log(`✅ Query successful! Found ${count} users`);
      
      if (users && users.length > 0) {
        console.log('\n👥 Existing users:');
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (${user.name}) - Created: ${user.created_at}`);
        });
      } else {
        console.log('📝 No users found in the table');
      }
    }

    // 3. 테이블 스키마 정보 조회 (SQL 방식)
    console.log('\n🔍 Trying to get table schema...');
    const { data: schemaData, error: schemaError } = await supabaseAdmin
      .rpc('get_table_schema', { table_name: 'users' })
      .single();

    if (schemaError) {
      console.log('⚠️  Could not retrieve schema via RPC:', schemaError.message);
    } else if (schemaData) {
      console.log('✅ Table schema retrieved successfully');
    }

  } catch (error: any) {
    console.error('💥 Unexpected error:', error.message);
  }

  console.log('\n=====================================');
  console.log('🏁 Users table check completed');
}

checkUsersTable();