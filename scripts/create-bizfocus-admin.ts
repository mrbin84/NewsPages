// scripts/create-bizfocus-admin.ts
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBizFocusAdmin() {
  console.log('🔧 Creating BizFocus Admin Account');
  console.log('==================================');

  const adminData = {
    email: 'admin@bizfocus.com',
    name: 'BizFocus Admin',
    password: 'admin1234'
  };

  try {
    // 1. 비밀번호 해싱
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    console.log('✅ Password hashed successfully');

    // 2. SQL INSERT 구문 생성 및 출력
    console.log('\n📝 Generated SQL INSERT Statement:');
    console.log('==================================');
    
    const sqlInsert = `INSERT INTO public.users (email, name, password, created_at) 
VALUES (
  '${adminData.email}',
  '${adminData.name}',
  '${hashedPassword}',
  NOW()
);`;

    console.log(sqlInsert);

    // 3. Supabase를 통한 삽입 시도
    console.log('\n🚀 Attempting to insert via Supabase client...');
    console.log('================================================');

    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword
      }])
      .select();

    if (error) {
      console.error('❌ Supabase insert failed:', error.message);
      console.log('💡 You can use the SQL statement above in Supabase SQL Editor');
      
      if (error.message.includes('row-level security')) {
        console.log('\n🔒 RLS Policy Issue:');
        console.log('   The table has Row Level Security enabled.');
        console.log('   Use the SQL Editor in Supabase Dashboard with the statement above.');
      }
    } else {
      console.log('✅ User created successfully via Supabase!');
      console.log('📊 Created user:', data);
    }

    // 4. 대안 생성 구문들
    console.log('\n📋 Alternative Creation Methods:');
    console.log('================================');
    
    console.log('\n1️⃣ Direct SQL (Supabase SQL Editor):');
    console.log('-------------------------------------');
    console.log(sqlInsert);

    console.log('\n2️⃣ With UUID (if needed):');
    console.log('-------------------------');
    console.log(`INSERT INTO public.users (id, email, name, password, created_at) 
VALUES (
  gen_random_uuid(),
  '${adminData.email}',
  '${adminData.name}',
  '${hashedPassword}',
  NOW()
);`);

    console.log('\n3️⃣ Multiple Admin Accounts:');
    console.log('---------------------------');
    const additionalUsers = [
      { email: 'editor@bizfocus.com', name: 'BizFocus Editor' },
      { email: 'writer@bizfocus.com', name: 'BizFocus Writer' }
    ];

    for (const user of additionalUsers) {
      const hash = await bcrypt.hash('admin1234', 10);
      console.log(`INSERT INTO public.users (email, name, password, created_at) 
VALUES ('${user.email}', '${user.name}', '${hash}', NOW());`);
    }

  } catch (error: any) {
    console.error('💥 Error:', error.message);
  }

  console.log('\n==================================');
  console.log('🏁 Admin creation script completed');
  console.log('\n💡 Next Steps:');
  console.log('   1. Copy the SQL statement above');
  console.log('   2. Go to Supabase Dashboard > SQL Editor');
  console.log('   3. Paste and execute the SQL');
  console.log('   4. Try logging in with admin@bizfocus.com / admin1234');
}

createBizFocusAdmin();