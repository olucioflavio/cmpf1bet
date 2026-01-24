import { XMLParser } from 'fast-xml-parser'

export async function getNews(limit?: number) {
    try {
        const res = await fetch('https://news.google.com/rss/search?q=Formula+1+2026&hl=pt-BR&gl=BR&ceid=BR:pt-419', { next: { revalidate: 3600 } })
        if (!res.ok) throw new Error('Failed to fetch')
        const text = await res.text()
        const parser = new XMLParser()
        const feed = parser.parse(text)
        const items = feed?.rss?.channel?.item || []

        // Ensure items is an array (XMLParser might return single object if only 1 item)
        const newsItems = Array.isArray(items) ? items : [items]

        const mappedItems = newsItems.map((item: any) => ({
            title: item.title,
            link: item.link,
            date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
            source: item.source || 'F1 News'
        }))

        if (limit) {
            return mappedItems.slice(0, limit)
        }
        return mappedItems
    } catch (e) {
        console.error('Failed to fetch news', e)
        // Fallback mock data if fetch fails
        return [
            {
                title: "Falha ao carregar notícias. Tente novamente mais tarde.",
                link: "#",
                date: new Date().toLocaleDateString('pt-BR'),
                source: "Sistema"
            }
        ]
    }
}
