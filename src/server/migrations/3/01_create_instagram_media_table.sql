-- =====================================================
-- Create Instagram Media Tracking Table
-- =====================================================
-- Purpose: Track synced Instagram photos and prevent duplicates
-- without relying on UploadThing API queries or in-memory storage
-- Run: Execute this migration to create the instagram_media table

BEGIN;

-- =====================================================
-- CREATE INSTAGRAM_MEDIA TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS instagram_media (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Instagram identifiers
    instagram_media_id TEXT NOT NULL UNIQUE,
    instagram_permalink TEXT,

    -- Media metadata
    media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO', 'CAROUSEL_ALBUM')),
    is_parent BOOLEAN NOT NULL DEFAULT true,
    parent_instagram_id TEXT, -- NULL for parent photos, populated for children

    -- UploadThing references
    uploadthing_file_key TEXT NOT NULL UNIQUE,
    uploadthing_url TEXT NOT NULL,

    -- Sync tracking
    synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    file_size_bytes INTEGER,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Fast lookup by Instagram media ID (primary duplicate check)
CREATE INDEX idx_instagram_media_instagram_id ON instagram_media(instagram_media_id);

-- Fast lookup by parent ID (for checking if children exist)
CREATE INDEX idx_instagram_media_parent_id ON instagram_media(parent_instagram_id)
    WHERE parent_instagram_id IS NOT NULL;

-- Fast lookup by UploadThing file key
CREATE INDEX idx_instagram_media_uploadthing_key ON instagram_media(uploadthing_file_key);

-- Filter by parent/child status
CREATE INDEX idx_instagram_media_is_parent ON instagram_media(is_parent);

-- Sort by sync date
CREATE INDEX idx_instagram_media_synced_at ON instagram_media(synced_at DESC);

-- =====================================================
-- CREATE UPDATE TRIGGER FOR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_instagram_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_instagram_media_updated_at
    BEFORE UPDATE ON instagram_media
    FOR EACH ROW
    EXECUTE FUNCTION update_instagram_media_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS (admin-only access via tRPC middleware)
ALTER TABLE instagram_media ENABLE ROW LEVEL SECURITY;

-- Allow admin access (Better Auth handles via adminProcedure)
CREATE POLICY "Admin can manage instagram media" ON instagram_media
    FOR ALL USING (true);

-- =====================================================
-- VALIDATION AND SUMMARY
-- =====================================================

DO $$
DECLARE
    table_exists BOOLEAN;
    index_count INTEGER;
BEGIN
    -- Verify table was created
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'instagram_media'
    ) INTO table_exists;

    IF NOT table_exists THEN
        RAISE EXCEPTION 'Failed to create instagram_media table';
    END IF;

    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = 'instagram_media';

    RAISE NOTICE '============================================';
    RAISE NOTICE 'INSTAGRAM MEDIA TABLE CREATED SUCCESSFULLY';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Table: instagram_media';
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Features:';
    RAISE NOTICE '✅ Tracks Instagram media IDs for duplicate prevention';
    RAISE NOTICE '✅ Stores UploadThing references for file management';
    RAISE NOTICE '✅ Supports parent/child relationships (carousels)';
    RAISE NOTICE '✅ Automatic timestamp updates';
    RAISE NOTICE '✅ Row-level security enabled';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update instagram.ts router to use database';
    RAISE NOTICE '2. Remove in-memory storedPhotos array';
    RAISE NOTICE '3. Refactor duplicate checking logic';
    RAISE NOTICE '============================================';
END $$;

COMMIT;
