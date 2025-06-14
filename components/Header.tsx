'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Moon, Sun, Search, Menu, LogIn, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Editor } from './Editor';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { data: session, status } = useSession();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // 실제 다크모드 토글 로직 추가 필요
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Card className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* 로고 */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="relative w-[130px] h-[33px]">
            <Image
              src="/images/logo.png"
              alt="NewsRead Logo"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </Link>

        {/* 메인 네비게이션 */}
        <nav className="hidden lg:flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/') ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            홈
          </Link>
          <Link
            href="/news"
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/news') ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            뉴스
          </Link>
          <Link
            href="/market"
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/market') ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            시장동향
          </Link>
          <Link
            href="/analysis"
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/analysis') ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            분석
          </Link>
          <Link
            href="/community"
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/community') ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            커뮤니티
          </Link>
        </nav>

        {/* 햄버거 메뉴 버튼 */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center space-x-4">
          {/* 검색 버튼 */}
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>

          {/* 다크모드 토글 */}
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* 로그인/로그아웃 버튼 */}
          <div className="flex items-center gap-4">
            {session && (
              <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden lg:flex items-center gap-2"
                  >
                    기사 작성
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-y-auto">
                  <DialogTitle className="sr-only">기사 작성</DialogTitle>
                  <Editor onSaveSuccess={() => setIsEditorOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
            {status === 'authenticated' && session ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/login')}
                className="flex items-center gap-2"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="lg:hidden border-t">
          <nav className="container py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-sm font-medium transition-colors hover:text-foreground/80"
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                href="/news"
                className="text-sm font-medium transition-colors hover:text-foreground/80"
                onClick={() => setIsMenuOpen(false)}
              >
                뉴스
              </Link>
              <Link
                href="/market"
                className="text-sm font-medium transition-colors hover:text-foreground/80"
                onClick={() => setIsMenuOpen(false)}
              >
                시장동향
              </Link>
              <Link
                href="/analysis"
                className="text-sm font-medium transition-colors hover:text-foreground/80"
                onClick={() => setIsMenuOpen(false)}
              >
                분석
              </Link>
              <Link
                href="/community"
                className="text-sm font-medium transition-colors hover:text-foreground/80"
                onClick={() => setIsMenuOpen(false)}
              >
                커뮤니티
              </Link>
              <div className="flex flex-col gap-4">
                {session && (
                  <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        기사 작성
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0">
                      <DialogTitle className="sr-only">기사 작성</DialogTitle>
                      <Editor onSaveSuccess={() => setIsEditorOpen(false)} />
                    </DialogContent>
                  </Dialog>
                )}
                {status === 'authenticated' && session ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push('/login');
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
    </Card>
  );
};

export default Header; 