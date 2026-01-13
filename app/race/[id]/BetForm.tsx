'use client'

import { useState, useEffect } from 'react'
import { submitRaceBet } from './actions'

type Driver = {
    id: number
    name: string
    team: string
    code: string | null
}

type Bet = {
    pole_driver_id: number | null
    p1_driver_id: number | null
    p2_driver_id: number | null
    p3_driver_id: number | null
    p4_driver_id: number | null
    p5_driver_id: number | null
    bortoleto_pos: number | null
    variable_driver_pos: number | null
    [key: string]: any
}

type Props = {
    raceId: number
    drivers: Driver[]
    userBet: Bet | null
    isClosed: boolean
    variableDriver: Driver | null
}

export default function BetForm({ raceId, drivers, userBet, isClosed, variableDriver }: Props) {
    const defaultBortoletoPos = userBet?.bortoleto_pos?.toString() || ''
    const [bortoletoPos, setBortoletoPos] = useState(defaultBortoletoPos)

    // Find Bortoleto's ID
    const bortoletoDriver = drivers.find(d => d.name.includes("Bortoleto") || d.name === "Gabriel Bortoleto")
    const bortoletoId = bortoletoDriver?.id.toString()

    // Function to check if Bortoleto is selected in Top 5 and update prop
    const handleDriverSelect = (e: React.ChangeEvent<HTMLSelectElement>, pos: number) => {
        const selectedId = e.target.value

        if (bortoletoId && selectedId === bortoletoId) {
            setBortoletoPos(pos.toString())
        }
    }

    return (
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
                    <option value="">Selecione o Piloto</option>
                    {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.team})</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500">O piloto da pole pode se repetir no Top 5.</p>
            </div>

            {/* Top 5 */}
            <div className="space-y-4 border rounded-lg p-4 border-gray-800 bg-gray-900/30">
                <h3 className="text-lg font-semibold text-blue-400">Top 5 Chegada</h3>
                {[1, 2, 3, 4, 5].map(pos => (
                    <div key={pos} className="flex gap-4 items-center">
                        <span className="w-8 font-bold text-gray-500">P{pos}</span>
                        <select
                            name={`p${pos}`}
                            defaultValue={userBet?.[`p${pos}_driver_id`] || ''}
                            disabled={isClosed}
                            onChange={(e) => handleDriverSelect(e, pos)}
                            className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none"
                            required
                        >
                            <option value="">Selecione o Piloto</option>
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
                    <label className="text-lg font-semibold text-yellow-400">Posição Bortoleto</label>
                    <p className="text-xs text-gray-500 mb-2">Posição final de Gabriel Bortoleto</p>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        name="bortoleto"
                        value={bortoletoPos}
                        onChange={(e) => setBortoletoPos(e.target.value)}
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
                        <p className="text-xs text-gray-500 mb-2">Posição final do piloto variável</p>
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
                    {userBet ? 'Atualizar Aposta' : 'Fazer Aposta'}
                </button>
            )}
        </form>
    )
}
