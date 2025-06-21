import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // 1 hour

// GET all articles
export async function GET() {
  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, created_at, updated_at, content')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching articles from Supabase:', error);
      throw new Error(error.message);
    }

    const processedArticles = articles.map(article => {
      let thumbnail = null;
      let summary = '';

      if (article.content) {
        const imgMatch = article.content.match(/<img[^>]+src="([^" >]+)"/);
        thumbnail = imgMatch ? imgMatch[1] : null;
        summary = article.content.replace(/<[^>]*>/g, '').substring(0, 150);
      }
      
      return {
        id: article.id,
        title: article.title,
        created_at: article.created_at,
        updated_at: article.updated_at,
        thumbnail,
        summary,
      };
    });

    return NextResponse.json(processedArticles);
  } catch (error) {
    console.error('Error in GET /api/articles:', error);
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

    const newArticle = {
      title,
      content,
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
