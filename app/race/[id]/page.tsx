import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { submitRaceBet } from './actions'

export default async function RacePage(props: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ error?: string; success?: string }>
}) {
    const params = await props.params
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const raceId = parseInt(params.id)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch race, drivers, and existing bet
    const [raceResult, driversResult, betResult] = await Promise.all([
        supabase.from('races').select('*, variable_driver:drivers!variable_driver_id(*)').eq('id', raceId).single(),
        supabase.from('drivers').select('*').order('name'),
        supabase.from('bets').select('*').eq('race_id', raceId).eq('user_id', user.id).single()
    ])

    const race = raceResult.data
    const drivers = driversResult.data || []
    const userBet = betResult.data

    if (!race) return <div>Corrida não encontrada</div>

    const isClosed = race.status !== 'open'
    const variableDriver = race.variable_driver

    return (
        <div className="flex-1 w-full max-w-2xl p-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-bold">{race.name}</h1>
                <p className="text-gray-400">{new Date(race.date).toLocaleString()} @ {race.track}</p>
                <div className="mt-2">
                    Status: <span className={`uppercase font-bold ${race.status === 'open' ? 'text-green-500' : 'text-red-500'}`}>{race.status}</span>
                </div>
            </div>

            {race.is_test_race && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm font-semibold flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <span>Esta é uma <strong>corrida de teste</strong> e não contará pontos para a temporada oficial.</span>
                    </p>
                </div>
            )}

            {searchParams.success && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-400 text-sm font-semibold flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        <span><strong>Aposta realizada com sucesso!</strong></span>
                    </p>
                </div>
            )}

            {searchParams.error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm font-semibold flex items-center gap-2">
                        <span className="text-lg">❌</span>
                        <span>{decodeURIComponent(searchParams.error)}</span>
                    </p>
                </div>
            )}

            <form action={submitRaceBet} className="flex flex-col gap-6">
                <input type="hidden" name="raceId" value={raceId} />

                {/* Pole Position */}
                <div className="space-y-2">
                    <label className="text-lg font-semibold text-purple-400">Pole Position</label>
                    <select
                        name="pole"
                        defaultValue={userBet?.pole_driver_id || ''}
                        disabled={isClosed}
                        className="w-full p-3 rounded bg-gray-900 border border-gray-700 focus:border-purple-500 outline-none"
                        required
                    >
                        <option value="">Selecione o Piloto</option>
                        {drivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
                        ))}
                    </select>
                </div>

                {/* Top 5 */}
                <div className="space-y-4 border rounded-lg p-4 border-gray-800 bg-gray-900/30">
                    <h3 className="text-lg font-semibold text-blue-400">Top 5 Chegada</h3>
                    {[1, 2, 3, 4, 5].map(pos => (
                        <div key={pos} className="flex gap-4 items-center">
                            <span className="w-8 font-bold text-gray-500">P{pos}</span>
                            <select
                                name={`p${pos}`}
                                defaultValue={userBet?.[`p${pos}_driver_id`] || ''}
                                disabled={isClosed}
                                className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none"
                                required
                            >
                                <option value="">Selecione o Piloto</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>

                {/* Special Bets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bortoleto */}
                    <div className="space-y-2 border rounded-lg p-4 border-gray-800 bg-gray-900/30">
                        <label className="text-lg font-semibold text-yellow-400">Posição Bortoleto</label>
                        <p className="text-xs text-gray-500 mb-2">Posição final de Gabriel Bortoleto</p>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            name="bortoleto"
                            defaultValue={userBet?.bortoleto_pos || ''}
                            disabled={isClosed}
                            className="w-full p-2 rounded bg-gray-900 border border-gray-700 focus:border-yellow-500 outline-none"
                            placeholder="1-20"
                            required
                        />
                    </div>

                    {/* Variable Driver */}
                    {variableDriver && (
                        <div className="space-y-2 border rounded-lg p-4 border-gray-800 bg-gray-900/30">
                            <label className="text-lg font-semibold text-orange-400">{variableDriver.name}</label>
                            <p className="text-xs text-gray-500 mb-2">Posição final do piloto variável</p>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                name="variable"
                                defaultValue={userBet?.variable_driver_pos || ''}
                                disabled={isClosed}
                                className="w-full p-2 rounded bg-gray-900 border border-gray-700 focus:border-orange-500 outline-none"
                                placeholder="1-20"
                                required
                            />
                        </div>
                    )}
                </div>

                {!isClosed && (
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg mt-4 transition">
                        {userBet ? 'Atualizar Aposta' : 'Fazer Aposta'}
                    </button>
                )}
            </form>
        </div>
    )
}
