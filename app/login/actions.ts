'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function login(formData: FormData): Promise<void> {
    const supabase = await createClient()

    let email = formData.get('email') as string
    const password = formData.get('password') as string


    // Check if input is username or email
    if (!email.includes('@')) {
        console.log(`Input appears to be a username: ${email}`)

        // Try to find email by username in profiles
        // We use admin client to ensure we can read all profiles/emails if RLS were restrictive (though profiles are usually public)
        // But profiles.email might not be public in some setups. Here it is part of profile.
        // Let's use createClient first as it's standard, but createAdminClient is safer for auth lookups.

        const adminSupabase = createAdminClient()
        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('email')
            .ilike('username', email) // Case insensitive lookup
            .single()

        if (profile?.email) {
            console.log(`Found email for username ${email}: ${profile.email}`)
            email = profile.email
        } else {
            console.log(`Username not found, trying legacy fallback...`)
            email = `${email}@cmpf1bet.local`
        }
    }

    console.log(`Attempting login for: ${email}`)

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        redirect('/login?message=Could not authenticate user')
    }

    console.log('Login successful')
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData): Promise<void> {
    // Public signup is disabled
    redirect('/login?message=Sign up is disabled')
}

export async function signOut(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
