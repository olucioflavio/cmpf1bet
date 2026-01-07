'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData): Promise<void> {
    const supabase = createAdminClient()
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
        return
    }

    const email = `${username}@cmpf1bet.local`

    // 1. Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'user' } // Default role
    })

    if (authError) {
        console.error('Error creating auth user:', authError)
        return
    }

    if (!authData.user) {
        return
    }

    // 2. Create profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: authData.user.id,
            username: username,
            role: 'user',
            points: 0
        })

    if (profileError) {
        console.error('Error creating profile:', profileError)
    }

    revalidatePath('/admin/users')
}

export async function deleteUser(userId: string): Promise<void> {
    const supabase = createAdminClient()

    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Error deleting user:', error)
    }

    revalidatePath('/admin/users')
}

// --- Race Management Actions ---

export async function updateRaceStatus(raceId: number, status: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('races')
        .update({ status })
        .eq('id', raceId)

    if (error) {
        console.error('Error updating race status:', error)
    }

    revalidatePath('/admin')
}

export async function setVariableDriver(raceId: number, driverId: number): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('races')
        .update({ variable_driver_id: driverId || null })
        .eq('id', raceId)

    if (error) {
        console.error('Error setting variable driver:', error)
    }

    revalidatePath('/admin')
}
