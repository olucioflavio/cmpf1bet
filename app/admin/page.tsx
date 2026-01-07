import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { updateRaceStatus, setVariableDriver } from './actions'

export default async function AdminPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return <div className="p-10 text-center">Unauthorized. You are not an admin.</div>
    }

    const { data: races } = await supabase.from('races').select('*').order('date', { ascending: true })
    const { data: drivers } = await supabase.from('drivers').select('*').order('name')

    return (
        <div className="flex-1 w-full max-w-6xl p-4 flex flex-col gap-6">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="p-3">Race</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Variable Driver</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {races?.map(race => (
                            <tr key={race.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                                <td className="p-3 font-medium">{race.name}</td>
                                <td className="p-3 text-sm text-gray-400">{new Date(race.date).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs uppercase ${race.status === 'open' ? 'bg-green-900 text-green-300' :
                                        race.status === 'finished' ? 'bg-gray-800 text-gray-500' : 'bg-blue-900 text-blue-300'
                                        }`}>
                                        {race.status}
                                    </span>
                                </td>
                                <td className="p-3 text-sm">
                                    <form action={async (formData) => {
                                        'use server'
                                        await setVariableDriver(race.id, parseInt(formData.get('driverId') as string))
                                    }}>
                                        <select
                                            name="driverId"
                                            defaultValue={race.variable_driver_id || ''}
                                            className="bg-gray-900 border border-gray-700 rounded p-1 text-sm max-w-[150px]"
                                        >
                                            <option value="">None</option>
                                            {drivers?.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                        <button className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">Set</button>
                                    </form>
                                </td>
                                <td className="p-3 flex gap-2">
                                    <form action={updateRaceStatus.bind(null, race.id, 'open')}>
                                        <button className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs">Open</button>
                                    </form>
                                    <form action={updateRaceStatus.bind(null, race.id, 'closed')}>
                                        <button className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs">Close</button>
                                    </form>
                                    <form action={updateRaceStatus.bind(null, race.id, 'finished')}>
                                        <button className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-xs">Finish</button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
