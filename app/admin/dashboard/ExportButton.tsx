'use client'

import { useState } from 'react'
import { DownloadIcon } from 'lucide-react'
import { getAllBetsDetails } from './actions'
import { calculateBetScore } from '@/utils/scoring'

export default function ExportButton() {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const data = await getAllBetsDetails()

            // CSV Header
            const headers = [
                'Corrida',
                'Usuario',
                'Email',
                'Pontos',
                'Pole Driver',
                'P1 Driver',
                'P2 Driver',
                'P3 Driver',
                'P4 Driver',
                'P5 Driver',
                'Bortoleto Pos',
                'Variable Driver Pos'
            ]

            const rows = []

            for (const race of data.races) {
                const raceBets = data.bets.filter(b => b.race_id === race.id)
                const raceResult = data.results.find(r => r.race_id === race.id)

                for (const profile of data.profiles) {
                    const bet = raceBets.find(b => b.user_id === profile.id)
                    let score = 0

                    if (bet && raceResult) {
                        score = calculateBetScore(bet, raceResult)
                    } else if (!bet && raceResult && !race.is_test_race) {
                        score = -1
                    } else if (bet) {
                        score = 0
                    } else {
                        // Skipping missing bets for unfinished races in export? Or export with 0/empty?
                        // Let's just continue if there's no bet and no result
                        if (!raceResult) continue;
                    }

                    const getDriverName = (id: any) => data.drivers.find(d => d.id.toString() === id?.toString())?.name || id || ''

                    rows.push([
                        race.name,
                        profile.username || profile.full_name || 'N/A',
                        profile.email || 'N/A',
                        score,
                        getDriverName(bet?.pole_driver_id),
                        getDriverName(bet?.p1_driver_id),
                        getDriverName(bet?.p2_driver_id),
                        getDriverName(bet?.p3_driver_id),
                        getDriverName(bet?.p4_driver_id),
                        getDriverName(bet?.p5_driver_id),
                        bet?.bortoleto_pos || '',
                        bet?.variable_driver_pos || ''
                    ])
                }
            }

            // Convert to CSV string
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            ].join('\n')

            // Create download link
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `apostas_f1_bet_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Export error:', error)
            alert('Erro ao exportar dados.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium transition-colors text-sm"
        >
            <DownloadIcon className="w-4 h-4" />
            {isExporting ? 'Exportando...' : 'Exportar CSV (Excel)'}
        </button>
    )
}
