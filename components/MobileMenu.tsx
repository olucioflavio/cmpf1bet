'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, LayoutDashboard, Trophy, Newspaper, User } from 'lucide-react'

interface MobileMenuProps {
    user: any
    profile: any
    signOutAction: any
}

export default function MobileMenu({ user, profile, signOutAction }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <div className="md:hidden">
            <button
                onClick={toggleMenu}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-gray-950 border-b border-gray-800 z-50 animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col p-4 gap-4">
                        <Link
                            href="/leaderboard"
                            onClick={toggleMenu}
                            className="flex items-center gap-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <Trophy size={18} />
                            <span>Classificação</span>
                        </Link>
                        <Link
                            href="/news"
                            onClick={toggleMenu}
                            className="flex items-center gap-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <Newspaper size={18} />
                            <span>Notícias F1</span>
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    href="/my-performance"
                                    onClick={toggleMenu}
                                    className="flex items-center gap-3 text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <User size={18} />
                                    <span>Meu Desempenho</span>
                                </Link>

                                {profile?.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        onClick={toggleMenu}
                                        className="flex items-center gap-3 text-green-400 hover:text-green-300 font-bold p-2 rounded-lg hover:bg-green-400/5 transition-colors"
                                    >
                                        <LayoutDashboard size={18} />
                                        <span>ADMIN</span>
                                    </Link>
                                )}

                                <div className="border-t border-gray-800 my-2 pt-4">
                                    <p className="text-xs text-gray-500 mb-4 px-2 truncate">
                                        Logado como: {profile?.full_name || profile?.username || user.email}
                                    </p>
                                    <form action={signOutAction}>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition py-3 rounded-xl text-white font-bold uppercase tracking-wider"
                                        >
                                            <LogOut size={18} />
                                            Sair
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                onClick={toggleMenu}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition py-3 rounded-xl text-white font-bold uppercase tracking-wider"
                            >
                                Entrar
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
