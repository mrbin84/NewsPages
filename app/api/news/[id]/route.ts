import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'news', `${params.id}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const article = JSON.parse(fileContent);

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error reading article:', error);
    return NextResponse.json(
      { error: '기사를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'data', 'news', `${params.id}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const article = JSON.parse(fileContent);

    const updatedArticle = {
      ...article,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(filePath, JSON.stringify(updatedArticle, null, 2));

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: '기사 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
} 