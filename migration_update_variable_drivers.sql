-- Garantir que todos os pilotos citados existam na tabela
INSERT INTO drivers (name, team, code)
SELECT d.name, d.team, d.code
FROM (VALUES
  ('Sergio Pérez', 'Red Bull Racing', 'PER'),
  ('Arvid Lindblad', 'RB', 'LIN'),
  ('Franco Colapinto', 'Williams', 'COL'),
  ('Valtteri Bottas', 'Kick Sauber', 'BOT')
) AS d(name, team, code)
WHERE NOT EXISTS (
    SELECT 1 FROM drivers WHERE name = d.name OR name ILIKE '%' || split_part(d.name, ' ', 2) || '%'
);

-- Remover os pilotos que não estão na lista de 2026 enviada (Yuki Tsunoda e Jack Doohan)
DELETE FROM drivers WHERE name IN ('Yuki Tsunoda', 'Jack Doohan');

-- Atualizar piloto variável (Catapulta/Variable) para 2026
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Norris%' LIMIT 1) WHERE name ILIKE '%Australian Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Verstappen%' LIMIT 1) WHERE name ILIKE '%Chinese Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Bortoleto%' LIMIT 1) WHERE name ILIKE '%Japanese Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Hadjar%' LIMIT 1) WHERE name ILIKE '%Bahrain Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Gasly%' LIMIT 1) WHERE name ILIKE '%Saudi Arabian Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Perez%' OR name ILIKE '%Pérez%' LIMIT 1) WHERE name ILIKE '%Miami Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Antonelli%' LIMIT 1) WHERE name ILIKE '%Canadian Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Alonso%' LIMIT 1) WHERE name ILIKE '%Monaco Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Leclerc%' LIMIT 1) WHERE name ILIKE '%Barcelona-Catalunya%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Stroll%' LIMIT 1) WHERE name ILIKE '%Austrian Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Albon%' LIMIT 1) WHERE name ILIKE '%British Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Hulkenberg%' OR name ILIKE '%Hülkenberg%' LIMIT 1) WHERE name ILIKE '%Belgian Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Lawson%' LIMIT 1) WHERE name ILIKE '%Hungarian Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Ocon%' LIMIT 1) WHERE name ILIKE '%Dutch Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Lindblad%' LIMIT 1) WHERE name ILIKE '%Italian Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Colapinto%' LIMIT 1) WHERE name ILIKE '%Spanish Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Hamilton%' LIMIT 1) WHERE name ILIKE '%Azerbaijan Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Sainz%' LIMIT 1) WHERE name ILIKE '%Singapore Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Russell%' LIMIT 1) WHERE name ILIKE '%United States Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Bottas%' LIMIT 1) WHERE name ILIKE '%Mexico City Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Piastri%' LIMIT 1) WHERE name ILIKE '%São Paulo%' OR name ILIKE '%Sao Paulo%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Bearman%' LIMIT 1) WHERE name ILIKE '%Las Vegas Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Norris%' LIMIT 1) WHERE name ILIKE '%Qatar Grand Prix%';
UPDATE races SET variable_driver_id = (SELECT id FROM drivers WHERE name ILIKE '%Verstappen%' LIMIT 1) WHERE name ILIKE '%Abu Dhabi Grand Prix%';
