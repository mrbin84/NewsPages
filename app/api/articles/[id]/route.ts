import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { extractFirstImageUrl } from '@/lib/data';

export const dynamic = 'force-dynamic';

// GET a single article by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error code for 'No rows found'
        return NextResponse.json({ message: 'Article not found' }, { status: 404 });
      }
      console.error('Error fetching article from Supabase:', error);
      throw new Error(error.message);
    }

    if (!article) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error(`Error in GET /api/articles/${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT (update) a single article by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    // 콘텐츠에서 첫 번째 이미지를 추출하여 썸네일로 설정
    const thumbnail = extractFirstImageUrl(content);

    const { data, error } = await supabase
      .from('articles')
      .update({ title, content, thumbnail, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating article in Supabase:', error);
      throw new Error(error.message);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in PUT /api/articles/${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE a single article by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting article from Supabase:', error);
      throw new Error(error.message);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`Error in DELETE /api/articles/${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
