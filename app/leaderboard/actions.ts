'use server'

import { createClient } from '@/utils/supabase/server'
import { calculateBetScore } from '@/utils/scoring'

export type LeaderboardUser = {
    id: string
    username: string | null
    full_name: string | null
    email: string | null
    points: number | null
    calculatedPoints: number
    racesCompleted: number
}

export async function getLeaderboard(): Promise<LeaderboardUser[]> {
    const supabase = await createClient()

    // 1. Fetch all profiles (excluding admin users)
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, email, points')
        .neq('role', 'admin')
        .order('points', { ascending: false })

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return []
    }

    // 2. Fetch all finished races and their results
    const { data: results, error: resultsError } = await supabase
        .from('race_results')
        .select('*')

    if (resultsError) {
        console.error('Error fetching results:', resultsError)
        return profiles as unknown as LeaderboardUser[] || []
    }

    // 3. Fetch all bets for these finished races
    const raceIds = results.map(r => r.race_id)
    let bets: any[] = []

    if (raceIds.length > 0) {
        const { data: betsData, error: betsError } = await supabase
            .from('bets')
            .select('*')
            .in('race_id', raceIds)

        if (betsError) {
            console.error('Error fetching bets:', betsError)
        } else {
            bets = betsData || []
        }
    }

    // 4. Calculate total points dynamically
    const leaderboard = profiles.map(profile => {
        const userBets = bets.filter(b => b.user_id === profile.id)
        let totalScore = 0
        let racesCompleted = 0

        userBets.forEach(bet => {
            const raceResult = results.find(r => r.race_id === bet.race_id)
            if (raceResult) {
                totalScore += calculateBetScore(bet, raceResult)
                racesCompleted++
            }
        })

        return {
            ...profile,
            calculatedPoints: totalScore,
            racesCompleted
        }
    })

    // Sort by calculated points
    return leaderboard.sort((a, b) => b.calculatedPoints - a.calculatedPoints) as LeaderboardUser[]
}
