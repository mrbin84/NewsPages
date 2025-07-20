'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-600 px-4">{session.user?.name ?? 'User'}님</span>
        <Button 
          onClick={() => signOut()} 
          variant="outline"
          className="text-sm"
        >
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <Button asChild variant="outline" className="text-sm">
      <Link href="/login">로그인</Link>
    </Button>
  );
}
