import { getAllBetsDetails } from './actions'
import { calculateBetScore } from '@/utils/scoring'
import Link from 'next/link'
import { ArrowLeftIcon } from 'lucide-react'
import ExportButton from './ExportButton'

export default async function AdminDashboardPage({
    searchParams
}: {
    searchParams: Promise<{ raceId?: string }>
}) {
    const { raceId } = await searchParams
    const data = await getAllBetsDetails()

    // Filter races
    const selectedRaceId = raceId ? parseInt(raceId) : data.races[0]?.id
    const selectedRace = data.races.find(r => r.id === selectedRaceId)

    // Filter bets for this race
    const raceBets = data.bets.filter(b => b.race_id === selectedRaceId)
    const raceResult = data.results.find(r => r.race_id === selectedRaceId)

    // Calculate scores for this race
    const racePerformance = data.profiles.map(profile => {
        const userBet = raceBets.find(b => b.user_id === profile.id)
        let score = 0
        if (userBet && raceResult) {
            score = calculateBetScore(userBet, raceResult)
        } else if (!userBet && raceResult && selectedRace && !selectedRace.is_test_race) {
            score = -1
        } else if (userBet) {
            // Bet exists but no result yet
            score = 0 // pending
        }

        return {
            profile,
            bet: userBet,
            score
        }
    }).sort((a, b) => b.score - a.score)

    return (
        <div className="flex-1 w-full flex flex-col gap-8 p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-gray-400 hover:text-white">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                </div>
                <ExportButton />
            </div>

            {/* Race Selector */}
            <div className="flex gap-2 overflow-x-auto pb-4">
                {data.races.map(race => (
                    <Link
                        key={race.id}
                        href={`/admin/dashboard?raceId=${race.id}`}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${race.id === selectedRaceId
                            ? 'bg-f1-red text-white font-bold'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {race.name}
                    </Link>
                ))}
            </div>

            {selectedRace ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <h2 className="text-2xl font-bold text-white">{selectedRace.name}</h2>
                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${selectedRace.status === 'open' ? 'bg-green-500/20 text-green-400' :
                            selectedRace.status === 'finished' ? 'bg-gray-500/20 text-gray-400' : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {selectedRace.status}
                        </span>
                    </div>

                    <div className="glass-panel overflow-hidden rounded-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs md:text-sm text-left whitespace-nowrap">
                                <thead className="bg-white/5 text-gray-400">
                                    <tr>
                                        <th className="p-3">Usuário</th>
                                        <th className="p-3 text-center">Pontos</th>
                                        <th className="p-3">Pole</th>
                                        <th className="p-3">P1</th>
                                        <th className="p-3">P2</th>
                                        <th className="p-3">P3</th>
                                        <th className="p-3">P4</th>
                                        <th className="p-3">P5</th>
                                        <th className="p-3">Bortoleto</th>
                                        <th className="p-3">Variável</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {racePerformance.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="p-8 text-center text-gray-500">Nenhuma aposta encontrada para esta corrida.</td>
                                        </tr>
                                    ) : (
                                        racePerformance.map(({ profile, bet, score }) => {
                                            const getDriverCode = (id: any) => data.drivers.find(d => d.id.toString() === id?.toString())?.code || id

                                            // Helper to color cell if match (only if result exists)
                                            const isMatch = (betVal: any, resVal: any) => raceResult && betVal && betVal.toString() === resVal?.toString()
                                            const cellClass = (betVal: any, resVal: any) =>
                                                isMatch(betVal, resVal) ? 'bg-green-500/20 text-green-400 font-bold' : ''

                                            return (
                                                <tr key={profile.id} className="hover:bg-white/5">
                                                    <td className="p-3 font-medium text-white">{profile.username || profile.email}</td>
                                                    <td className="p-3 text-center text-lg font-bold text-white">{score}</td>
                                                    <td className={`p-3 ${cellClass(bet?.pole_driver_id, raceResult?.pole_driver_id)}`}>
                                                        {getDriverCode(bet?.pole_driver_id)}
                                                    </td>
                                                    <td className={`p-3 ${cellClass(bet?.p1_driver_id, raceResult?.p1_driver_id)}`}>
                                                        {getDriverCode(bet?.p1_driver_id)}
                                                    </td>
                                                    <td className={`p-3 ${cellClass(bet?.p2_driver_id, raceResult?.p2_driver_id)}`}>
                                                        {getDriverCode(bet?.p2_driver_id)}
                                                    </td>
                                                    <td className={`p-3 ${cellClass(bet?.p3_driver_id, raceResult?.p3_driver_id)}`}>
                                                        {getDriverCode(bet?.p3_driver_id)}
                                                    </td>
                                                    <td className={`p-3 ${cellClass(bet?.p4_driver_id, raceResult?.p4_driver_id)}`}>
                                                        {getDriverCode(bet?.p4_driver_id)}
                                                    </td>
                                                    <td className={`p-3 ${cellClass(bet?.p5_driver_id, raceResult?.p5_driver_id)}`}>
                                                        {getDriverCode(bet?.p5_driver_id)}
                                                    </td>
                                                    <td className={`p-3 ${cellClass(bet?.bortoleto_pos, raceResult?.bortoleto_pos)}`}>
                                                        {bet?.bortoleto_pos}
                                                    </td>
                                                    <td className={`p-3 ${cellClass(bet?.variable_driver_pos, raceResult?.variable_driver_pos)}`}>
                                                        {bet?.variable_driver_pos}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-12 text-gray-500">Selecione uma corrida para ver os detalhes.</div>
            )}
        </div>
    )
}
