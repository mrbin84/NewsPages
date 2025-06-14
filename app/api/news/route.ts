import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';

const NEWS_DIR = path.join(process.cwd(), 'data', 'news');

// Ensure the news directory exists
async function ensureNewsDirectory() {
  try {
    await fs.mkdir(NEWS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating news directory:', error);
    throw new Error('Failed to create news directory');
  }
}

// GET: 모든 뉴스 가져오기
export async function GET() {
  try {
    // Create data directory if it doesn't exist
    await ensureNewsDirectory();

    // Initialize with empty array
    let articles = [];

    try {
      // Read all files in the news directory
      const files = await fs.readdir(NEWS_DIR);
      
      if (files.length > 0) {
        const articlePromises = files
          .filter(file => file.endsWith('.json'))
          .map(async file => {
            try {
              const filePath = path.join(NEWS_DIR, file);
              const content = await fs.readFile(filePath, 'utf-8');
              const article = JSON.parse(content);
              
              // Validate article structure
              if (!article.id || !article.title || !article.content || !article.createdAt) {
                console.error(`Invalid article structure in file ${file}`);
                return null;
              }
              
              return article;
            } catch (error) {
              console.error(`Error reading file ${file}:`, error);
              return null;
            }
          });

        articles = (await Promise.all(articlePromises)).filter(article => article !== null);
      }
    } catch (error) {
      console.error('Error reading news directory:', error);
      // Continue with empty array if directory read fails
    }

    // Sort articles by creation date (newest first)
    articles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ news: articles });
  } catch (error) {
    console.error('Error in GET /api/news:', error);
    return NextResponse.json(
      { error: 'Failed to read news' },
      { status: 500 }
    );
  }
}

// PUT: 뉴스 데이터 업데이트
export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // data 디렉토리가 없으면 생성
    if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
      fs.mkdirSync(path.join(process.cwd(), 'data'));
    }

    // 데이터 저장
    fs.writeFileSync(path.join(process.cwd(), 'data', 'news.json'), JSON.stringify(data, null, 2));
    
    return NextResponse.json({ message: 'News data updated successfully' });
  } catch (error) {
    console.error('Error updating news data:', error);
    return NextResponse.json({ error: 'Failed to update news data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create data directory if it doesn't exist
    await ensureNewsDirectory();

    const id = Date.now().toString();
    const article = {
      id,
      title,
      content,
      createdAt: new Date().toISOString(),
    };

    try {
      const filePath = path.join(NEWS_DIR, `${id}.json`);
      await fs.writeFile(filePath, JSON.stringify(article, null, 2));
    } catch (error) {
      console.error('Error writing article file:', error);
      return NextResponse.json(
        { error: 'Failed to save article' },
        { status: 500 }
      );
    }

    return NextResponse.json({ news: [article] });
  } catch (error) {
    console.error('Error in POST /api/news:', error);
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    );
  }
} 