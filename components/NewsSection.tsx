'use client'

import Image from 'next/image'

const MOCK_NEWS = [
    {
        id: 1,
        title: "Novo pacote de atualizações da Ferrari para Monza",
        summary: "Scuderia Ferrari traz atualizações aerodinâmicas significativas para sua corrida em casa.",
        image: "/news/ferrari-update.jpg",
        date: "2h atrás",
        tag: "Tecnologia"
    },
    {
        id: 2,
        title: "Verstappen confiante apesar da diferença na qualificação",
        summary: "O atual campeão acredita que o ritmo de corrida será o diferencial.",
        image: "/news/max-interview.jpg",
        date: "5h atrás",
        tag: "Entrevista"
    },
    {
        id: 3,
        title: "Regulamento de 2026: O que esperar",
        summary: "Uma análise profunda das novas regras de motor para a próxima temporada.",
        image: "/news/2026-regulations.jpg",
        date: "1d atrás",
        tag: "Análise"
    }
]

export default function NewsSection() {
    return (
        <div className="glass-panel rounded-2xl p-6 w-full lg:w-[350px] h-fit">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-tight">Central de Notícias F1</h2>
                <span className="text-xs text-f1-red font-medium cursor-pointer hover:underline">Ver tudo</span>
            </div>

            <div className="space-y-6">
                {MOCK_NEWS.map((news) => (
                    <div key={news.id} className="group cursor-pointer">
                        <div className="flex gap-4 items-start">
                            {/* 
                  Since we don't have real images yet, I'll use a colored div as placeholder 
                  or an empty Image component if I had remote patterns set up.
                  For now, a stylish gradient div.
               */}
                            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex-shrink-0 relative overflow-hidden group-hover:border-f1-red/50 transition-colors">
                                <div className="absolute inset-0 bg-f1-red/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-f1-red tracking-wider">{news.tag}</span>
                                <h3 className="text-sm font-semibold leading-snug group-hover:text-f1-red transition-colors">
                                    {news.title}
                                </h3>
                                <span className="text-xs text-gray-400">{news.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <button className="w-full text-xs text-center text-gray-400 hover:text-white transition-colors">
                    Desenvolvido com F1 API
                </button>
            </div>
        </div>
    )
}
