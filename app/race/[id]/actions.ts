'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitRaceBet(formData: FormData): Promise<void> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const raceId = parseInt(formData.get('raceId') as string)
    const pole = formData.get('pole')
    const p1 = formData.get('p1')
    const p2 = formData.get('p2')
    const p3 = formData.get('p3')
    const p4 = formData.get('p4')
    const p5 = formData.get('p5')
    const bortoleto = formData.get('bortoleto')
    const variable = formData.get('variable')

    const betData = {
        user_id: user.id,
        race_id: raceId,
        pole_driver_id: pole,
        p1_driver_id: p1,
        p2_driver_id: p2,
        p3_driver_id: p3,
        p4_driver_id: p4,
        p5_driver_id: p5,
        bortoleto_pos: bortoleto,
        variable_driver_pos: variable
    }

    // Check if bet exists
    const { data: existingBet } = await supabase
        .from('bets')
        .select('id')
        .eq('user_id', user.id)
        .eq('race_id', raceId)
        .single()

    let error
    if (existingBet) {
        const { error: updateError } = await supabase
            .from('bets')
            .update(betData)
            .eq('id', existingBet.id)
        error = updateError
    } else {
        const { error: insertError } = await supabase
            .from('bets')
            .insert(betData)
        error = insertError
    }

    if (error) {
        console.error('Error placing bet:', error)
    }

    revalidatePath(`/race/${raceId}`)
}
