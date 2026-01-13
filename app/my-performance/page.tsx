import { getUserPerformance } from './actions'
import { TrophyIcon, CalendarIcon, CheckCircle2Icon, XCircleIcon, MedalIcon, StarIcon } from 'lucide-react'

export default async function MyPerformancePage() {
    const performances = await getUserPerformance()

    const totalPoints = performances.reduce((acc, curr) => acc + curr.score, 0)
    const totalRaces = performances.length
    const averagePoints = totalRaces > 0 ? (totalPoints / totalRaces).toFixed(1) : 0

    return (
        <div className="flex-1 w-full flex flex-col gap-8 items-center py-8 px-4 md:px-8">
            <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-1000">

                <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 flex items-center gap-3">
                            <StarIcon className="w-8 h-8 text-f1-red" />
                            Meu Desempenho
                        </h1>
                        <p className="text-gray-400">Analise seus resultados corrida a corrida</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="glass-panel px-6 py-4 rounded-2xl text-center">
                            <span className="block text-3xl font-black text-white">{totalPoints}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Pontos Totais</span>
                        </div>
                        <div className="glass-panel px-6 py-4 rounded-2xl text-center">
                            <span className="block text-3xl font-black text-gray-300">{averagePoints}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-wider">Média / Corrida</span>
                        </div>
                    </div>
                </header>

                <div className="space-y-6">
                    {performances.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                            <p className="text-xl text-gray-400 mb-2">Ainda não há resultados para exibir.</p>
                            <p className="text-sm text-gray-500">Participe das próximas corridas para ver seu desempenho aqui!</p>
                        </div>
                    ) : (
                        performances.map((perf) => (
                            <div key={perf.race.id} className="glass-panel p-6 rounded-3xl overflow-hidden relative">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                                            {perf.race.name}
                                            {perf.bonus && (
                                                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs border border-yellow-500/30 flex items-center gap-1">
                                                    <MedalIcon className="w-3 h-3" /> Bônus Top 5!
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <CalendarIcon className="w-4 h-4" />
                                            {new Date(perf.race.date).toLocaleDateString()}
                                            <span className="w-1 h-1 bg-gray-600 rounded-full mx-1" />
                                            {perf.race.track}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                        <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">Pontuação</span>
                                        <span className="text-2xl font-black text-white">{perf.score}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                    {/* Results Items */}
                                    <ResultItem label="Pole Position" isCorrect={perf.breakdown.pole} value="Pole" />
                                    <ResultItem label="P1" isCorrect={perf.breakdown.p1} value="Vencedor" />
                                    <ResultItem label="P2" isCorrect={perf.breakdown.p2} value="2º Lugar" />
                                    <ResultItem label="P3" isCorrect={perf.breakdown.p3} value="3º Lugar" />
                                    <ResultItem label="P4" isCorrect={perf.breakdown.p4} value="4º Lugar" />
                                    <ResultItem label="P5" isCorrect={perf.breakdown.p5} value="5º Lugar" />
                                    <ResultItem label="Bortoleto" isCorrect={perf.breakdown.bortoleto} value="Pos. Bortoleto" />
                                    <ResultItem label="Piloto Variável" isCorrect={perf.breakdown.variable} value="Pos. Variável" />
                                </div>

                                {!perf.bet && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                        <p className="text-xl font-bold text-gray-300">Você não apostou nesta corrida</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    )
}

function ResultItem({ label, isCorrect, value }: { label: string, isCorrect: boolean, value: string }) {
    return (
        <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/5 border-red-500/20'}`}>
            <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
            <div className="flex items-center gap-2">
                {isCorrect ? (
                    <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500/50" />
                )}
                <span className={`font-bold ${isCorrect ? 'text-green-400' : 'text-gray-400'}`}>
                    {isCorrect ? '+1 ponto' : 'Errou'}
                </span>
            </div>
        </div>
    )
}
