const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 환경변수 로드
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSQL() {
  try {
    console.log('Adding view_count column to articles table...');
    
    // view_count 컬럼 추가
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
        UPDATE articles SET view_count = 0 WHERE view_count IS NULL;
      `
    });

    if (error) {
      console.error('Error executing SQL:', error);
      
      // 직접 SQL 실행 시도
      console.log('Trying direct column addition...');
      const { error: alterError } = await supabase
        .from('articles')
        .select('view_count')
        .limit(1);
        
      if (alterError && alterError.code === '42703') {
        console.log('Column does not exist, needs to be added manually via Supabase dashboard');
        console.log('Please run this SQL in your Supabase dashboard:');
        console.log('ALTER TABLE articles ADD COLUMN view_count INTEGER DEFAULT 0;');
        return;
      }
    }

    console.log('SQL executed successfully');
    
    // 컬럼이 추가되었는지 확인
    const { data: testData, error: testError } = await supabase
      .from('articles')
      .select('view_count')
      .limit(1);
      
    if (testError) {
      console.error('Error testing column:', testError);
    } else {
      console.log('view_count column is now available');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runSQL();