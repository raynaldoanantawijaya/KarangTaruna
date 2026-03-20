import Link from "next/link";
import { ChevronRight, Calendar, User, Tag, ArrowRight } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import NewsImage from "@/components/NewsImage";
import Pagination from "@/components/Pagination";
import { adminDb } from '@/lib/firebase-admin';
import type { Metadata } from 'next';
import { INTERNAL_ARTICLES } from "@/app/berita/[slug]/page";

export const revalidate = 60; // ISR: regenerate every 60 seconds

export const metadata: Metadata = {
    title: "Berita & Artikel - Karang Taruna Asta Wira Dipta",
    description: "Berita terkini, informasi kegiatan, dan artikel inspiratif dari Karang Taruna Asta Wira Dipta Kelurahan Mojo, Surakarta.",
    alternates: {
        canonical: 'https://astawiradipta.my.id/berita',
    },
};


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


import { unstable_cache } from 'next/cache';

const getCachedAdminPosts = unstable_cache(
    async () => {
        try {
            const postsRef = adminDb.collection('posts');
            const snapshot = await postsRef
                .where('status', '==', 'published')
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as Omit<AdminPost, 'id'>)
            }));
        } catch (error) {
            console.error("Error fetching admin posts:", error);
            return [];
        }
    },
    ['published-admin-posts'],
    { revalidate: 60, tags: ['posts'] }
);

async function getAdminPosts(query?: string, categoryFilter?: string): Promise<AdminPost[]> {
    let data = await getCachedAdminPosts();

    if (query) {
        const lowerQuery = query.toLowerCase();
        data = data.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            (item.content && item.content.toLowerCase().includes(lowerQuery))
        );
    }
    
    if (categoryFilter) {
        const filterStr = categoryFilter.toLowerCase();
        data = data.filter(item => {
            const itemCat = String((item as any).category || (item as any).kategori || '').toLowerCase();
            return itemCat.includes(filterStr);
        });
    }
    
    return data;
}

