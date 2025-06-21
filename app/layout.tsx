import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getServerSession } from 'next-auth';
import Header from '@/components/Header';
import { Providers } from '@/components/Providers';
import { authOptions } from '@/lib/auth';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BizFocus",
  description: "뉴스 기사 작성 및 관리 시스템",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header session={session} />
            <main className="flex-1 container mx-auto py-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
