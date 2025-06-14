import { NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';

// 실제 프로덕션에서는 환경 변수로 관리해야 합니다
const JWT_SECRET = 'your-secret-key';
const ADMIN_EMAIL = 'admin@newsread.com';
const ADMIN_PASSWORD = 'admin1234';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 관리자 인증
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // JWT 토큰 생성
      const token = sign({ email }, JWT_SECRET, { expiresIn: '1d' });

      // 응답 생성
      const response = NextResponse.json({ success: true });

      // 쿠키에 토큰 저장
      response.cookies.set({
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1일
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 