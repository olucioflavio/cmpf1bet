import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'
import { getNews } from '@/utils/news'

export default async function NewsSection() {
    const news = await getNews(7)

    return (
        <div className="glass-panel p-6 rounded-3xl h-fit">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white">Central de Notícias F1</h2>
                <Link href="/news">
                    <span className="text-xs text-f1-red font-medium cursor-pointer hover:underline">Ver tudo</span>
                </Link>
            </div>

            <div className="space-y-6">
                {news.map((item: any, i: number) => (
                    <a
                        key={i}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                    >
                        <div className="flex gap-4 items-start">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex-shrink-0 flex items-center justify-center group-hover:border-f1-red/50 transition-colors relative overflow-hidden">
                                <div className="absolute inset-0 bg-f1-red/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-2xl relative z-10">📰</span>
                            </div>

                            <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-bold text-f1-red tracking-wider">
                                        {typeof item.source === 'string' ? item.source : 'Notícia'}
                                    </span>
                                    <ExternalLinkIcon className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="text-sm font-semibold leading-snug text-gray-200 group-hover:text-f1-red transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <span className="text-xs text-gray-400">{item.date}</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
                <div className="w-full text-xs text-center text-gray-500">
                    Atualizado automaticamente
                </div>
            </div>
        </div>
    )
}
