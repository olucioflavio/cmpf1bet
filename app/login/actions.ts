'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    let email = formData.get('email') as string
    const password = formData.get('password') as string

    // Mapping for admin user
    if (email === 'admin') {
        console.log('Mapping "admin" user to admin@cmpf1bet.local')
        email = 'admin@cmpf1bet.local'
    }

    console.log(`Attempting login for: ${email}`)

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        return redirect('/login?message=Could not authenticate user')
    }

    console.log('Login successful')
    revalidatePath('/', 'layout')
    return redirect('/')
}

export async function signup(formData: FormData) {
    // Public signup is disabled
    return redirect('/login?message=Sign up is disabled')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}
