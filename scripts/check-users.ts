import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

console.log('🔍 User Account Check');
console.log('====================');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  try {
    console.log('🔄 Fetching user accounts...');
    
    // 사용자 테이블에서 모든 사용자 조회
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('❌ Error fetching users:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('📝 No users found in database');
      console.log('\n💡 To create a new user, run:');
      console.log('yarn create-user');
      return;
    }

    console.log(`✅ Found ${users.length} user(s):`);
    console.log('');

    users.forEach((user, index) => {
      console.log(`${index + 1}. User Account:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'Not set'}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('');
    });

    console.log('🔐 Login Information:');
    console.log('=====================');
    console.log('Use any of the above email addresses to log in.');
    console.log('If you forgot your password, you can reset it or create a new user.');
    console.log('');
    console.log('💡 Commands:');
    console.log('- Create new user: yarn create-user');
    console.log('- Reset password: (manual process required)');

  } catch (error) {
    console.log('❌ Unexpected error:', error);
  }
}

checkUsers(); 