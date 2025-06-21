import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Optimize image with sharp
    const optimizedBuffer = await sharp(inputBuffer)
      .resize({ width: 800, withoutEnlargement: true }) // Max width 800px, don't enlarge
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toBuffer();

    const fileName = `${uuidv4()}.webp`;
    const { data, error } = await supabase.storage
      .from('images') // Ensure you have a 'images' bucket in Supabase
      .upload(fileName, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      throw new Error('Failed to upload to storage.');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return NextResponse.json({ url: publicUrl });

  } catch (error) {
    console.error('Error in image upload API:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 