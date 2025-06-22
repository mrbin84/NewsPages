// scripts/create-user.ts
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// .env.local 파일 로딩을 디버깅하기 위해 로그를 추가합니다.
const configResult = dotenv.config({ path: '.env.local' });
console.log('--- Debugging .env.local ---');
if (configResult.error) {
  console.error('Error loading .env.local file:', configResult.error);
} else {
  console.log('.env.local file loaded successfully.');
  // For debugging, let's see what keys were parsed. Don't log the values for security.
  console.log('Parsed keys:', configResult.parsed ? Object.keys(configResult.parsed) : 'None');
}

console.log('\nReading process.env:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'NOT LOADED');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Loaded' : 'NOT LOADED');
console.log('---------------------------\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase URL or Service Role Key is not defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createUser(email: string, name: string, password: string) {
  if (!email || !name || !password) {
    console.error('Please provide email, name, and password.');
    return;
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, name, password: hashedPassword }])
      .select();

    if (error) {
      throw error;
    }

    console.log('User created successfully:', data);
  } catch (error: any) {
    console.error('Error creating user:', error.message);
  }
}

const [,, email, name, password] = process.argv;
createUser(email, name, password);
