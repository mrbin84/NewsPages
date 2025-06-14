'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Editor } from './Editor';
import { useToast } from '@/components/ui/use-toast';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { data: session, status } = useSession();


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
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center justify-end">
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
                <DialogContent className="max-w-4xl p-0">
                  <DialogTitle className="p-4 pb-0">새 기사 작성</DialogTitle>
                  <div className="p-4 pt-2">
                    <NewArticleEditor onSaveSuccess={() => setIsEditorOpen(false)} />
                  </div>
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
                      <DialogTitle className="p-4 pb-0">새 기사 작성</DialogTitle>
                      <div className="p-4 pt-2">
                        <NewArticleEditor onSaveSuccess={() => setIsEditorOpen(false)} />
                      </div>
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

const NewArticleEditor = ({ onSaveSuccess }: { onSaveSuccess: () => void }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: { title: string; content: string }) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save article');
      }

      toast({ title: '성공', description: '기사가 성공적으로 저장되었습니다.' });
      router.refresh();
      onSaveSuccess();
    } catch (error) {
      console.error('Save error:', error);
      const message = error instanceof Error ? error.message : '기사 저장 중 오류가 발생했습니다.';
      toast({
        title: '저장 실패',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Editor
      onSave={handleSave}
      isSaving={isSaving}
      onCancel={onSaveSuccess} // Close dialog on cancel
      saveButtonText="기사 저장"
    />
  );
};

export default Header; 