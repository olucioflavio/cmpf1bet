'use client'

import { useState } from 'react'
import { Calendar, Info, Settings, Trophy, ChevronDown, ChevronUp, RefreshCw, BarChart3, LayoutDashboard } from 'lucide-react'
import { updateRaceStatus, setVariableDriver, resetRaceToAutoStatus } from './actions'
import { calculateRaceStatus, calculateAutoStatus, getRaceBettingInfo } from '@/utils/raceStatus'

interface AdminRaceListProps {
    initialRaces: any[]
    drivers: any[]
}

export default function AdminRaceList({
    initialRaces,
    drivers
}: AdminRaceListProps) {
    const [expandedRace, setExpandedRace] = useState<number | null>(null)

    const toggleRace = (id: number) => {
        setExpandedRace(expandedRace === id ? null : id)
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Desktop View (Table) - Hidden on mobile */}
            <div className="hidden lg:block overflow-hidden rounded-2xl glass-panel">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="p-4 font-bold text-gray-300">Corrida</th>
                            <th className="p-4 font-bold text-gray-300">Data</th>
                            <th className="p-4 font-bold text-gray-300">Status Auto</th>
                            <th className="p-4 font-bold text-gray-300">Status Manual</th>
                            <th className="p-4 font-bold text-gray-300">Piloto da Rodada</th>
                            <th className="p-4 font-bold text-gray-300">Resultados</th>
                            <th className="p-4 font-bold text-gray-300">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialRaces.map(race => {
                            const autoStatus = calculateAutoStatus(race.date)
                            const bettingInfo = getRaceBettingInfo(race.date)
                            const isManualOverride = race.status !== 'scheduled' && race.status !== autoStatus

                            return (
                                <tr key={race.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-white">
                                        {race.name}
                                        {race.is_test_race && (
                                            <span className="ml-2 text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-bold">
                                                TESTE
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(race.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase w-fit shadow-sm ${autoStatus === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                                autoStatus === 'closed' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                                    autoStatus === 'finished' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/20' :
                                                        'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                {autoStatus}
                                            </span>
                                            {autoStatus === 'scheduled' && (
                                                <span className="text-[9px] text-gray-500 font-mono">
                                                    Início: {bettingInfo.openingDate.toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase w-fit shadow-sm ${race.status === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                                race.status === 'finished' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/20' :
                                                    race.status === 'closed' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                                        'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                                }`}>
                                                {race.status}
                                            </span>
                                            {isManualOverride && (
                                                <span className="text-[9px] text-orange-400 font-black tracking-widest uppercase">
                                                    ⚠️ Manual
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <select
                                                defaultValue={race.variable_driver_id || ''}
                                                onChange={async (e) => {
                                                    await setVariableDriver(race.id, parseInt(e.target.value))
                                                }}
                                                className="bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-white outline-none focus:border-f1-red/50 transition-colors w-full max-w-[140px]"
                                            >
                                                <option value="">Nenhum</option>
                                                {drivers.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <a
                                            href={`/admin/results/${race.id}`}
                                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-300 inline-block transition-colors"
                                        >
                                            Definir
                                        </a>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-1">
                                                <button onClick={() => updateRaceStatus(race.id, 'open')} className="bg-green-600 hover:bg-green-700 p-1.5 rounded-lg transition-transform active:scale-95" title="Aberto">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                </button>
                                                <button onClick={() => updateRaceStatus(race.id, 'closed')} className="bg-red-600 hover:bg-red-700 p-1.5 rounded-lg transition-transform active:scale-95" title="Fechado">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                </button>
                                                <button onClick={() => updateRaceStatus(race.id, 'finished')} className="bg-gray-600 hover:bg-gray-700 p-1.5 rounded-lg transition-transform active:scale-95" title="Finalizado">
                                                    <Trophy size={12} className="text-white" />
                                                </button>
                                                {isManualOverride && (
                                                    <button onClick={() => resetRaceToAutoStatus(race.id)} className="bg-blue-600 hover:bg-blue-700 p-1.5 rounded-lg transition-transform active:scale-95" title="Reset Auto">
                                                        <RefreshCw size={12} className="text-white" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Cards) - Shown only on mobile */}
            <div className="lg:hidden flex flex-col gap-4">
                {initialRaces.map(race => {
                    const autoStatus = calculateAutoStatus(race.date)
                    const isManualOverride = race.status !== 'scheduled' && race.status !== autoStatus
                    const isExpanded = expandedRace === race.id

                    return (
                        <div key={race.id} className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                            {/* Card Header (Always visible) */}
                            <div
                                className="p-4 flex justify-between items-center cursor-pointer active:bg-white/5"
                                onClick={() => toggleRace(race.id)}
                            >
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white text-base leading-tight">
                                            {race.name}
                                        </h3>
                                        {race.is_test_race && (
                                            <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded font-black uppercase">
                                                Test
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {new Date(race.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase shadow-sm ${race.status === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                        race.status === 'finished' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/20' :
                                            race.status === 'closed' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                                'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                                        }`}>
                                        {race.status}
                                    </span>
                                    {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                                </div>
                            </div>

                            {/* Card Content (Expandable) */}
                            {isExpanded && (
                                <div className="p-4 pt-0 border-t border-white/5 bg-white/5 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        {/* Status Info */}
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-1.5">
                                                <Info size={10} /> Status Auto
                                            </span>
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase w-fit ${autoStatus === 'open' ? 'text-green-400' :
                                                autoStatus === 'closed' ? 'text-red-400' :
                                                    autoStatus === 'finished' ? 'text-gray-500' :
                                                        'text-blue-400'
                                                }`}>
                                                {autoStatus}
                                            </span>
                                            {isManualOverride && (
                                                <span className="text-[9px] text-orange-400 font-black tracking-widest uppercase mt-0.5">
                                                    ⚠️ Manual
                                                </span>
                                            )}
                                        </div>

                                        {/* Results Link */}
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-1.5">
                                                <Trophy size={10} /> Resultados
                                            </span>
                                            <a
                                                href={`/admin/results/${race.id}`}
                                                className="bg-f1-red text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg text-center active:scale-95 transition-transform"
                                            >
                                                Definir
                                            </a>
                                        </div>

                                        {/* Pilot of the Round */}
                                        <div className="col-span-2 flex flex-col gap-1.5 mt-2">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-1.5">
                                                <Settings size={10} /> Piloto da Rodada
                                            </span>
                                            <select
                                                defaultValue={race.variable_driver_id || ''}
                                                onChange={async (e) => {
                                                    await setVariableDriver(race.id, parseInt(e.target.value))
                                                }}
                                                className="bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none w-full appearance-none"
                                            >
                                                <option value="">Nenhum selecionado</option>
                                                {drivers.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="col-span-2 flex flex-col gap-3 mt-4 border-t border-white/5 pt-4">
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                                Ações Manuais
                                            </span>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => updateRaceStatus(race.id, 'open')}
                                                    className="bg-green-600/20 text-green-400 border border-green-600/30 text-[10px] font-bold uppercase py-3 rounded-xl active:bg-green-600 active:text-white transition-all flex flex-col items-center gap-1"
                                                >
                                                    Abrir
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                </button>
                                                <button
                                                    onClick={() => updateRaceStatus(race.id, 'closed')}
                                                    className="bg-red-600/20 text-red-400 border border-red-600/30 text-[10px] font-bold uppercase py-3 rounded-xl active:bg-red-600 active:text-white transition-all flex flex-col items-center gap-1"
                                                >
                                                    Fechar
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                </button>
                                                <button
                                                    onClick={() => updateRaceStatus(race.id, 'finished')}
                                                    className="bg-gray-600/20 text-gray-400 border border-gray-600/30 text-[10px] font-bold uppercase py-3 rounded-xl active:bg-gray-600 active:text-white transition-all flex flex-col items-center gap-1"
                                                >
                                                    Finalizar
                                                    <Trophy size={12} />
                                                </button>
                                            </div>
                                            {isManualOverride && (
                                                <button
                                                    onClick={() => resetRaceToAutoStatus(race.id)}
                                                    className="bg-blue-600/20 text-blue-400 border border-blue-600/30 text-[10px] font-black uppercase py-3 rounded-xl active:bg-blue-600 active:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <RefreshCw size={14} />
                                                    Resetar Automático
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
