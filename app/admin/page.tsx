import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateRaceStatus, setVariableDriver, resetRaceToAutoStatus } from './actions'
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
        return <div className="p-10 text-center">Unauthorized. You are not an admin.</div>
    }

    const { data: races } = await supabase.from('races').select('*').order('date', { ascending: true })
    const { data: drivers } = await supabase.from('drivers').select('*').order('name')

    return (
        <div className="flex-1 w-full max-w-6xl p-4 flex flex-col gap-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <a href="/admin/dashboard" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
                        Ver Dashboard Completo
                    </a>
                </div>
            </div>

            {searchParams.success === 'results_saved' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    Resultados salvos com sucesso!
                </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <h3 className="text-blue-400 font-bold mb-2">ℹ️ Sistema de Status Automático</h3>
                <div className="text-sm text-gray-300 space-y-1">
                    <p>• <strong>Status Automático:</strong> Calculado baseado na data (abre 5 dias antes, fecha sexta 23:59)</p>
                    <p>• <strong>Status Manual:</strong> Definido manualmente pelo admin (sobrescreve o automático)</p>
                    <p>• <strong>⚠️ MANUAL:</strong> Indica que o status foi alterado manualmente</p>
                    <p>• <strong>🔄 Reset Auto:</strong> Remove override manual e volta para o status automático</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="p-3">Race</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status Automático</th>
                            <th className="p-3">Status Manual</th>
                            <th className="p-3">Variable Driver</th>
                            <th className="p-3">Resultados</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {races?.map(race => {
                            // Status automático puro (sempre calculado, ignora override)
                            const autoStatus = calculateAutoStatus(race.date)

                            // Status efetivo (respeita override manual)
                            const effectiveStatus = calculateRaceStatus(race.date, race.status)

                            const bettingInfo = getRaceBettingInfo(race.date)

                            // Há override manual se o status no banco for diferente de 'scheduled'
                            // E se for diferente do que seria calculado automaticamente
                            const isManualOverride = race.status !== 'scheduled' && race.status !== autoStatus

                            return (
                                <tr key={race.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                                    <td className="p-3 font-medium">{race.name}</td>
                                    <td className="p-3 text-sm text-gray-400">
                                        {new Date(race.date).toLocaleDateString()}
                                        {race.is_test_race && (
                                            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                                TESTE
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded text-xs uppercase w-fit ${autoStatus === 'open' ? 'bg-green-900 text-green-300' :
                                                autoStatus === 'closed' ? 'bg-red-900 text-red-300' :
                                                    autoStatus === 'finished' ? 'bg-gray-800 text-gray-500' :
                                                        'bg-blue-900 text-blue-300'
                                                }`}>
                                                {autoStatus === 'open' ? '🟢 Open' :
                                                    autoStatus === 'closed' ? '🔴 Closed' :
                                                        autoStatus === 'finished' ? '🏁 Finished' :
                                                            '🔵 Scheduled'}
                                            </span>
                                            {autoStatus === 'scheduled' && (
                                                <span className="text-[10px] text-gray-500">
                                                    Abre: {bettingInfo.openingDate.toLocaleDateString()}
                                                </span>
                                            )}
                                            {autoStatus === 'open' && (
                                                <span className="text-[10px] text-gray-500">
                                                    Fecha: {bettingInfo.closingDate.toLocaleDateString()} 23:59
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded text-xs uppercase w-fit ${race.status === 'open' ? 'bg-green-900 text-green-300' :
                                                race.status === 'finished' ? 'bg-gray-800 text-gray-500' :
                                                    race.status === 'closed' ? 'bg-red-900 text-red-300' :
                                                        'bg-blue-900 text-blue-300'
                                                }`}>
                                                {race.status}
                                            </span>
                                            {isManualOverride && (
                                                <span className="text-[10px] text-orange-400 font-bold">
                                                    ⚠️ MANUAL
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <form action={async (formData) => {
                                            'use server'
                                            await setVariableDriver(race.id, parseInt(formData.get('driverId') as string))
                                        }}>
                                            <select
                                                name="driverId"
                                                defaultValue={race.variable_driver_id || ''}
                                                className="bg-gray-900 border border-gray-700 rounded p-1 text-sm max-w-[150px]"
                                            >
                                                <option value="">None</option>
                                                {drivers?.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                            <button className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">Set</button>
                                        </form>
                                    </td>
                                    <td className="p-3">
                                        <a
                                            href={`/admin/results/${race.id}`}
                                            className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs inline-block"
                                        >
                                            Resultados
                                        </a>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <form action={updateRaceStatus.bind(null, race.id, 'open')}>
                                                    <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs" title="Forçar abertura manual">
                                                        Open
                                                    </button>
                                                </form>
                                                <form action={updateRaceStatus.bind(null, race.id, 'closed')}>
                                                    <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs" title="Forçar fechamento manual">
                                                        Close
                                                    </button>
                                                </form>
                                                <form action={updateRaceStatus.bind(null, race.id, 'finished')}>
                                                    <button className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-xs" title="Marcar como finalizada">
                                                        Finish
                                                    </button>
                                                </form>
                                            </div>
                                            {isManualOverride && (
                                                <form action={resetRaceToAutoStatus.bind(null, race.id)}>
                                                    <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs w-full" title="Resetar para status automático">
                                                        🔄 Reset Auto
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
