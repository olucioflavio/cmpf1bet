import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { submitRaceBet } from './actions'
import BetForm from './BetForm'

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

            <BetForm
                raceId={raceId}
                drivers={drivers}
                userBet={userBet}
                isClosed={isClosed}
                variableDriver={variableDriver}
            />
        </div>
    )
}
