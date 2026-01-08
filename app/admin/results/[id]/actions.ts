'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitRaceResults(formData: FormData): Promise<void> {
    const supabase = createAdminClient()

    const raceId = parseInt(formData.get('raceId') as string)
    const pole = formData.get('pole')
    const p1 = formData.get('p1')
    const p2 = formData.get('p2')
    const p3 = formData.get('p3')
    const p4 = formData.get('p4')
    const p5 = formData.get('p5')
    const bortoleto = formData.get('bortoleto')
    const variable = formData.get('variable')

    const resultsData = {
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

    // Check if results already exist
    const { data: existingResults } = await supabase
        .from('race_results')
        .select('id')
        .eq('race_id', raceId)
        .single()

    let error
    if (existingResults) {
        // Update existing results
        const { error: updateError } = await supabase
            .from('race_results')
            .update(resultsData)
            .eq('id', existingResults.id)
        error = updateError
    } else {
        // Insert new results
        const { error: insertError } = await supabase
            .from('race_results')
            .insert(resultsData)
        error = insertError
    }

    if (error) {
        console.error('Error saving results:', error)
        redirect(`/admin/results/${raceId}?error=${encodeURIComponent('Erro ao salvar resultados')}`)
    }

    // Update race status to finished
    await supabase
        .from('races')
        .update({ status: 'finished' })
        .eq('id', raceId)

    revalidatePath('/admin')
    redirect(`/admin?success=results_saved`)
}
