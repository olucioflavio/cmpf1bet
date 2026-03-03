'use client'

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas-pro'
import Link from 'next/link'

type Driver = {
    id: number
    name: string
    team: string
    code: string | null
}

type BetDetails = {
    userName: string
    raceName: string
    track: string
    raceDate: string
    pole: Driver | null
    p1: Driver | null
    p2: Driver | null
    p3: Driver | null
    p4: Driver | null
    p5: Driver | null
    bortoletoPos: number | null
    variableDriverPos: number | null
    variableDriverName: string | null
    catapulta: boolean
    betDate: string | null
}

export default function BetCard({ betDetails, raceId }: { betDetails: BetDetails; raceId: number }) {
    const cardRef = useRef<HTMLDivElement>(null)
    const [saving, setSaving] = useState(false)

    const handleSaveImage = async () => {
        if (!cardRef.current) return
        setSaving(true)

        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: '#0a0a0a',
                scale: 2,
                useCORS: true,
                logging: false,
            })

            const link = document.createElement('a')
            link.download = `aposta-${betDetails.raceName.replace(/\s+/g, '-').toLowerCase()}-${betDetails.userName}.png`
            link.href = canvas.toDataURL('image/png')
            link.click()
        } catch (err) {
            console.error('Error saving image:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleShareWhatsApp = () => {
        const top5 = [betDetails.p1, betDetails.p2, betDetails.p3, betDetails.p4, betDetails.p5]
            .map((d, i) => `  P${i + 1}: ${d?.name || '?'}`)
            .join('\n')

        const text = `🏎️ *Minha Aposta - ${betDetails.raceName}*\n` +
            `📍 ${betDetails.track}\n\n` +
            `🟡 *Pole:* ${betDetails.pole?.name || '?'}\n\n` +
            `🏁 *Top 5:*\n${top5}\n\n` +
            `🇧🇷 *Bortoleto:* P${betDetails.bortoletoPos || '?'}\n` +
            (betDetails.variableDriverName
                ? `🔄 *${betDetails.variableDriverName}:* P${betDetails.variableDriverPos || '?'}\n`
                : '') +
            (betDetails.catapulta ? `\n🚀 *CATAPULTA ATIVADA!* (pontos dobrados)\n` : '') +
            `\n⚡ CMPF1Bet`

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`
        window.open(url, '_blank')
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const top5 = [
        { pos: 1, driver: betDetails.p1 },
        { pos: 2, driver: betDetails.p2 },
        { pos: 3, driver: betDetails.p3 },
        { pos: 4, driver: betDetails.p4 },
        { pos: 5, driver: betDetails.p5 },
    ]

    const posColors = [
        'from-amber-400 to-yellow-500',   // P1 - Gold
        'from-slate-300 to-gray-400',      // P2 - Silver
        'from-amber-600 to-orange-700',    // P3 - Bronze
        'from-slate-500 to-slate-600',     // P4
        'from-slate-500 to-slate-600',     // P5
    ]

    return (
        <>
            {/* Card visual - capturado como imagem */}
            <div
                ref={cardRef}
                className="w-full max-w-lg rounded-xl overflow-hidden"
                style={{ background: 'linear-gradient(145deg, #111827, #0a0a0a)' }}
            >
                {/* Header */}
                <div
                    className="px-6 py-5 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">🏎️</span>
                            <span className="text-white/70 text-xs font-semibold tracking-widest uppercase">
                                Comprovante de Aposta
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white">{betDetails.raceName}</h2>
                        <p className="text-white/80 text-sm mt-1">📍 {betDetails.track}</p>
                    </div>
                </div>

                {/* User Info */}
                <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm">
                            {betDetails.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">{betDetails.userName}</p>
                            <p className="text-slate-500 text-xs">Competidor</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500 text-xs">Data da aposta</p>
                        <p className="text-slate-300 text-xs">{formatDate(betDetails.betDate)}</p>
                    </div>
                </div>

                {/* Pole Position */}
                <div className="px-6 py-3 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Pole Position</span>
                        <div className="flex items-center gap-2">
                            <span className="text-white font-semibold text-sm">
                                {betDetails.pole?.name || '-'}
                            </span>
                            {betDetails.pole?.code && (
                                <span className="text-slate-500 text-xs">({betDetails.pole.code})</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top 5 */}
                <div className="px-6 py-4 border-b border-white/10">
                    <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">Top 5 Chegada</p>
                    <div className="space-y-2">
                        {top5.map((item, i) => (
                            <div key={item.pos} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${posColors[i]} flex items-center justify-center text-xs font-bold ${i < 3 ? 'text-white' : 'text-white/80'}`}>
                                    P{item.pos}
                                </div>
                                <span className="text-white text-sm flex-1">{item.driver?.name || '-'}</span>
                                {item.driver?.team && (
                                    <span className="text-slate-500 text-xs">{item.driver.team}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Special Bets */}
                <div className="px-6 py-4 border-b border-white/10">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Bortoleto */}
                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-yellow-400 text-xs font-semibold mb-1">🇧🇷 Bortoleto</p>
                            <p className="text-white text-lg font-bold">
                                P{betDetails.bortoletoPos || '?'}
                            </p>
                        </div>

                        {/* Variable Driver */}
                        {betDetails.variableDriverName && (
                            <div className="bg-white/5 rounded-lg p-3">
                                <p className="text-orange-400 text-xs font-semibold mb-1">
                                    🔄 {betDetails.variableDriverName}
                                </p>
                                <p className="text-white text-lg font-bold">
                                    P{betDetails.variableDriverPos || '?'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Catapulta */}
                {betDetails.catapulta && (
                    <div className="px-6 py-3 border-b border-white/10">
                        <div
                            className="rounded-lg p-3 text-center"
                            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(168,85,247,0.1))' }}
                        >
                            <p className="text-sm font-bold" style={{ color: '#a78bfa' }}>
                                🚀 CATAPULTA ATIVADA
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#c4b5fd' }}>
                                Pontos desta corrida serão dobrados!
                            </p>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <span className="text-red-500 text-lg">⚡</span>
                        <span className="text-slate-400 text-xs font-bold tracking-wider">CMPF1BET</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                        Corrida: {formatDate(betDetails.raceDate)}
                    </p>
                </div>
            </div>

            {/* Action Buttons - fora do card para não aparecer na imagem */}
            <div className="w-full max-w-lg flex flex-col gap-3 mt-2">
                <button
                    onClick={handleSaveImage}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    {saving ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Gerando imagem...
                        </>
                    ) : (
                        <>
                            📥 Salvar como Imagem
                        </>
                    )}
                </button>

                <button
                    onClick={handleShareWhatsApp}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                    💬 Compartilhar no WhatsApp
                </button>

                <Link
                    href={`/race/${raceId}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-center"
                >
                    ← Voltar para a corrida
                </Link>
            </div>
        </>
    )
}
