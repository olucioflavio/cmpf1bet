'use server'

import { createClient } from '@/utils/supabase/server'
import { calculateBetScore } from '@/utils/scoring'
import { redirect } from 'next/navigation'

export async function getUserPerformance() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch all finished races and their results
    const { data: results, error: resultsError } = await supabase
        .from('race_results')
        .select('*, races(*)')
        .order('created_at', { ascending: false }) // Most recent first

    if (resultsError) {
        console.error('Error fetching results:', resultsError)
        return []
    }

    if (!results || results.length === 0) {
        return []
    }

    // 2. Fetch user bets for these races
    const resultRaceIds = results.map(r => r.race_id)
    const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .in('race_id', resultRaceIds)

    if (betsError) {
        console.error('Error fetching bets:', betsError)
        return []
    }

    // 3. Combine data
    const performance = results.map(result => {
        const bet = bets?.find(b => b.race_id === result.race_id)
        const score = bet ? calculateBetScore(bet, result) : 0

        // Calculate detailed breakdown
        const breakdown = {
            pole: bet?.pole_driver_id && bet.pole_driver_id.toString() === result.pole_driver_id?.toString(),
            p1: bet?.p1_driver_id && bet.p1_driver_id.toString() === result.p1_driver_id?.toString(),
            p2: bet?.p2_driver_id && bet.p2_driver_id.toString() === result.p2_driver_id?.toString(),
            p3: bet?.p3_driver_id && bet.p3_driver_id.toString() === result.p3_driver_id?.toString(),
            p4: bet?.p4_driver_id && bet.p4_driver_id.toString() === result.p4_driver_id?.toString(),
            p5: bet?.p5_driver_id && bet.p5_driver_id.toString() === result.p5_driver_id?.toString(),
            bortoleto: bet?.bortoleto_pos && bet.bortoleto_pos.toString() === result.bortoleto_pos?.toString(),
            variable: bet?.variable_driver_pos && bet.variable_driver_pos.toString() === result.variable_driver_pos?.toString(),
        }

        // Check for bonus (all top 5 correct)
        const top5AllCorrect = breakdown.p1 && breakdown.p2 && breakdown.p3 && breakdown.p4 && breakdown.p5;

        return {
            race: result.races,
            result,
            bet,
            score,
            breakdown,
            bonus: top5AllCorrect
        }
    })

    return performance
}
