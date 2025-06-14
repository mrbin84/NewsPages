import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const newsDirectory = path.join(process.cwd(), 'data', 'news');

// Helper function to get a single article
async function getArticle(id: string) {
  const filePath = path.join(newsDirectory, `${id}.json`);
  try {
    await fs.access(filePath);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const article = JSON.parse(fileContent);
    return article;
  } catch (error) {
    return null;
  }
}

// GET handler for a single article
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const article = await getArticle(params.id);
    if (!article) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    console.error('Error in GET /api/articles/[id]:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler to update an article
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();
    const filePath = path.join(newsDirectory, `${params.id}.json`);

    const existingArticle = await getArticle(params.id);
    if (!existingArticle) {
        return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    const updatedArticle = {
      ...existingArticle,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(filePath, JSON.stringify(updatedArticle, null, 2));

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error in PUT /api/articles/[id]:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
