-- articles 테이블에 view_count 컬럼 추가
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 기존 기사들의 view_count를 0으로 초기화 (이미 DEFAULT 0이지만 명시적으로)
UPDATE articles SET view_count = 0 WHERE view_count IS NULL;