import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // 먼저 현재 조회수를 가져옴
    const { data: currentArticle, error: fetchError } = await supabase
      .from('articles')
      .select('view_count')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current view count:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch current view count' },
        { status: 500 }
      );
    }

    // 조회수 증가
    const newViewCount = (currentArticle?.view_count || 0) + 1;
    const { error } = await supabase
      .from('articles')
      .update({ view_count: newViewCount })
      .eq('id', id);

    if (error) {
      console.error('Error updating view count:', error);
      return NextResponse.json(
        { error: 'Failed to update view count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in view count API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}