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
    hasUsedCatapulta: boolean
}

export default function BetForm({ raceId, drivers, userBet, isClosed, variableDriver, hasUsedCatapulta }: Props) {
    const defaultBortoletoPos = userBet?.bortoleto_pos?.toString() || ''
    const [bortoletoPos, setBortoletoPos] = useState(defaultBortoletoPos)

    const [error, setError] = useState<string | null>(null)

    // Find Bortoleto's ID
    const bortoletoDriver = drivers.find(d => d.name.includes("Bortoleto") || d.name === "Gabriel Bortoleto")
    const bortoletoId = bortoletoDriver?.id.toString()
    const variableDriverId = variableDriver?.id.toString()

    // Function to check if Bortoleto is selected in Top 5 and update prop
    const handleDriverSelect = (e: React.ChangeEvent<HTMLSelectElement>, pos: number) => {
        const selectedId = e.target.value

        if (bortoletoId && selectedId === bortoletoId) {
            setBortoletoPos(pos.toString())
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setError(null)
        const formData = new FormData(e.currentTarget)
        const p1 = formData.get('p1') as string
        const p2 = formData.get('p2') as string
        const p3 = formData.get('p3') as string
        const p4 = formData.get('p4') as string
        const p5 = formData.get('p5') as string
        const bortoletoInput = formData.get('bortoleto') as string

        if (!bortoletoId) return // Should not happen given hardcoded logic but safe to ignore

        let selectedPosInTop5: string | null = null
        if (p1 === bortoletoId) selectedPosInTop5 = '1'
        if (p2 === bortoletoId) selectedPosInTop5 = '2'
        if (p3 === bortoletoId) selectedPosInTop5 = '3'
        if (p4 === bortoletoId) selectedPosInTop5 = '4'
        if (p5 === bortoletoId) selectedPosInTop5 = '5'

        // 1. Forward Check: If selected in Top 5, Input must match
        if (selectedPosInTop5 && bortoletoInput !== selectedPosInTop5) {
            e.preventDefault()
            setError(`Gabriel Bortoleto foi colocado na posição P${selectedPosInTop5} no Top 5, mas você indicou a posição ${bortoletoInput} na caixa específica. Por favor, ajuste para que sejam iguais.`)
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            return
        }

        // 2. Reverse Check: If Input is 1-5, Top 5 must match
        // Only run this if he wasn't found in Top 5 (otherwise Check 1 would have caught the mismatch or confirmed the match)
        if (!selectedPosInTop5 && ['1', '2', '3', '4', '5'].includes(bortoletoInput)) {
            e.preventDefault()
            setError(`Você indicou que Gabriel Bortoleto chegará na posição ${bortoletoInput}, mas a P${bortoletoInput} no Top 5 está selecionada para outro piloto (ou vazia). Selecione Gabriel Bortoleto na P${bortoletoInput} acima.`)
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
            return
        }

        // --- Variable Driver Validation ---
        if (variableDriverId && variableDriver) {
            const variableInput = formData.get('variable') as string
            let selectedVarPosInTop5: string | null = null

            if (p1 === variableDriverId) selectedVarPosInTop5 = '1'
            if (p2 === variableDriverId) selectedVarPosInTop5 = '2'
            if (p3 === variableDriverId) selectedVarPosInTop5 = '3'
            if (p4 === variableDriverId) selectedVarPosInTop5 = '4'
            if (p5 === variableDriverId) selectedVarPosInTop5 = '5'

            // 1. Forward Check
            if (selectedVarPosInTop5 && variableInput !== selectedVarPosInTop5) {
                e.preventDefault()
                setError(`O piloto variável ${variableDriver.name} foi colocado na posição P${selectedVarPosInTop5} no Top 5, mas você indicou a posição ${variableInput} na caixa específica. Por favor, ajuste para que sejam iguais.`)
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                return
            }

            // 2. Reverse Check
            if (!selectedVarPosInTop5 && ['1', '2', '3', '4', '5'].includes(variableInput)) {
                e.preventDefault()
                setError(`Você indicou que o piloto variável ${variableDriver.name} chegará na posição ${variableInput}, mas a P${variableInput} no Top 5 está selecionada para outro piloto (ou vazia). Selecione ${variableDriver.name} na P${variableInput} acima.`)
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                return
            }
        }
    }

    return (
        <form action={submitRaceBet} onSubmit={handleSubmit} className="flex flex-col gap-6">
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

            {/* Catapulta Toggle */}
            <div className="border rounded-lg p-4 border-purple-500/50 bg-purple-900/10 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                            <span>🚀</span> Catapulta
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Dobra os pontos desta corrida. Permitido apenas 1 vez por ano.
                        </p>
                        {hasUsedCatapulta && !userBet?.catapulta && (
                            <p className="text-xs text-red-400 mt-1">
                                Você já ativou a catapulta em outra corrida este ano.
                            </p>
                        )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="catapulta"
                            className="sr-only peer"
                            defaultChecked={userBet?.catapulta}
                            disabled={isClosed || (hasUsedCatapulta && !userBet?.catapulta)}
                        />
                        <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 border border-gray-600"></div>
                    </label>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm animate-pulse">
                    ⚠️ {error}
                </div>
            )}

            {!isClosed && (
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg mt-4 transition">
                    {userBet ? 'Atualizar Aposta' : 'Fazer Aposta'}
                </button>
            )}
        </form>
    )
}
