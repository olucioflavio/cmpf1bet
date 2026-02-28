import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { submitRaceBet } from './actions'
import BetForm from './BetForm'
import { calculateRaceStatus, getRaceBettingInfo } from '@/utils/raceStatus'

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
    const { data: raceResult } = await supabase.from('races').select('*, variable_driver:drivers!variable_driver_id(*)').eq('id', raceId).single()
    const { data: driversResult } = await supabase.from('drivers').select('*').order('name')
    const { data: betResult } = await supabase.from('bets').select('*').eq('race_id', raceId).eq('user_id', user.id).maybeSingle()

    // Check if user has used catapulta in any other race
    const { data: catapultaBet } = await supabase
        .from('bets')
        .select('id')
        .eq('user_id', user.id)
        .eq('catapulta', true)
        .neq('race_id', raceId)
        .maybeSingle()

    const race = raceResult
    const drivers = driversResult || []
    const userBet = betResult
    const hasUsedCatapulta = !!catapultaBet

    if (!race) return <div>Corrida não encontrada</div>

    // Calcular status automático baseado na data
    const actualStatus = calculateRaceStatus(race.date, race.status)
    const bettingInfo = getRaceBettingInfo(race.date)
    const isClosed = actualStatus !== 'open'
    const variableDriver = race.variable_driver

    return (
        <div className="flex-1 w-full max-w-2xl p-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-bold">{race.name}</h1>
                <p className="text-gray-400">{new Date(race.date).toLocaleString()} @ {race.track}</p>
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">Status:</span>
                        <span className={`uppercase font-bold px-3 py-1 rounded-full text-sm ${actualStatus === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            actualStatus === 'scheduled' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                actualStatus === 'closed' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            }`}>
                            {actualStatus === 'open' ? '🟢 Apostas Abertas' :
                                actualStatus === 'scheduled' ? '🔵 Agendada' :
                                    actualStatus === 'closed' ? '🔴 Apostas Encerradas' :
                                        '🏁 Finalizada'}
                        </span>
                    </div>

                    {/* Informações de abertura/fechamento */}
                    {actualStatus === 'scheduled' && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                            <p className="text-blue-400">
                                <strong>📅 Apostas abrem em:</strong> {bettingInfo.openingFormatted}
                            </p>
                            <p className="text-blue-300 mt-1">
                                <strong>⏰ Apostas fecham em:</strong> {bettingInfo.closingFormatted}
                            </p>
                        </div>
                    )}

                    {actualStatus === 'open' && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-sm">
                            <p className="text-green-400">
                                <strong>⏰ Apostas encerram em:</strong> {bettingInfo.closingFormatted}
                            </p>
                            <p className="text-green-300 mt-1 text-xs">
                                Faça sua aposta antes da sexta-feira às 23:59!
                            </p>
                        </div>
                    )}

                    {actualStatus === 'closed' && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm">
                            <p className="text-red-400">
                                <strong>🔒 Apostas encerradas em:</strong> {bettingInfo.closingFormatted}
                            </p>
                        </div>
                    )}
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

            <BetForm
                raceId={raceId}
                drivers={drivers}
                userBet={userBet}
                isClosed={isClosed}
                variableDriver={variableDriver}
                hasUsedCatapulta={hasUsedCatapulta}
            />
        </div>
    )
}
