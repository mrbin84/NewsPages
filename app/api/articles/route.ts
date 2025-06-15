import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

interface Article {
  id: string;
  title: string;
  content: string;
  author?: string | null;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

const newsDir = path.join(process.cwd(), 'data', 'news');

async function getArticles(): Promise<Article[]> {
  try {
    const files = await fs.readdir(newsDir);
    const articles = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
          const filePath = path.join(newsDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const article = JSON.parse(data) as Article;
          // Ensure createdAt is a Date object for sorting
          article.createdAt = new Date(article.createdAt);
          return article;
        })
    );
    // Sort articles by creation date, newest first
    const validArticles = articles.filter(Boolean).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return validArticles;
  } catch (error) {
    // If the directory doesn't exist, return an empty array
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function GET() {
  try {
    const articles = await getArticles();
    return NextResponse.json(articles, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const newArticle: Article = {
      id: crypto.randomUUID(),
      title,
      content,
      author: session.user?.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const filePath = path.join(newsDir, `${newArticle.id}.json`);
    await fs.mkdir(newsDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(newArticle, null, 2));

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const idsToDelete = Array.isArray(body.ids) ? body.ids : [body.id];

    if (!idsToDelete || idsToDelete.length === 0 || idsToDelete.some((id: string) => !id)) {
      return NextResponse.json({ error: 'Article ID(s) are required' }, { status: 400 });
    }

    await Promise.all(
      idsToDelete.map(async (id: string) => {
        const filePath = path.join(newsDir, `${id}.json`);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          // Ignore errors if file doesn't exist
          if (error instanceof Error && 'code' in error && error.code !== 'ENOENT') {
            throw error;
          }
        }
      })
    );

    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    console.error('Error deleting articles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
