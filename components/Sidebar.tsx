'use client';

import { Card } from '@/components/ui/card';

// 임시 인기 뉴스 데이터
const popularNews = [
  {
    id: 1,
    title: '가상자산 시장 전망: 2024년 하반기 랠리 예상',
    views: '1.2K',
  },
  {
    id: 2,
    title: '메타버스와 NFT의 융합, 새로운 패러다임 제시',
    views: '980',
  },
  {
    id: 3,
    title: '디파이(DeFi) 시장 동향과 주요 프로젝트 분석',
    views: '850',
  },
  {
    id: 4,
    title: '중앙은행 디지털화폐(CBDC) 개발 현황',
    views: '720',
  },
  {
    id: 5,
    title: '크립토 규제 동향: 각국의 정책 비교',
    views: '650',
  },
];

const Sidebar = () => {
  return (
    <aside className="space-y-6">
      {/* 인기 뉴스 섹션 */}
      <Card className="p-4">
        <h2 className="text-lg font-bold mb-4">인기 뉴스</h2>
        <div className="space-y-4">
          {popularNews.map((news, index) => (
            <div key={news.id} className="flex gap-3">
              <span className="text-2xl font-bold text-muted-foreground min-w-[30px]">
                {index + 1}
              </span>
              <div>
                <h3 className="font-medium leading-snug hover:text-primary cursor-pointer">
                  {news.title}
                </h3>
                <span className="text-sm text-muted-foreground">
                  조회수 {news.views}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 광고 섹션 */}
      <Card className="p-4">
        <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground">Advertisement</span>
        </div>
      </Card>
    </aside>
  );
};

export default Sidebar; 