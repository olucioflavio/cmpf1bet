-- Allow viewing bets for finished races
-- This is necessary for the leaderboard/dashboard to show everyone's bets after the race
CREATE POLICY "Bets are viewable for finished races" 
ON bets FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM races r
    JOIN race_results rr ON rr.race_id = r.id
    WHERE r.id = race_id AND r.status = 'finished'
  )
  OR auth.uid() = user_id
);
