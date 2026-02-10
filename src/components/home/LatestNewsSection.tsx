import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NewsImage from "@/components/NewsImage";

interface NewsItem {
    title: string;
    link: string;
    image: string;
    source: string;
    time: string;
    body: string;
}

async function getLatestNews(): Promise<NewsItem[]> {
    try {
        // Artificial delay for testing skeleton (optional, remove in production if too slow)
        // await new Promise(resolve => setTimeout(resolve, 2000)); 

        const res = await fetch("https://berita-lemon.vercel.app/api/category/terbaru", {
            next: { revalidate: 3600 }
        });

        if (!res.ok) return [];

        const json = await res.json();
        // Return only top 2 items
        return (json.data || []).slice(0, 2);
    } catch (error) {
        console.error("Failed to fetch latest news for homepage:", error);
        return [];
    }
}

export default async function LatestNewsSection() {
    const latestNews = await getLatestNews();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <span className="text-primary font-semibold tracking-wider uppercase text-sm">
                        Informasi Terkini
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        Berita Terbaru
                    </h2>
                    <div className="w-20 h-1 bg-secondary mt-4 rounded-full"></div>
                </div>
                <Link
                    href="/berita"
                    className="hidden md:flex items-center text-primary font-semibold hover:text-primary-dark transition-colors"
                >
                    Lihat Semua Berita <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
            </div>

            <div className="space-y-6">
                {latestNews.length > 0 ? (
                    latestNews.map((item, index) => (
                        <div key={index} className="bg-card-light dark:bg-card-dark rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row h-full md:h-56 group">
                            <div className="md:w-1/3 relative h-48 md:h-full overflow-hidden">
                                <NewsImage
                                    alt={item.title}
                                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                    src={item.image}
                                />
                                {index === 0 && (
                                    <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                        Terbaru
                                    </div>
                                )}
                            </div>
                            <div className="p-6 md:w-2/3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 space-x-2">
                                        <span className="flex items-center">{item.time}</span>
                                        <span>•</span>
                                        <span className="flex items-center">{item.source}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2">
                                        <Link href={`/berita/read?url=${encodeURIComponent(item.link)}`}>
                                            {item.title}
                                        </Link>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                                        {item.body}
                                    </p>
                                </div>
                                <Link
                                    href={`/berita/read?url=${encodeURIComponent(item.link)}`}
                                    className="text-primary font-semibold text-sm hover:underline inline-flex items-center"
                                >
                                    Baca Selengkapnya
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">Belum ada berita terbaru via API.</div>
                )}
            </div>

            {/* Internal News Section moved inside here to stay grouped, OR keep it outside? 
          User only asked to optimize the scraping part. 
          The Internal News is static, so it CAN stay in page.tsx for instant load.
          I will keep Internal News in page.tsx for better perceived performance.
      */}

            <div className="mt-8 text-center md:hidden">
                <Link
                    href="/berita"
                    className="inline-flex items-center text-primary font-semibold hover:text-primary-dark transition-colors"
                >
                    Lihat Semua Berita <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
            </div>
        </section>
    );
}
