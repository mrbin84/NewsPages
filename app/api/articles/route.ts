import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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
