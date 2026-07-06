-- Migration 4/01: Add design intent columns to commissions
--
-- Adds the design choices captured by the commissions form (live 3D color
-- picker, fabric preset, and per-garment style options). All columns are
-- nullable so existing rows and older clients keep working.
--
-- color_hex       "#rrggbb" as chosen in the picker (true fabric color)
-- color_name      Curated swatch name, or "Custom" for free-picked colors
-- fabric          Fabric preset id (see src/lib/commission-design.ts)
-- design_options  JSONB map of style option group id -> selected value,
--                 validated server-side against the per-garment option tree

ALTER TABLE commissions
  ADD COLUMN IF NOT EXISTS color_hex VARCHAR(7),
  ADD COLUMN IF NOT EXISTS color_name VARCHAR(64),
  ADD COLUMN IF NOT EXISTS fabric VARCHAR(64),
  ADD COLUMN IF NOT EXISTS design_options JSONB;

-- Guard against junk hex values from any future writer that bypasses the app.
ALTER TABLE commissions
  DROP CONSTRAINT IF EXISTS commissions_color_hex_format;
ALTER TABLE commissions
  ADD CONSTRAINT commissions_color_hex_format
  CHECK (color_hex IS NULL OR color_hex ~* '^#[0-9a-f]{6}$');

-- Verification
DO $$
DECLARE
    missing INTEGER;
BEGIN
    SELECT 4 - COUNT(*) INTO missing
    FROM information_schema.columns
    WHERE table_name = 'commissions'
      AND column_name IN ('color_hex', 'color_name', 'fabric', 'design_options');

    IF missing > 0 THEN
        RAISE EXCEPTION 'Migration failed: % design column(s) missing', missing;
    END IF;

    RAISE NOTICE 'Design columns present on commissions table';
END $$;
