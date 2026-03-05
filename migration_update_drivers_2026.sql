-- ============================================================
-- MIGRATION: Update drivers for 2026 season (22 drivers)
-- SAFE: No deletions. Updates existing + inserts new.
-- Existing bets are NOT affected (they reference driver IDs).
-- ============================================================

-- ============================
-- 1. UPDATE EXISTING DRIVERS
-- ============================

-- Jack Doohan replaced by Franco Colapinto at Alpine
UPDATE drivers
SET name = 'Franco Colapinto', code = 'COL'
WHERE name = 'Jack Doohan';

-- Isack Hadjar moved from RB to Red Bull Racing
UPDATE drivers
SET team = 'Red Bull Racing'
WHERE name = 'Isack Hadjar';

-- Liam Lawson moved from Red Bull Racing to Racing Bulls
UPDATE drivers
SET team = 'Racing Bulls'
WHERE name = 'Liam Lawson';

-- Kick Sauber rebranded to Audi
UPDATE drivers
SET team = 'Audi'
WHERE team = 'Kick Sauber';

-- McLaren rebranded to McLaren-Mercedes
UPDATE drivers
SET team = 'McLaren-Mercedes'
WHERE team = 'McLaren';

-- RB rebranded to Racing Bulls (for any remaining RB entries)
UPDATE drivers
SET team = 'Racing Bulls'
WHERE team = 'RB';

-- ============================
-- 2. INSERT NEW DRIVERS
-- ============================

DO $$
BEGIN
  -- Arvid Lindblad - new Racing Bulls driver
  IF NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Arvid Lindblad') THEN
    INSERT INTO drivers (name, team, code) VALUES ('Arvid Lindblad', 'Racing Bulls', 'LIN');
  END IF;

  -- Valtteri Bottas - Cadillac (new team)
  IF NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Valtteri Bottas') THEN
    INSERT INTO drivers (name, team, code) VALUES ('Valtteri Bottas', 'Cadillac', 'BOT');
  END IF;

  -- Sergio Pérez - Cadillac (new team)
  IF NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Sergio Pérez') THEN
    INSERT INTO drivers (name, team, code) VALUES ('Sergio Pérez', 'Cadillac', 'PER');
  END IF;
END $$;

-- ============================
-- 3. HANDLE YUKI TSUNODA
-- ============================
-- Tsunoda is no longer on the 2026 grid.
-- We do NOT delete him because existing bets may reference his ID.
-- If you want, you can mark him as inactive by adding a column:
-- ALTER TABLE drivers ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
-- UPDATE drivers SET active = false WHERE name = 'Yuki Tsunoda';

-- ============================
-- 4. VERIFICATION QUERY
-- ============================
-- Run this after the migration to verify all 22 drivers:
-- SELECT id, name, team, code FROM drivers ORDER BY team, name;
