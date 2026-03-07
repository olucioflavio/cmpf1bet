'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitRaceResults(formData: FormData): Promise<void> {
    const supabase = createAdminClient()

    const raceId = parseInt(formData.get('raceId') as string)
    const getVal = (name: string) => {
        const val = formData.get(name)
        return (val === "" || val === null) ? null : val
    }

    const resultsData = {
        race_id: raceId,
        pole_driver_id: getVal('pole'),
        p1_driver_id: getVal('p1'),
        p2_driver_id: getVal('p2'),
        p3_driver_id: getVal('p3'),
        p4_driver_id: getVal('p4'),
        p5_driver_id: getVal('p5'),
        bortoleto_pos: getVal('bortoleto'),
        variable_driver_pos: getVal('variable')
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
