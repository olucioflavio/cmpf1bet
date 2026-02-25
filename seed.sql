-- Drivers Seed
-- Enable pgcrypto for password hashing
create extension if not exists pgcrypto;

-- Create default admin user if not exists
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@cmpf1bet.local') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@cmpf1bet.local',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now()
    );

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, username, role)
    VALUES (new_user_id, 'admin', 'admin');
  END IF;
END $$;

-- Drivers Seed (Idempotent)
INSERT INTO drivers (name, team, code)
SELECT d.name, d.team, d.code
FROM (VALUES
  ('Max Verstappen', 'Red Bull Racing', 'VER'),
  ('Liam Lawson', 'Red Bull Racing', 'LAW'),
  ('George Russell', 'Mercedes', 'RUS'),
  ('Andrea Kimi Antonelli', 'Mercedes', 'ANT'),
  ('Charles Leclerc', 'Ferrari', 'LEC'),
  ('Lewis Hamilton', 'Ferrari', 'HAM'),
  ('Lando Norris', 'McLaren', 'NOR'),
  ('Oscar Piastri', 'McLaren', 'PIA'),
  ('Fernando Alonso', 'Aston Martin', 'ALO'),
  ('Lance Stroll', 'Aston Martin', 'STR'),
  ('Pierre Gasly', 'Alpine', 'GAS'),
  ('Jack Doohan', 'Alpine', 'DOO'),
  ('Alexander Albon', 'Williams', 'ALB'),
  ('Carlos Sainz', 'Williams', 'SAI'),
  ('Yuki Tsunoda', 'RB', 'TSU'),
  ('Isack Hadjar', 'RB', 'HAD'),
  ('Nico Hulkenberg', 'Kick Sauber', 'HUL'),
  ('Gabriel Bortoleto', 'Kick Sauber', 'BOR'),
  ('Esteban Ocon', 'Haas', 'OCO'),
  ('Oliver Bearman', 'Haas', 'BEA')
) AS d(name, team, code)
WHERE NOT EXISTS (
    SELECT 1 FROM drivers WHERE name = d.name
);

-- Races Seed (2026 Official) - Idempotent
INSERT INTO races (name, date, track, status, is_test_race)
SELECT r.name, r.date::timestamptz, r.track, r.status, r.is_test_race
FROM (VALUES
  ('Bahrain Pre-Season Test 1', '2026-02-13 12:00:00+00', 'Bahrain International Circuit', 'scheduled', true),
  ('Bahrain Pre-Season Test 2', '2026-02-20 12:00:00+00', 'Bahrain International Circuit', 'scheduled', true),
  ('Australian Grand Prix', '2026-03-08 05:00:00+00', 'Albert Park Circuit', 'scheduled', false),
  ('Chinese Grand Prix', '2026-03-15 07:00:00+00', 'Shanghai International Circuit', 'scheduled', false),
  ('Japanese Grand Prix', '2026-03-29 05:00:00+00', 'Suzuka International Racing Course', 'scheduled', false),
  ('Bahrain Grand Prix', '2026-04-12 15:00:00+00', 'Bahrain International Circuit', 'scheduled', false),
  ('Saudi Arabian Grand Prix', '2026-04-19 17:00:00+00', 'Jeddah Corniche Circuit', 'scheduled', false),
  ('Miami Grand Prix', '2026-05-03 20:00:00+00', 'Miami International Autodrome', 'scheduled', false),
  ('Canadian Grand Prix', '2026-05-24 18:00:00+00', 'Circuit Gilles Villeneuve', 'scheduled', false),
  ('Monaco Grand Prix', '2026-06-07 13:00:00+00', 'Circuit de Monaco', 'scheduled', false),
  ('Gran Premio de Barcelona-Catalunya', '2026-06-14 13:00:00+00', 'Circuit de Barcelona-Catalunya', 'scheduled', false),
  ('Austrian Grand Prix', '2026-06-28 13:00:00+00', 'Red Bull Ring', 'scheduled', false),
  ('British Grand Prix', '2026-07-05 14:00:00+00', 'Silverstone Circuit', 'scheduled', false),
  ('Belgian Grand Prix', '2026-07-19 13:00:00+00', 'Circuit de Spa-Francorchamps', 'scheduled', false),
  ('Hungarian Grand Prix', '2026-07-26 13:00:00+00', 'Hungaroring', 'scheduled', false),
  ('Dutch Grand Prix', '2026-08-23 13:00:00+00', 'Zandvoort Circuit', 'scheduled', false),
  ('Italian Grand Prix', '2026-09-06 13:00:00+00', 'Monza Circuit', 'scheduled', false),
  ('Spanish Grand Prix', '2026-09-13 13:00:00+00', 'IFEMA Madrid Circuit', 'scheduled', false),
  ('Azerbaijan Grand Prix', '2026-09-26 11:00:00+00', 'Baku City Circuit', 'scheduled', false),
  ('Singapore Grand Prix', '2026-10-11 12:00:00+00', 'Marina Bay Street Circuit', 'scheduled', false),
  ('United States Grand Prix', '2026-10-25 19:00:00+00', 'Circuit of the Americas', 'scheduled', false),
  ('Mexico City Grand Prix', '2026-11-01 20:00:00+00', 'Autódromo Hermanos Rodríguez', 'scheduled', false),
  ('São Paulo Grand Prix', '2026-11-08 17:00:00+00', 'Interlagos Circuit', 'scheduled', false),
  ('Las Vegas Grand Prix', '2026-11-21 06:00:00+00', 'Las Vegas Strip Circuit', 'scheduled', false),
  ('Qatar Grand Prix', '2026-11-29 17:00:00+00', 'Lusail International Circuit', 'scheduled', false),
  ('Abu Dhabi Grand Prix', '2026-12-06 13:00:00+00', 'Yas Marina Circuit', 'scheduled', false)
) AS r(name, date, track, status, is_test_race)
WHERE NOT EXISTS (
    SELECT 1 FROM races WHERE name = r.name
);
