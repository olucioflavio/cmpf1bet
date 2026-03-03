import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { signOut } from '@/app/login/actions'
import Image from 'next/image'
import MobileMenu from './MobileMenu'

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
        <nav className="w-full h-16 bg-gray-950 border-b border-gray-800 sticky top-0 z-50 text-white flex justify-center">
            <div className="w-full max-w-7xl flex justify-between items-center px-4 md:px-8">
                <Link href="/" className="flex items-center">
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

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 items-center text-sm font-medium">
                    <Link href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">
                        Classificação
                    </Link>
                    <Link href="/news" className="text-gray-400 hover:text-white transition-colors">
                        Notícias F1
                    </Link>
                    {user ? (
                        <div className="flex gap-6 items-center">
                            <Link href="/my-performance" className="text-gray-400 hover:text-white transition-colors">
                                Meu Desempenho
                            </Link>
                            {profile?.role === 'admin' && (
                                <Link href="/admin" className="text-green-400 hover:text-green-300 font-bold border border-green-400/20 px-3 py-1 rounded-full bg-green-400/5">
                                    ADMIN
                                </Link>
                            )}
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-800">
                                <span className="text-gray-400">
                                    {profile?.username || user.email?.split('@')[0]}
                                </span>
                                <form action={signOut}>
                                    <button className="text-gray-500 hover:text-white transition text-xs font-bold uppercase">
                                        Sair
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-f1-red hover:bg-red-700 transition px-4 py-2 rounded-lg text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-900/20"
                        >
                            Entrar
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <MobileMenu user={user} profile={profile} signOutAction={signOut} />
            </div>
        </nav>
    )
}
