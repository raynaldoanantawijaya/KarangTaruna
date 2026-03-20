import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import NewsImage from "@/components/NewsImage";
import { adminDb } from '@/lib/firebase-admin';

interface AdminPost {
    id: string;
    title: string;
    slug: string;
    image?: string;
    date: string;
    status: string;
    content?: string;
    createdAt?: string;
}

async function getLatestInternalNews(): Promise<AdminPost[]> {
    try {
        const postsRef = adminDb.collection('posts');
        const snapshot = await postsRef
            .where('status', '==', 'published')
            .orderBy('createdAt', 'desc')
            .limit(2)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<AdminPost, 'id'>)
        }));
    } catch (error) {
        console.error("Failed to fetch latest internal news:", error);
        return [];
    }
}

export default async function LatestNewsSection() {
    const latestNews = await getLatestInternalNews();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <span className="text-primary font-semibold tracking-wider uppercase text-sm">
                        Kabar Desa
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
                        <div key={item.id} className="bg-card-light dark:bg-card-dark rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row h-full md:h-56 group">
                            <div className="md:w-1/3 relative h-48 md:h-full overflow-hidden">
                                <Link href={`/berita/${item.slug}`}>
                                    <NewsImage
                                        alt={item.title}
                                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                                        src={item.image || '/logo-kt.webp'}
                                    />
                                    {index === 0 && (
                                        <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                            Terbaru
                                        </div>
                                    )}
                                </Link>
                            </div>
                            <div className="p-6 md:w-2/3 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 space-x-2">
                                        <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {item.date ? new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'}</span>
                                        <span>•</span>
                                        <span className="flex items-center"><User className="h-3 w-3 mr-1" /> Redaksi</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2">
                                        <Link href={`/berita/${item.slug}`}>
                                            {item.title}
                                        </Link>
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                                        {item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : ''}
                                    </p>
                                </div>
                                <Link
                                    href={`/berita/${item.slug}`}
                                    className="text-primary font-semibold text-sm hover:underline inline-flex items-center"
                                >
                                    Baca Selengkapnya
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">Belum ada berita terbaru.</div>
                )}
            </div>

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
