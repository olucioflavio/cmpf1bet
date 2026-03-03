import { createAdminClient } from '@/utils/supabase/admin'
import { calculateRaceStatus } from '@/utils/raceStatus'
import Link from 'next/link'
import { ArrowLeftIcon, CheckCircle2, XCircle, Clock, Trophy } from 'lucide-react'

export default async function BetsSummaryPage() {
    const supabase = createAdminClient()

    // Fetch all races and find the open one(s)
    const { data: races } = await supabase
        .from('races')
        .select('*, variable_driver:drivers!variable_driver_id(id, name, code)')
        .order('date', { ascending: true })

    // Find races with effective status "open"
    const openRaces = (races || []).filter(race => {
        const effectiveStatus = calculateRaceStatus(race.date, race.status)
        return effectiveStatus === 'open'
    })

    // Use the first open race, or show a message
    const currentRace = openRaces[0]

    if (!currentRace) {
        return (
            <div className="flex-1 w-full max-w-6xl mx-auto p-4 flex flex-col gap-6">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Resumo de Apostas</h1>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
                    <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-yellow-400 mb-2">Nenhuma corrida aberta</h2>
                    <p className="text-gray-400">Não há corridas com apostas abertas no momento.</p>
                </div>
            </div>
        )
    }

    // Fetch all non-admin profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'admin')
        .order('username')

    // Fetch all bets for the current open race
    const { data: bets } = await supabase
        .from('bets')
        .select('*')
        .eq('race_id', currentRace.id)

    // Fetch all drivers for name mapping
    const { data: drivers } = await supabase
        .from('drivers')
        .select('id, name, code, team')

    const getDriverDisplay = (id: number | null) => {
        if (!id || !drivers) return '—'
        const d = drivers.find(d => d.id === id)
        return d ? `${d.name} (${d.code})` : '—'
    }

    const getDriverCode = (id: number | null) => {
        if (!id || !drivers) return '—'
        const d = drivers.find(d => d.id === id)
        return d?.code || '—'
    }

    // Separate who bet and who didn't
    const allProfiles = profiles || []
    const allBets = bets || []

    const usersWhoBet = allProfiles
        .filter(p => allBets.some(b => b.user_id === p.id))
        .map(p => {
            const bet = allBets.find(b => b.user_id === p.id)!
            return { profile: p, bet }
        })
        .sort((a, b) => new Date(a.bet.created_at).getTime() - new Date(b.bet.created_at).getTime())

    const usersWhoDidntBet = allProfiles.filter(
        p => !allBets.some(b => b.user_id === p.id)
    )

    const totalUsers = allProfiles.length
    const totalBets = usersWhoBet.length
    const totalMissing = usersWhoDidntBet.length
    const betPercentage = totalUsers > 0 ? Math.round((totalBets / totalUsers) * 100) : 0

    const formatDateTime = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">Resumo de Apostas</h1>
                    <p className="text-gray-400 text-sm mt-1">Corrida aberta atual</p>
                </div>
            </div>

            {/* Race Info Card */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-6 h-6 text-green-400" />
                            <h2 className="text-2xl font-bold text-white">{currentRace.name}</h2>
                            <span className="px-3 py-1 rounded-full text-xs uppercase font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                🟢 Aberta
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            📍 {currentRace.track} • 📅 {new Date(currentRace.date).toLocaleDateString('pt-BR', {
                                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                            })}
                        </p>
                        {currentRace.variable_driver && (
                            <p className="text-gray-400 text-sm mt-1">
                                🎯 Piloto da Rodada: <span className="text-blue-400 font-medium">{currentRace.variable_driver.name} ({currentRace.variable_driver.code})</span>
                            </p>
                        )}
                    </div>

                    {/* Stats Summary */}
                    <div className="flex gap-4">
                        <div className="bg-white/5 rounded-xl p-4 text-center min-w-[100px]">
                            <div className="text-3xl font-bold text-green-400">{totalBets}</div>
                            <div className="text-xs text-gray-400 mt-1">Apostaram</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center min-w-[100px]">
                            <div className="text-3xl font-bold text-red-400">{totalMissing}</div>
                            <div className="text-xs text-gray-400 mt-1">Faltam</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center min-w-[100px]">
                            <div className="text-3xl font-bold text-blue-400">{betPercentage}%</div>
                            <div className="text-xs text-gray-400 mt-1">Completo</div>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${betPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Who didn't bet - Sidebar */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl overflow-hidden">
                        <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-400" />
                            <h3 className="text-lg font-bold text-red-400">
                                Ainda não apostaram ({totalMissing})
                            </h3>
                        </div>
                        <div className="p-4">
                            {usersWhoDidntBet.length === 0 ? (
                                <div className="text-center py-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                                    <p className="text-green-400 font-medium">Todos apostaram! 🎉</p>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {usersWhoDidntBet.map(profile => (
                                        <li
                                            key={profile.id}
                                            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-sm font-bold uppercase">
                                                {(profile.username || profile.email || '?')[0]}
                                            </div>
                                            <div>
                                                <span className="text-white font-medium text-sm">
                                                    {profile.username || profile.full_name || profile.email}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Who bet - Main content */}
                <div className="lg:col-span-2 order-1 lg:order-2">
                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl overflow-hidden">
                        <div className="bg-green-500/10 p-4 border-b border-green-500/20 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <h3 className="text-lg font-bold text-green-400">
                                Já apostaram ({totalBets})
                            </h3>
                        </div>

                        {usersWhoBet.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Clock className="w-10 h-10 mx-auto mb-2 text-gray-600" />
                                <p>Nenhuma aposta registrada ainda.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs md:text-sm text-left">
                                    <thead className="bg-white/5 text-gray-400">
                                        <tr>
                                            <th className="p-3">Usuário</th>
                                            <th className="p-3">Data/Hora</th>
                                            <th className="p-3">Pole</th>
                                            <th className="p-3">P1</th>
                                            <th className="p-3">P2</th>
                                            <th className="p-3">P3</th>
                                            <th className="p-3">P4</th>
                                            <th className="p-3">P5</th>
                                            <th className="p-3">Bortoleto</th>
                                            <th className="p-3">da Rodada</th>
                                            <th className="p-3">🚀</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {usersWhoBet.map(({ profile, bet }) => (
                                            <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold uppercase">
                                                            {(profile.username || profile.email || '?')[0]}
                                                        </div>
                                                        <span className="font-medium text-white whitespace-nowrap">
                                                            {profile.username || profile.full_name || profile.email}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-gray-400 whitespace-nowrap">
                                                    {formatDateTime(bet.created_at)}
                                                </td>
                                                <td className="p-3 text-yellow-400 font-medium">{getDriverCode(bet.pole_driver_id)}</td>
                                                <td className="p-3 text-white">{getDriverCode(bet.p1_driver_id)}</td>
                                                <td className="p-3 text-white">{getDriverCode(bet.p2_driver_id)}</td>
                                                <td className="p-3 text-white">{getDriverCode(bet.p3_driver_id)}</td>
                                                <td className="p-3 text-white">{getDriverCode(bet.p4_driver_id)}</td>
                                                <td className="p-3 text-white">{getDriverCode(bet.p5_driver_id)}</td>
                                                <td className="p-3 text-cyan-400">{bet.bortoleto_pos ?? '—'}</td>
                                                <td className="p-3 text-purple-400">{bet.variable_driver_pos ?? '—'}</td>
                                                <td className="p-3">
                                                    {bet.catapulta ? (
                                                        <span className="text-orange-400 font-bold" title="Catapulta ativada">🚀</span>
                                                    ) : (
                                                        <span className="text-gray-600">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* If there are multiple open races, show a note */}
            {openRaces.length > 1 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-400">
                    ℹ️ Existem {openRaces.length} corridas abertas. Mostrando: <strong>{currentRace.name}</strong>.
                    Outras abertas: {openRaces.filter(r => r.id !== currentRace.id).map(r => r.name).join(', ')}.
                </div>
            )}
        </div>
    )
}
