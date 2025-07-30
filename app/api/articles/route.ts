import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { extractFirstImageUrl, getArticlePreviews, getMostViewedArticles } from '@/lib/data';

// GET articles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mostViewed = searchParams.get('mostViewed');
    const limit = parseInt(searchParams.get('limit') || '15');

    if (mostViewed === 'true') {
      const articles = await getMostViewedArticles(limit);
      return NextResponse.json(articles);
    } else {
      const articles = await getArticlePreviews(limit);
      return NextResponse.json(articles);
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new article
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

    // 콘텐츠에서 첫 번째 이미지를 추출하여 썸네일로 설정
    const thumbnail = extractFirstImageUrl(content);

    const newArticle = {
      title,
      content,
      thumbnail,
      author: session.user?.email,
    };

    const { data, error } = await supabase
      .from('articles')
      .insert([newArticle])
      .select()
      .single();

    if (error) {
      console.error('Error saving article to Supabase:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/articles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
