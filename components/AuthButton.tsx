'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';

export default function AuthButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline">{session.user?.name ?? 'User'}님</span>
        <Button onClick={() => signOut()}>로그아웃</Button>
      </div>
    );
  }

  return (
    <Button asChild>
      <Link href="/login">로그인</Link>
    </Button>
  );
}
