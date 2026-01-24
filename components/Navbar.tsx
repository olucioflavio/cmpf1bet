import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import Image from 'next/image'

export default async function Navbar() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let profile = null;
    if (user) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = data
        console.log('Navbar Debug:', {
            email: user.email,
            profileData: data,
            supabaseError: error
        })
    }

    return (
        <nav className="w-full flex justify-center border-b border-b-gray-800 h-16 bg-gray-950 text-white">
            <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
                <Link href="/">
                    <div className="relative h-10 w-32">
                        <Image
                            src="/logo.jpg"
                            alt="CPMF1 Bet"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>
                <div className="flex gap-4 items-center">
                    <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
                        Classificação
                    </Link>
                    <Link href="/news" className="text-gray-300 hover:text-white transition-colors">
                        Notícias F1
                    </Link>
                    {user ? (
                        <div className="flex gap-4 items-center">
                            <Link href="/my-performance" className="text-gray-300 hover:text-white transition-colors">
                                Meu Desempenho
                            </Link>
                            {profile?.role === 'admin' && (
                                <Link href="/admin" className="text-green-400 hover:text-green-300 font-bold">
                                    ADMIN
                                </Link>
                            )}
                            <span className="text-gray-400 hidden sm:block">
                                {profile?.full_name || profile?.username || user.email}
                            </span>
                            <form action={signOut}>
                                <button className="bg-red-600 hover:bg-red-700 transition px-3 py-1 rounded text-white text-xs font-medium uppercase tracking-wider">
                                    Sair
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-blue-600 hover:bg-blue-700 transition px-3 py-1 rounded text-white text-xs font-medium uppercase tracking-wider"
                        >
                            Entrar
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
