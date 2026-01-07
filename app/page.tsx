import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { CalendarIcon, MapPinIcon } from 'lucide-react'

export default async function Index() {
  const supabase = await createClient()

  // Fetch races sorted by date
  const { data: races } = await supabase
    .from('races')
    .select('*')
    .order('date', { ascending: true })

  return (
    <div className="flex-1 w-full flex flex-col gap-8 items-center py-10 px-4">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold text-center tracking-tight">F1 2026 Season</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {races?.map((race) => (
            <div
              key={race.id}
              className={`border border-gray-800 rounded-lg p-5 bg-gray-900 transition hover:border-gray-600 ${race.status === 'open' ? 'ring-1 ring-green-500/50' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${race.status === 'open' ? 'bg-green-900 text-green-300' :
                    race.status === 'finished' ? 'bg-gray-800 text-gray-500' : 'bg-blue-900 text-blue-300'
                  }`}>
                  {race.status}
                </span>
                <span className="text-xs text-gray-400 font-mono">R{race.id}</span>
              </div>

              <h2 className="text-xl font-bold mb-2 truncate">{race.name}</h2>

              <div className="text-sm text-gray-400 space-y-1 mb-6">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(race.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="truncate">{race.track}</span>
                </div>
              </div>

              {race.status === 'open' ? (
                <Link
                  href={`/race/${race.id}`}
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded transition"
                >
                  Place Bet
                </Link>
              ) : (
                <button
                  disabled
                  className="block w-full text-center bg-gray-800 text-gray-500 font-medium py-2 rounded cursor-not-allowed"
                >
                  {race.status === 'finished' ? 'Results' : 'Locked'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