export default async function Berita({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const q = resolvedSearchParams.q as string | undefined;
    const category = resolvedSearchParams.category as string | undefined;

    // Pagination Logic
    const pageParam = resolvedSearchParams.page as string | undefined;
    const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
    const itemsPerPage = 5;

    const adminPosts = await getAdminPosts(q, category);

    const totalItems = adminPosts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Slice data for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedNews = adminPosts.slice(startIndex, endIndex);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="relative overflow-hidden transition-colors duration-500 min-h-[180px] sm:min-h-[220px] md:min-h-[280px] flex flex-col justify-start pt-10 sm:pt-14 md:pt-20 pb-6 sm:pb-8 md:pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                        Berita <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-white to-yellow-100">& Artikel</span>
                    </h1>
                    <p className="text-white/90 dark:text-gray-300 text-sm md:text-base max-w-2xl mx-auto transition-colors">
                        Informasi terkini seputar kegiatan, pengumuman, dan artikel inspiratif Karang Taruna.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Search Bar - Centered Top */}
                <div className="max-w-xl mx-auto mb-12 relative z-20 -mt-10 sm:-mt-12">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-1.5 border border-gray-100 dark:border-gray-700">
                        <SearchInput />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 relative">

                    {/* Main Content: News Grid */}
                    <div className="w-full">

                        {displayedNews.length > 0 ? (
                            <div className="space-y-8">
                                {displayedNews.map((post) => (
                                    <article key={post.id} className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 group h-full">

                                        {/* Image Column */}
                                        <div className="md:w-5/12 relative overflow-hidden h-48 md:h-auto">
                                            <Link href={`/berita/${post.slug}`}>
                                                <NewsImage
                                                    src={post.image || '/logo-kt.webp'}
                                                    alt={post.title}
                                                    className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                    Terbaru
                                                </div>
                                            </Link>
                                        </div>

                                        {/* Content Column */}
                                        <div className="md:w-7/12 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-2">
                                                    <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {post.date ? new Date(post.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center"><User className="h-3 w-3 mr-1" /> Redaksi Internal</span>
                                                </div>

                                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                    <Link href={`/berita/${post.slug}`}>
                                                        {post.title}
                                                    </Link>
                                                </h2>

                                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                                                    {post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : ''}
                                                </p>
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <Link href={`/berita/${post.slug}`} className="inline-flex items-center text-primary font-semibold text-sm hover:underline">
                                                    Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-0.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}

                                {/* Pagination Component */}
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    baseUrl="/berita"
                                    searchParams={resolvedSearchParams}
                                />

                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400">Belum ada berita yang tersedia saat ini.</p>
                            </div>
                        )}

                        {/* SECTION TAMBAHAN: Kabar Profil Statis */}
                        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <span className="bg-secondary w-2 h-8 mr-3 rounded-full"></span>
                                Profil Wilayah & Organisasi
                            </h3>

                            <div className="space-y-6">

                                {/* Item Internal 1 */}
                                <article className="flex flex-col md:flex-row bg-yellow-50 dark:bg-yellow-900/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-yellow-100 dark:border-yellow-900/30 group">
                                    <div className="md:w-5/12 relative overflow-hidden h-48 md:h-auto">
                                        <Link href="/berita/internal-profil-mojo">
                                            <NewsImage
                                                src="/visi-misi.webp"
                                                alt="Profil Karang Taruna Mojo"
                                                className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                Featured
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="md:w-7/12 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-2">
                                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> Baru saja</span>
                                                <span>•</span>
                                                <span className="flex items-center"><User className="h-3 w-3 mr-1" /> Redaksi Internal</span>
                                            </div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                <Link href="/berita/internal-profil-mojo">
                                                    Mengenal Lebih Dekat Karang Taruna Asta Wira Dipta Kelurahan Mojo, Surakarta
                                                </Link>
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                                                Profil lengkap organisasi kepemudaan resmi Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta. Visi, misi, dan program kerja unggulan untuk pemuda Solo.
                                            </p>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-yellow-200 dark:border-yellow-800/30">
                                            <Link href="/berita/internal-profil-mojo" className="inline-flex items-center text-primary font-semibold text-sm hover:underline">
                                                Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>

                                {/* Item Internal 2 - Sejarah Kelurahan Mojo */}
                                <article className="flex flex-col md:flex-row bg-amber-50 dark:bg-amber-900/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-amber-100 dark:border-amber-900/30 group">
                                    <div className="md:w-5/12 relative overflow-hidden h-48 md:h-auto">
                                        <Link href="/berita/internal-sejarah-kelurahan-mojo">
                                            <NewsImage
                                                src="/kelurahan-mojo-history.webp"
                                                alt="Sejarah Kelurahan Mojo"
                                                className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 bg-amber-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                Sejarah
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="md:w-7/12 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-2">
                                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> Baru saja</span>
                                                <span>•</span>
                                                <span className="flex items-center"><User className="h-3 w-3 mr-1" /> Tim Redaksi</span>
                                            </div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                <Link href="/berita/internal-sejarah-kelurahan-mojo">
                                                    Sejarah Kelurahan Mojo: Lahir dari Pemekaran Semanggi Tahun 2018
                                                </Link>
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                                                Kelurahan Mojo terbentuk tahun 2018 dari pemekaran Kelurahan Semanggi. Jalan Kyai Mojo menjadi batas pemisah. Fasilitas seperti RSUD Bung Karno dan Pasar Klithikan kini berada di Mojo.
                                            </p>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-amber-200 dark:border-amber-800/30">
                                            <Link href="/berita/internal-sejarah-kelurahan-mojo" className="inline-flex items-center text-primary font-semibold text-sm hover:underline">
                                                Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>

                                {/* Item Internal 3 - Profil Kecamatan Pasar Kliwon */}
                                <article className="flex flex-col md:flex-row bg-amber-50 dark:bg-amber-900/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-amber-100 dark:border-amber-900/30 group">
                                    <div className="md:w-5/12 relative overflow-hidden h-48 md:h-auto">
                                        <Link href="/berita/internal-profil-pasar-kliwon">
                                            <NewsImage
                                                src="/pasarkliwon.webp"
                                                alt="Kecamatan Pasar Kliwon"
                                                className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 bg-amber-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                Profil Wilayah
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="md:w-7/12 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-2">
                                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> Baru saja</span>
                                                <span>•</span>
                                                <span className="flex items-center"><User className="h-3 w-3 mr-1" /> Redaksi Internal</span>
                                            </div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                <Link href="/berita/internal-profil-pasar-kliwon">
                                                    Menjelajahi Pasar Kliwon: Jantung Budaya dan Perdagangan Kota Surakarta
                                                </Link>
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                                                Kecamatan Pasar Kliwon, rumah bagi Keraton Kasunanan dan Kampung Arab. Pusat perdagangan batik (Klewer, PGS, BTC) dan wisata religi internasional Haul Habib Ali.
                                            </p>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-amber-200 dark:border-amber-800/30">
                                            <Link href="/berita/internal-profil-pasar-kliwon" className="inline-flex items-center text-primary font-semibold text-sm hover:underline">
                                                Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>

                                {/* Item Internal 4 - Profil Kota Surakarta */}
                                <article className="flex flex-col md:flex-row bg-amber-50 dark:bg-amber-900/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-amber-100 dark:border-amber-900/30 group">
                                    <div className="md:w-5/12 relative overflow-hidden h-48 md:h-auto">
                                        <Link href="/berita/internal-profil-kota-surakarta">
                                            <NewsImage
                                                src="/surakarta.webp"
                                                alt="Kota Surakarta"
                                                className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 bg-amber-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                                                Profil Kota
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="md:w-7/12 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 space-x-2">
                                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> Baru saja</span>
                                                <span>•</span>
                                                <span className="flex items-center"><User className="h-3 w-3 mr-1" /> Redaksi Internal</span>
                                            </div>
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                <Link href="/berita/internal-profil-kota-surakarta">
                                                    Profil Kota Surakarta (Solo) Lengkap: Sejarah, Wisata, & 54 Kelurahan
                                                </Link>
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                                                Panduan lengkap Kota Solo: Sejarah Mataram Islam, destinasi wisata, kuliner legendaris, dan profil detail 54 Kelurahan di 5 Kecamatan.
                                            </p>
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-amber-200 dark:border-amber-800/30">
                                            <Link href="/berita/internal-profil-kota-surakarta" className="inline-flex items-center text-primary font-semibold text-sm hover:underline">
                                                Baca Selengkapnya <ChevronRight className="h-4 w-4 ml-0.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}
