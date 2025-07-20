import dotenv from 'dotenv';

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

console.log('🔍 Environment Variables Check');
console.log('==============================');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('KEY') || varName.includes('SECRET') ? '***SET***' : value}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allGood = false;
  }
});

console.log('\n==============================');
if (allGood) {
  console.log('🎉 All environment variables are set!');
} else {
  console.log('⚠️  Some environment variables are missing. Please check your .env.local file.');
  process.exit(1);
} 