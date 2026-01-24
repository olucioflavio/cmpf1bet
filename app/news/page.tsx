import { getNews } from '@/utils/news'
import { ExternalLinkIcon } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 3600 // Revalidate every hour

export default async function NewsPage() {
    const news = await getNews(12)

    return (
        <div className="flex-1 w-full flex flex-col items-center bg-gray-950 min-h-screen">
            <div className="w-full max-w-7xl p-6">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        Notícias F1 <span className="text-f1-red">2026</span>
                    </h1>
                    <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Voltar ao Início
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {news.map((item: any, i: number) => (
                        <a
                            key={i}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col h-full glass-panel p-5 rounded-2xl transition-all hover:-translate-y-1 duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLinkIcon className="w-5 h-5 text-f1-red" />
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center shrink-0">
                                    <span className="text-lg">📰</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-f1-red tracking-wider">
                                        {typeof item.source === 'string' ? item.source : 'Notícia'}
                                    </span>
                                    <span className="text-xs text-gray-500">{item.date}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold leading-snug text-gray-200 group-hover:text-white transition-colors mb-2 line-clamp-3 flex-grow">
                                {item.title}
                            </h3>

                            <div className="mt-auto pt-4 flex items-center text-xs font-medium text-gray-500 group-hover:text-f1-red transition-colors">
                                Ler matéria completa
                                <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-300">→</span>
                            </div>
                        </a>
                    ))}
                </div>

                {news.length === 0 && (
                    <div className="w-full py-20 text-center text-gray-500">
                        Nenhuma notícia encontrada no momento.
                    </div>
                )}
            </div>
        </div>
    )
}
