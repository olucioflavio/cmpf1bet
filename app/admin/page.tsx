import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminRaceList from './AdminRaceList'
import { BarChart3, LayoutDashboard, Info, Trophy } from 'lucide-react'
import { calculateRaceStatus, calculateAutoStatus, getRaceBettingInfo } from '@/utils/raceStatus'

export default async function AdminPage(props: {
    searchParams: Promise<{ success?: string }>
}) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return <div className="p-10 text-center text-white">Ops! Acesso restrito apenas para administradores.</div>
    }

    const { data: races } = await supabase.from('races').select('*').order('date', { ascending: true })
    const { data: drivers } = await supabase.from('drivers').select('*').order('name')

    return (
        <div className="flex-1 w-full flex flex-col items-center py-6 md:py-10 px-4 md:px-8">
            <div className="w-full max-w-7xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">

                {/* Header Responsivo */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 text-f1-red font-black uppercase tracking-widest text-[10px] mb-2">
                            <LayoutDashboard size={14} /> Painel de Controle
                        </div>
                        <h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-bold tracking-tighter text-white leading-none">
                            Gestão de Corridas
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm">Controle de status, pilotos e resultados da temporada.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <a href="/admin/bets-summary" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold transition-all active:scale-95 text-xs uppercase tracking-wider">
                            <BarChart3 size={16} className="text-green-500" /> Resumo
                        </a>
                        <a href="/admin/dashboard" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-f1-red hover:bg-red-700 text-white rounded-2xl font-bold font-f1 transition-all active:scale-95 text-xs uppercase tracking-wider shadow-lg shadow-red-900/20">
                            Dashboard
                        </a>
                    </div>
                </header>

                {searchParams.success === 'results_saved' && (
                    <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                        <Trophy size={20} />
                        <span className="font-bold text-sm">Resultados salvos com sucesso!</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Info - Desktop Only or top centered in mobile as Info Card */}
                    <div className="lg:col-span-1 flex flex-col gap-4 order-2 lg:order-1">
                        <div className="glass-panel rounded-3xl p-6 border border-blue-500/20 bg-blue-500/5">
                            <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-4 flex items-center gap-2">
                                <Info size={14} /> Guia de Status
                            </h3>
                            <ul className="space-y-4 text-xs">
                                <li className="flex gap-3">
                                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></span>
                                    <p className="text-gray-300 leading-relaxed"><strong className="text-white block mb-0.5">Automático:</strong> Abre 5 dias antes e fecha sexta 23:59.</p>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-1"></span>
                                    <p className="text-gray-300 leading-relaxed"><strong className="text-white block mb-0.5">Manual:</strong> Sobrescreve o cálculo de data.</p>
                                </li>
                                <li className="flex gap-3">
                                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-1"></span>
                                    <p className="text-gray-300 leading-relaxed"><strong className="text-white block mb-0.5">Reset Auto:</strong> Volta a seguir o calendário oficial.</p>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content - List of Races */}
                    <div className="lg:col-span-3 order-1 lg:order-2">
                        <AdminRaceList
                            initialRaces={races || []}
                            drivers={drivers || []}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
