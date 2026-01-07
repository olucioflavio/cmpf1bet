-- Step 1: Delete all existing races and their bets (cascade)
DELETE FROM bets;
DELETE FROM races;

-- Step 2: Reset the sequence to start from 1
ALTER SEQUENCE races_id_seq RESTART WITH 1;

-- Step 3: Add is_test_race column if it doesn't exist
ALTER TABLE races ADD COLUMN IF NOT EXISTS is_test_race boolean DEFAULT false;

-- Step 4: Re-insert all races with proper IDs
INSERT INTO races (name, date, track, status, is_test_race)
VALUES
  -- TEST RACES (não contam pontos)
  ('Bahrain Grand Prix (Teste)', '2026-03-01 15:00:00+00', 'Bahrain International Circuit', 'scheduled', true),
  ('Saudi Arabian Grand Prix (Teste)', '2026-03-08 17:00:00+00', 'Jeddah Corniche Circuit', 'scheduled', true),
  
  -- TEMPORADA OFICIAL (começando da Austrália)
  ('Australian Grand Prix', '2026-03-22 05:00:00+00', 'Albert Park Circuit', 'scheduled', false),
  ('Japanese Grand Prix', '2026-04-05 05:00:00+00', 'Suzuka International Racing Course', 'scheduled', false),
  ('Chinese Grand Prix', '2026-04-19 07:00:00+00', 'Shanghai International Circuit', 'scheduled', false),
  ('Miami Grand Prix', '2026-05-03 20:00:00+00', 'Miami International Autodrome', 'scheduled', false),
  ('Emilia Romagna Grand Prix', '2026-05-17 13:00:00+00', 'Imola Circuit', 'scheduled', false),
  ('Monaco Grand Prix', '2026-05-24 13:00:00+00', 'Circuit de Monaco', 'scheduled', false),
  ('Spanish Grand Prix', '2026-06-07 13:00:00+00', 'Circuit de Barcelona-Catalunya', 'scheduled', false),
  ('Canadian Grand Prix', '2026-06-21 18:00:00+00', 'Circuit Gilles Villeneuve', 'scheduled', false),
  ('Austrian Grand Prix', '2026-07-05 13:00:00+00', 'Red Bull Ring', 'scheduled', false),
  ('British Grand Prix', '2026-07-19 14:00:00+00', 'Silverstone Circuit', 'scheduled', false),
  ('Belgian Grand Prix', '2026-08-02 13:00:00+00', 'Circuit de Spa-Francorchamps', 'scheduled', false),
  ('Hungarian Grand Prix', '2026-08-16 13:00:00+00', 'Hungaroring', 'scheduled', false),
  ('Dutch Grand Prix', '2026-08-30 13:00:00+00', 'Zandvoort Circuit', 'scheduled', false),
  ('Italian Grand Prix', '2026-09-06 13:00:00+00', 'Monza Circuit', 'scheduled', false),
  ('Azerbaijan Grand Prix', '2026-09-20 11:00:00+00', 'Baku City Circuit', 'scheduled', false),
  ('Singapore Grand Prix', '2026-10-04 12:00:00+00', 'Marina Bay Street Circuit', 'scheduled', false),
  ('United States Grand Prix', '2026-10-18 19:00:00+00', 'Circuit of the Americas', 'scheduled', false),
  ('Mexico City Grand Prix', '2026-10-25 20:00:00+00', 'Autódromo Hermanos Rodríguez', 'scheduled', false),
  ('São Paulo Grand Prix', '2026-11-08 17:00:00+00', 'Interlagos Circuit', 'scheduled', false),
  ('Las Vegas Grand Prix', '2026-11-21 06:00:00+00', 'Las Vegas Strip Circuit', 'scheduled', false),
  ('Qatar Grand Prix', '2026-11-29 17:00:00+00', 'Lusail International Circuit', 'scheduled', false),
  ('Abu Dhabi Grand Prix', '2026-12-06 13:00:00+00', 'Yas Marina Circuit', 'scheduled', false);

-- Verify
SELECT id, name, is_test_race FROM races ORDER BY id;
