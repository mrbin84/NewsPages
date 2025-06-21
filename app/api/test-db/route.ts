import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// 이 GET 함수는 데이터베이스 연결을 테스트하기 위한 임시 API입니다.
export async function GET() {
  const testEmail = 'admin@bizfocus.com';

  // --- 새로운 디버깅 단계 ---
  // 앱이 실제로 어떤 환경 변수를 읽고 있는지 확인합니다.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log('--- .env.local 변수 확인 ---');
  console.log('앱이 사용 중인 Supabase URL:', supabaseUrl);
  console.log('-----------------------------');
  // --- 종료 ---

  if (!supabaseUrl) {
    return NextResponse.json(
      {
        status: '설정 오류',
        message: 'NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.',
      },
      { status: 500 },
    );
  }

  try {
    console.log(`[Test DB Route] DB에서 사용자 조회를 시도합니다: ${testEmail}`);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Test DB Route] Supabase에서 오류가 발생했습니다:', error);
      return NextResponse.json(
        {
          status: '오류 발생',
          message: '데이터베이스 조회 중 오류가 발생했습니다.',
          errorDetails: error,
        },
        { status: 500 },
      );
    }

    if (!user) {
      console.log('[Test DB Route] 사용자를 찾지 못했습니다.');
      return NextResponse.json(
        {
          status: '사용자 없음',
          message: `이메일 '${testEmail}'을(를) 가진 사용자를 DB에서 찾을 수 없습니다.`,
        },
        { status: 404 },
      );
    }

    console.log('[Test DB Route] 사용자를 성공적으로 찾았습니다:', user);
    // 중요: 실제 API에서는 절대 비밀번호 해시를 반환하면 안 됩니다. 이것은 디버깅 목적입니다.
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({
      status: '성공',
      message: '사용자를 성공적으로 찾았습니다.',
      user: userWithoutPassword,
    });
  } catch (e) {
    console.error('[Test DB Route] API 라우트에서 예기치 않은 오류 발생:', e);
    return NextResponse.json(
      {
        status: '오류 발생',
        message: 'API 라우트 실행 중 예기치 않은 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

