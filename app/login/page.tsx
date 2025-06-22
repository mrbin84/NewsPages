'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const errorMessages: { [key: string]: string } = {
  CredentialsSignin: '이메일 또는 비밀번호가 올바르지 않습니다.',
  Default: '로그인 중 알 수 없는 오류가 발생했습니다. 다시 시도해주세요.',
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 이전 페이지 URL을 가져옵니다
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam && errorMessages[errorParam]) {
      setError(errorMessages[errorParam]);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // NextAuth가 리디렉션을 처리하도록 합니다. 실패 시에는 에러 쿼리 파라미터와 함께
    // 이 페이지로 다시 돌아오며, 이 오류는 useEffect 훅에서 처리됩니다.
    await signIn('credentials', {
      email,
      password,
      callbackUrl, // 이전 페이지 URL로 리디렉션
    });

    // 리디렉션으로 인해 이 코드는 실패 시 도달하지 않을 수 있습니다.
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">
            뉴스 관리 시스템에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bizfocus.com"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 