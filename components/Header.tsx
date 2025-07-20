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
    <Card className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container relative flex h-16 items-center">
        {/* Left Section: Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-[140px] h-[35px]">
              <Image src="/images/logo.png" alt="BizFocus Logo" fill sizes="140px" style={{ objectFit: 'contain' }} priority />
            </div>
          </Link>
        </div>

        {/* Center Section: Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium ml-8">
          <Link
            href="/"
            className={`transition-colors hover:text-coinreaders-blue ${
              isActive('/') ? 'text-coinreaders-blue font-semibold' : 'text-foreground/70'
            }`}
          >
            홈
          </Link>
          <Link
            href="/news"
            className={`transition-colors hover:text-coinreaders-blue ${
              isActive('/news') ? 'text-coinreaders-blue font-semibold' : 'text-foreground/70'
            }`}
          >
            전체기사
          </Link>
          <span className="text-foreground/70 cursor-pointer hover:text-coinreaders-blue">
            Breaking News
          </span>
          <span className="text-foreground/70 cursor-pointer hover:text-coinreaders-blue">
            많이 본 뉴스
          </span>
        </nav>

        {/* Right Section: Actions */}
        <div className="flex items-center justify-end ml-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {session && (
              <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="hidden md:flex items-center gap-2 bg-coinreaders-blue hover:bg-coinreaders-blue-dark text-white"
                    size="sm"
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
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-coinreaders-gray/50">
          <nav className="container py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-coinreaders-blue px-4 py-2 rounded ${
                  isActive('/') ? 'text-coinreaders-blue bg-white' : 'text-foreground/70'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                href="/news"
                className={`text-sm font-medium transition-colors hover:text-coinreaders-blue px-4 py-2 rounded ${
                  isActive('/news') ? 'text-coinreaders-blue bg-white' : 'text-foreground/70'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                전체기사
              </Link>
              <span className="text-sm font-medium text-foreground/70 px-4 py-2 rounded hover:text-coinreaders-blue cursor-pointer">
                Breaking News
              </span>
              <span className="text-sm font-medium text-foreground/70 px-4 py-2 rounded hover:text-coinreaders-blue cursor-pointer">
                많이 본 뉴스
              </span>

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                <div className="px-4">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">관리</span>
                </div>
                {session && (
                  <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-coinreaders-blue hover:bg-coinreaders-blue-dark text-white mx-4"
                        size="sm"
                        onClick={() => setIsMenuOpen(false)}
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
                <div className="mx-4" onClick={() => setIsMenuOpen(false)}>
                  <AuthButton />
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </Card>
  );
};

export default Header; 