'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createUser(formData: FormData) {
    const supabase = createAdminClient()
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    if (!username || !password) {
        // return { error: 'Username and password are required' }
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
        // return { error: authError.message }
        return
    }

    if (!authData.user) {
        // return { error: 'User creation failed' }
        return
    }

    // 2. Create profile (sometimes triggers handle this, but explicit is safer if trigger missing)
    // We'll use upsert just in case a trigger already ran
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
        // Cleanup auth user if profile fails? 
        // For now, let's just report error. Auth user exists though.
        // return { error: 'User created but profile failed: ' + profileError.message }
    }

    revalidatePath('/admin/users')
    // return { success: `User ${username} created successfully` }
}

export async function deleteUser(userId: string) {
    const supabase = createAdminClient()

    // 1. Delete from Auth (Cascade should handle profile if set up, but let's see)
    // Usually deleting from auth.users cascades to profiles if FK is correct.
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
        console.error('Error deleting user:', error)
        // return { error: error.message }
    }

    revalidatePath('/admin/users')
    // return { success: 'User deleted' }
}

// --- Race Management Actions (Restored) ---

export async function updateRaceStatus(raceId: number, status: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('races')
        .update({ status })
        .eq('id', raceId)

    if (error) {
        console.error('Error updating race status:', error)
        // return { error: error.message } // Cannot return object to form action in strict mode
    }

    revalidatePath('/admin')
}

export async function setVariableDriver(raceId: number, driverId: number) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('races')
        .update({ variable_driver_id: driverId || null })
        .eq('id', raceId)

    if (error) {
        console.error('Error setting variable driver:', error)
        // return { error: error.message }
    }

    revalidatePath('/admin')
}
