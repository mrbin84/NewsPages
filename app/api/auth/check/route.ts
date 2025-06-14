import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import type { NextRequest } from 'next/server';

const JWT_SECRET = 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ isAuthenticated: false });
    }

    try {
      verify(token, JWT_SECRET);
      return NextResponse.json({ isAuthenticated: true });
    } catch {
      return NextResponse.json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 