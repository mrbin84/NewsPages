'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Session } from 'next-auth';
import AuthButton from './AuthButton';
import dynamic from 'next/dynamic';

// Dynamically import the editor component to avoid pulling it into the main bundle.
// The editor will only be loaded when the 'Create Article' dialog is opened.
const NewArticleEditor = dynamic(
  () => import('./NewArticleEditor').then((mod) => mod.NewArticleEditor),
  {
    ssr: false, // The editor is client-side only and depends on browser APIs.
    loading: () => <div className="p-4 text-center">에디터를 불러오는 중...</div>,
  }
);

const Header = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <Card className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-14 items-center justify-between">
        {/* Left Section: Nav links (Desktop) / Hamburger (Mobile) */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium ml-4">
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
          </nav>
        </div>

        {/* Center Section: Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-[160px] h-[40px]">
              <Image src="/images/logo.png" alt="BizFocus Logo" fill sizes="160px" style={{ objectFit: 'contain' }} priority />
            </div>
          </Link>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
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
                <DialogContent className="max-w-4xl p-0" onInteractOutside={(e) => e.preventDefault()}>
                  <DialogTitle className="p-4 pb-0">새 기사 작성</DialogTitle>
                  <div className="p-4 pt-2">
                    {/* Render the editor only when the dialog is open to enable dynamic loading */}
                    {isEditorOpen && <NewArticleEditor onSaveSuccess={() => setIsEditorOpen(false)} />}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <AuthButton />
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="lg:hidden border-t">
          <nav className="container py-4">
            <div className="flex flex-col space-y-4 pl-4">
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

              <div className="flex flex-col gap-4" onClick={() => setIsMenuOpen(false)}>
                {session && (
                  <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        기사 작성
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0" onInteractOutside={(e) => e.preventDefault()}>
                      <DialogTitle className="p-4 pb-0">새 기사 작성</DialogTitle>
                      <div className="p-4 pt-2">
                        {isEditorOpen && <NewArticleEditor onSaveSuccess={() => setIsEditorOpen(false)} />}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <AuthButton />
              </div>
            </div>
          </nav>
        </div>
      )}
    </Card>
  );
};

export default Header; 