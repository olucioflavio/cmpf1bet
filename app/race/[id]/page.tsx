import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { submitRaceBet } from './actions'

export default async function RacePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
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

    if (!race) return <div>Race not found</div>

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
                        <option value="">Select Driver</option>
                        {drivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
                        ))}
                    </select>
                </div>

                {/* Top 5 */}
                <div className="space-y-4 border rounded-lg p-4 border-gray-800 bg-gray-900/30">
                    <h3 className="text-lg font-semibold text-blue-400">Top 5 Finishers</h3>
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
                                <option value="">Select Driver</option>
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
                        <label className="text-lg font-semibold text-yellow-400">Bortoleto Position</label>
                        <p className="text-xs text-gray-500 mb-2">Gabriel Bortoleto final position</p>
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
                            <p className="text-xs text-gray-500 mb-2">Variable Driver final position</p>
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
                        {userBet ? 'Update Bet' : 'Place Bet'}
                    </button>
                )}
            </form>
        </div>
    )
}
