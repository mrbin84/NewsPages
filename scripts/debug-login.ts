// scripts/debug-login.ts
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Login Debug Analysis');
console.log('=======================');

// 환경 변수 체크
console.log('\n📋 1. Environment Variables Check');
console.log('---------------------------------');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl) {
  console.error('\n❌ Cannot proceed without Supabase URL');
  process.exit(1);
}

async function debugLogin() {
  try {
    // 2. Service Role Key 테스트
    console.log('\n🔑 2. Service Role Key Test');
    console.log('---------------------------');
    
    if (supabaseServiceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey);
      
      try {
        const { data: testData, error: serviceError } = await supabaseAdmin
          .from('users')
          .select('id, email')
          .limit(1);

        if (serviceError) {
          console.log('❌ Service Role Key INVALID:', serviceError.message);
          console.log('   This is causing the login failure!');
        } else {
          console.log('✅ Service Role Key is valid');
          console.log(`   Found ${testData?.length || 0} users`);
        }
      } catch (err: any) {
        console.log('❌ Service Role Key error:', err.message);
      }
    }

    // 3. Anon Key로 사용자 확인
    console.log('\n👥 3. User Data Check (Anon Key)');
    console.log('--------------------------------');
    
    if (supabaseAnonKey) {
      const supabase = createClient(supabaseUrl!, supabaseAnonKey);
      
      const { data: users, error: anonError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', 'admin@bizfocus.com');

      if (anonError) {
        console.log('❌ Anon key error:', anonError.message);
      } else {
        console.log(`✅ Found ${users?.length || 0} users with email admin@bizfocus.com`);
        if (users && users.length > 0) {
          users.forEach(user => {
            console.log(`   - ${user.email} (${user.name})`);
          });
        }
      }
    }

    // 4. Service Role Key로 사용자 생성 시도
    console.log('\n🛠️  4. Direct User Creation with Service Role');
    console.log('---------------------------------------------');
    
    if (supabaseServiceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey);
      
      // 기존 사용자 확인
      try {
        const { data: existingUser, error: checkError } = await supabaseAdmin
          .from('users')
          .select('email')
          .eq('email', 'admin@bizfocus.com')
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.log('❌ Cannot check existing users:', checkError.message);
        } else if (existingUser) {
          console.log('✅ User admin@bizfocus.com already exists');
        } else {
          console.log('ℹ️  User admin@bizfocus.com does not exist, creating...');
          
          // 사용자 생성 시도
          const hashedPassword = await bcrypt.hash('admin1234', 10);
          
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert([{
              email: 'admin@bizfocus.com',
              name: 'BizFocus Admin',
              password: hashedPassword
            }])
            .select();

          if (createError) {
            console.log('❌ Failed to create user:', createError.message);
          } else {
            console.log('✅ User created successfully!');
            console.log('   User data:', newUser);
          }
        }
      } catch (err: any) {
        console.log('❌ User creation error:', err.message);
      }
    }

    // 5. 비밀번호 검증 테스트
    console.log('\n🔐 5. Password Verification Test');
    console.log('--------------------------------');
    
    if (supabaseServiceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey);
      
      try {
        const { data: user, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('password')
          .eq('email', 'admin@bizfocus.com')
          .single();

        if (fetchError) {
          console.log('❌ Cannot fetch user password:', fetchError.message);
        } else if (user) {
          const isValidPassword = await bcrypt.compare('admin1234', user.password);
          console.log(`Password validation: ${isValidPassword ? '✅ Correct' : '❌ Incorrect'}`);
        }
      } catch (err: any) {
        console.log('❌ Password check error:', err.message);
      }
    }

  } catch (error: any) {
    console.error('💥 Debug error:', error.message);
  }

  console.log('\n=======================');
  console.log('🏁 Debug analysis completed');
  console.log('\n💡 Next Steps:');
  console.log('   1. Fix the Service Role Key in .env.local');
  console.log('   2. Restart the development server');
  console.log('   3. Try logging in again');
}

debugLogin();