import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BetCard from './BetCard'

export default async function BetConfirmationPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params
    const supabase = await createClient()
    const raceId = parseInt(params.id)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch race details
    const { data: race } = await supabase
        .from('races')
        .select('*, variable_driver:drivers!variable_driver_id(*)')
        .eq('id', raceId)
        .single()

    if (!race) {
        redirect('/')
    }

    // Fetch user bet
    const { data: bet } = await supabase
        .from('bets')
        .select('*')
        .eq('race_id', raceId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (!bet) {
        redirect(`/race/${raceId}`)
    }

    // Fetch all drivers to map IDs to names
    const { data: drivers } = await supabase
        .from('drivers')
        .select('id, name, team, code')

    // Fetch user profile for username
    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

    const getDriver = (id: number | null) => {
        if (!id || !drivers) return null
        return drivers.find(d => d.id === id) || null
    }

    const betDetails = {
        userName: profile?.username || user.email?.split('@')[0] || 'Competidor',
        raceName: race.name,
        track: race.track,
        raceDate: race.date,
        pole: getDriver(bet.pole_driver_id),
        p1: getDriver(bet.p1_driver_id),
        p2: getDriver(bet.p2_driver_id),
        p3: getDriver(bet.p3_driver_id),
        p4: getDriver(bet.p4_driver_id),
        p5: getDriver(bet.p5_driver_id),
        bortoletoPos: bet.bortoleto_pos,
        variableDriverPos: bet.variable_driver_pos,
        variableDriverName: race.variable_driver?.name || null,
        catapulta: bet.catapulta || false,
        betDate: bet.created_at,
    }

    return (
        <div className="flex-1 w-full max-w-2xl mx-auto p-4 flex flex-col gap-6 items-center">
            <BetCard betDetails={betDetails} raceId={raceId} />
        </div>
    )
}
