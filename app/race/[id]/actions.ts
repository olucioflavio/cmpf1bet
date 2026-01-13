'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sendBetConfirmation } from '@/utils/email'

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
    let bortoleto = formData.get('bortoleto')
    const variable = formData.get('variable')

    // Validate no duplicate drivers in Top 5 ONLY (Pole can be anyone)
    const top5Drivers = [p1, p2, p3, p4, p5].filter(Boolean)
    const uniqueTop5 = new Set(top5Drivers)

    if (top5Drivers.length !== uniqueTop5.size) {
        redirect(`/race/${raceId}?error=${encodeURIComponent('Você não pode repetir pilotos nas posições 1 a 5!')}`)
    }

    // Server-side enforcement: If Bortoleto is in Top 5, force his position
    const { data: bortoletoDriver } = await supabase
        .from('drivers')
        .select('id')
        .ilike('name', '%Bortoleto%')
        .single()

    if (bortoletoDriver) {
        const bId = bortoletoDriver.id.toString()
        if (p1 === bId) bortoleto = '1'
        else if (p2 === bId) bortoleto = '2'
        else if (p3 === bId) bortoleto = '3'
        else if (p4 === bId) bortoleto = '4'
        else if (p5 === bId) bortoleto = '5'
    }

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

    // Insert or Update logic...
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
        redirect(`/race/${raceId}?error=${encodeURIComponent('Erro ao salvar aposta. Tente novamente.')}`)
    }

    // --- Send Confirmation Email ---
    // Fetch Race Details
    const { data: race } = await supabase.from('races').select('name, track').eq('id', raceId).single()

    // Fetch Drivers to map IDs to Names
    const { data: allDrivers } = await supabase.from('drivers').select('id, name, code')

    const getDriverName = (id: any) => {
        const d = allDrivers?.find(d => d.id.toString() === id?.toString())
        return d ? `${d.name} (${d.code})` : 'Desconhecido'
    }

    if (user.email && race) {
        console.log('Preparing to send bet confirmation email...')
        await sendBetConfirmation({
            email: user.email,
            userName: user.user_metadata?.username || user.email.split('@')[0],
            raceName: race.name,
            track: race.track,
            bets: {
                pole: getDriverName(pole),
                p1: getDriverName(p1),
                p2: getDriverName(p2),
                p3: getDriverName(p3),
                p4: getDriverName(p4),
                p5: getDriverName(p5),
                bortoleto: bortoleto as string,
                variable: variable as string,
                variableDriverName: 'Piloto Variável' // Could fetch specific name if needed but generic is fine for now
            }
        })
    }
    // -------------------------------

    revalidatePath(`/race/${raceId}`)
    redirect(`/race/${raceId}?success=true`)
}
