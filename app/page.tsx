import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon, ChevronRightIcon, ClockIcon, TrophyIcon } from 'lucide-react'
import NewsSection from '@/components/NewsSection'
import { getLeaderboard } from './leaderboard/actions'
import { calculateRaceStatus } from '@/utils/raceStatus'

export default async function Index() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch races sorted by date
  const { data: races } = await supabase
    .from('races')
    .select('*')
    .order('date', { ascending: true })

  // Fetch user bets if logged in
  let userBets: Array<{ race_id: number }> = []
  let profile = null
  if (user) {
    const { data: betsData } = await supabase
      .from('bets')
      .select('race_id')
      .eq('user_id', user.id)
    userBets = betsData || []

    const { data: profileData } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single()
    profile = profileData
  }

  // Separate test races from official races
  const officialRaces = races?.filter(r => !r.is_test_race) || []

  // Fetch leaderboard for stats
  const leaderboardData = await getLeaderboard()

  let userStats = null
  let userRank: number | string = '-'

  if (user) {
    const index = leaderboardData.findIndex(u => u.id === user.id)
    if (index !== -1) {
      userStats = leaderboardData[index]
      userRank = index + 1
    }
  }

  // Find next race (first future race with open status)
  const now = new Date()

  // Calcular status automático para cada corrida e encontrar a próxima aberta
  const racesWithStatus = races?.map(r => ({
    ...r,
    calculatedStatus: calculateRaceStatus(r.date, r.status)
  }))

  const nextRace =
    racesWithStatus?.find(r => r.calculatedStatus === 'open') ||
    racesWithStatus?.find(r => new Date(r.date) > now) ||
    racesWithStatus?.[0]

  // Format date for the next race countdown style
  const nextRaceDate = nextRace ? new Date(nextRace.date) : null

  return (
    <div className="flex-1 w-full flex flex-col gap-8 items-center py-8 px-4 md:px-8">
      <div className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000">

        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-2">
              Bem-vindo de volta, <span className="text-f1-red">{profile?.username || user?.email?.split('@')[0] || 'Pitaqueiro'}</span>
            </h1>
            <p className="text-gray-400">Pronto para apostar na temporada 2026?</p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Status da Temporada</span>
              <p className="text-xl font-bold text-white">Rodada {officialRaces.length > 0 ? (nextRace?.is_test_race ? 0 : officialRaces.findIndex(r => r.id === nextRace?.id) + 1 || 1) : 1} / {officialRaces.length || 22}</p>
            </div>
          </div>
        </header>

        {/* Hero Section - Next Race */}
        {nextRace && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="md:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-f1-red/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex gap-2 items-center mb-3">
                      <span className="inline-block px-3 py-1 rounded-full bg-f1-red/10 text-f1-red text-xs font-bold uppercase tracking-wider border border-f1-red/20">
                        Próxima Corrida
                      </span>
                      {nextRace.is_test_race && (
                        <span className="inline-block px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
                          Teste - Não Conta Pontos
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black italic text-white mb-1 uppercase">
                      {nextRace.name}
                    </h2>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPinIcon className="w-4 h-4 text-f1-red" />
                      <span className="font-medium">{nextRace.track}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-6 items-end justify-between">
                  {(() => {
                    const now = new Date()
                    const raceTime = nextRaceDate ? new Date(nextRaceDate) : now
                    const diffMs = raceTime.getTime() - now.getTime()
                    const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24))
                    const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

                    return (
                      <div className="flex gap-4">
                        <div className="text-center">
                          <span className="block text-4xl font-bold text-white font-mono">
                            {daysRemaining.toString().padStart(2, '0')}
                          </span>
                          <span className="text-xs text-gray-400 uppercase">Dias</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-600 self-center">:</span>
                        <div className="text-center">
                          <span className="block text-4xl font-bold text-white font-mono">
                            {hoursRemaining.toString().padStart(2, '0')}
                          </span>
                          <span className="text-xs text-gray-400 uppercase">Horas</span>
                        </div>
                      </div>
                    )
                  })()}

                  <Link
                    href={`/race/${nextRace.id}`}
                    className="group/btn relative px-8 py-3 bg-f1-red text-white font-bold rounded-xl overflow-hidden transition-transform hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {userBets.some(b => b.race_id === nextRace.id) ? 'Editar Aposta' : 'Apostar Agora'} <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Live Odds / Mini Stats Card */}
            <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Estatísticas Rápidas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-sm text-gray-400">Média / Corrida</span>
                    <span className="font-mono font-bold text-white">
                      {userStats?.racesCompleted ? (userStats.calculatedPoints / userStats.racesCompleted).toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-sm text-gray-400">Pontuação Total</span>
                    <span className="font-mono font-bold text-green-400">{userStats?.calculatedPoints || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-sm text-gray-400">Posição</span>
                    <span className="font-mono font-bold text-yellow-500">#{userRank}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-400 mb-2">Dica do dia</p>
                <p className="text-sm italic text-gray-200">"Monza favorece alta velocidade. Fique de olho na Williams."</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Upcoming Races */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-f1-red" /> Calendário da Temporada
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              {racesWithStatus?.filter(r => r.id !== nextRace?.id).map((race) => {
                const raceStatus = calculateRaceStatus(race.date, race.status)
                return (
                  <div
                    key={race.id}
                    className={`glass-panel p-5 rounded-2xl transition hover:border-white/20 group relative ${raceStatus === 'open' ? '' : 'opacity-60 grayscale'}`}
                  >
                    <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
                      {raceStatus === 'open' ? (
                        <span className="w-2 h-2 rounded-full bg-green-500 block shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-gray-500 border border-gray-700 px-2 py-0.5 rounded">
                          {raceStatus}
                        </span>
                      )}
                      {race.is_test_race && (
                        <span className="text-[9px] font-bold uppercase text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-1.5 py-0.5 rounded">
                          Teste
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 font-mono mb-1">
                        {race.is_test_race ? 'Teste' : `Rodada ${officialRaces.findIndex(r => r.id === race.id) + 1}`}
                      </p>
                      <h4 className="text-lg font-bold text-white truncate group-hover:text-f1-red transition-colors">{race.name}</h4>
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <MapPinIcon className="w-3 h-3" /> {race.track}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 md:mt-6">
                      <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(race.date).toLocaleDateString()}
                      </div>

                      {raceStatus === 'open' && (
                        <Link
                          href={`/race/${race.id}`}
                          className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {userBets.some(b => b.race_id === race.id) ? 'Editar' : 'Apostar'}
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar - News & Leaderboard */}
          <div className="lg:col-span-1 space-y-8">

            {/* Mini Leaderboard Widget */}
            <div className="glass-panel p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  Classificação
                </h3>
                <Link href="/leaderboard" className="text-xs text-f1-red font-bold hover:underline">
                  Ver ranking
                </Link>
              </div>

              <div className="space-y-1">
                {leaderboardData.slice(0, 5).map((user, index) => (
                  <div key={user.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black font-mono w-4 ${index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-300' :
                          index === 2 ? 'text-amber-600' : 'text-gray-500'
                        }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-200 truncate max-w-[120px]">
                        {user.username || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      {user.calculatedPoints}
                    </span>
                  </div>
                ))}
                {leaderboardData.length === 0 && (
                  <div className="text-center py-4 text-xs text-gray-500">
                    Nenhum dado ainda.
                  </div>
                )}
              </div>
            </div>

            <NewsSection />
          </div>
        </div>

      </div>
    </div>
  )
}
