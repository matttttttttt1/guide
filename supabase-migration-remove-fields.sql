-- 기존 가이드 테이블에서 languages와 notes 컬럼 제거
-- 이미 guides 테이블이 있는 경우 이 마이그레이션을 실행하세요

-- languages 컬럼 제거
ALTER TABLE guides DROP COLUMN IF EXISTS languages;

-- notes 컬럼 제거
ALTER TABLE guides DROP COLUMN IF EXISTS notes;

-- profile_image_url을 photo_url로 이름 변경 (이미 변경되지 않은 경우)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'guides'
    AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE guides RENAME COLUMN profile_image_url TO photo_url;
  END IF;
END $$;
