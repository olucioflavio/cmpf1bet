'use server'

import { createAdminClient } from '@/utils/supabase/admin'

export async function getAllBetsDetails() {
    const supabase = createAdminClient()

    // Fetch everything we need
    const { data: races } = await supabase.from('races').select('*').order('date', { ascending: false })
    const { data: profiles } = await supabase.from('profiles').select('*')
    const { data: bets } = await supabase.from('bets').select('*')
    const { data: results } = await supabase.from('race_results').select('*')
    const { data: drivers } = await supabase.from('drivers').select('*')

    // Return raw data to be processed by the frontend or helper
    return {
        races: races || [],
        profiles: profiles || [],
        bets: bets || [],
        results: results || [],
        drivers: drivers || []
    }
}
