import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INTERNAL_ARTICLES } from '@/data/articles';

type Props = {
    params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const article = INTERNAL_ARTICLES[params.slug];
    if (!article) return { title: 'Artikel Tidak Ditemukan' };

    return {
        title: `${article.title} | Karang Taruna Kelurahan Mojo`,
        description: `Baca artikel lengkap tentang ${article.title}. Informasi resmi Karang Taruna Asta Wira Dipta, Kelurahan Mojo, Pasar Kliwon, Surakarta.`,
        openGraph: {
            title: article.title,
            description: `Artikel: ${article.title} - Karang Taruna Kelurahan Mojo`,
            images: [article.image],
        }
    }
}

export default function ArticlePage({ params }: Props) {
    const article = INTERNAL_ARTICLES[params.slug];

    if (!article) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link href="/" className="inline-flex items-center text-gray-700 hover:text-primary dark:text-gray-400 dark:hover:text-white">
                                Beranda
                            </Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2 text-gray-400">/</span>
                                <Link href="/berita" className="text-gray-700 hover:text-primary dark:text-gray-400 dark:hover:text-white">
                                    Berita
                                </Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <span className="mx-2 text-gray-400">/</span>
                                <span className="text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs">{article.title}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="relative h-64 md:h-96 w-full">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                            <div className="flex items-center space-x-4 text-white/90 text-sm mb-3">
                                <span className="bg-primary px-3 py-1 rounded-full text-white text-xs font-semibold">Internal</span>
                                <span>{article.date}</span>
                                <span>•</span>
                                <span>{article.author}</span>
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                                {article.title}
                            </h1>
                        </div>
                    </div>

                    <div className="p-6 md:p-10">
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none 
                            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                            prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                            prose-a:text-primary hover:prose-a:text-primary/80
                            prose-strong:text-gray-900 dark:prose-strong:text-white
                            prose-img:rounded-xl prose-img:shadow-lg"
                            dangerouslySetInnerHTML={{ __html: article.body as string }}
                        />
                    </div>
                </article>

                <div className="mt-8 text-center">
                    <Link href="/berita" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl">
                        Kembali ke Daftar Berita
                    </Link>
                </div>
            </div>
        </div>
    );
}
