import { getLeaderboard } from './actions'
import { TrophyIcon, MedalIcon, UserIcon } from 'lucide-react'

export default async function LeaderboardPage() {
    const leaderboard = await getLeaderboard()

    return (
        <div className="flex-1 w-full flex flex-col gap-8 items-center py-8 px-4 md:px-8">
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-1000">

                <header className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-4 flex items-center justify-center gap-3">
                        <TrophyIcon className="w-10 h-10 text-yellow-500" />
                        Classificação
                    </h1>
                    <p className="text-gray-400">Quem será o campeão do bolão 2026?</p>
                </header>

                <div className="glass-panel overflow-hidden rounded-3xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-6 font-bold text-gray-300 w-20 text-center">Pos</th>
                                    <th className="p-6 font-bold text-gray-300">Competidor</th>
                                    <th className="p-6 font-bold text-gray-300 text-right">Pontos Totais</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leaderboard.map((user, index) => {
                                    const position = index + 1
                                    let posColor = "text-gray-400 font-mono"
                                    if (position === 1) posColor = "text-yellow-400 font-bold"
                                    if (position === 2) posColor = "text-gray-300 font-bold"
                                    if (position === 3) posColor = "text-amber-600 font-bold"

                                    return (
                                        <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="p-6 text-center">
                                                <span className={`text-xl ${posColor}`}>
                                                    {position}º
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${position === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                                                        position === 2 ? 'bg-gray-300/20 text-gray-300' :
                                                            position === 3 ? 'bg-amber-600/20 text-amber-600' :
                                                                'bg-white/10 text-gray-400'
                                                        }`}>
                                                        {position <= 3 ? <MedalIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-lg group-hover:text-f1-red transition-colors">
                                                            {user.full_name || user.username || 'Desconhecido'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 font-mono">@{user.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <span className="text-2xl font-black italic text-white font-mono">
                                                    {user.calculatedPoints}
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1">PTS</span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {leaderboard.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            Nenhum competidor encontrado.
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
