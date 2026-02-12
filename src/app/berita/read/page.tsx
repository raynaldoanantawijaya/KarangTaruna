import { load } from 'cheerio';
import { Metadata } from 'next';

interface NewsDetail {
    title: string;
    image: string;
    body: string | string[]; // Paragraphs array OR HTML string
    date: string;
    author: string;
    source?: string;
    link?: string;
    time?: string;
}

import { INTERNAL_ARTICLES, NewsDetail } from '@/data/articles';

// Dictionary of Internal Static Articles for SEO (Moved to @/data/articles.ts)
// Retaining export for compatibility if needed (though direct import is preferred)
export { INTERNAL_ARTICLES };



async function getExternalNews(url: string): Promise<NewsDetail | null> {
    try {
        if (!url || !url.startsWith('http')) {
            return null;
        }

        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch ${url} `);
        }

        const html = await res.text();
        const $ = load(html);

        const title = $('h1').first().text().trim();

        // Prioritize Open Graph image, then Twitter image, then specific content selectors
        let image = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') ||
            $('.detail_media img').attr('src') ||
            $('.read__photo img').attr('src') ||
            $('.pic_artikel img').attr('src') ||
            $('figure img').first().attr('src') ||
            '';

        const body: string[] = [];

        // Try to find the article body container
        const bodyContent = $('.detail_text, .read__content, .article-content, .post-content, .bk-content, .story-body__content, .read__content-body').first();

        if (bodyContent.length > 0) {
            bodyContent.find('p').each((_, el) => {
                const text = $(el).text().trim();
                // Filter content
                if (text && !text.includes('SCROLL TO CONTINUE') && !text.includes('ADVERTISEMENT') && !text.includes('Baca juga:')) {
                    body.push(text);
                }
            });
        } else {
            // Fallback: get all paragraphs that look like content
            $('p').each((_, el) => {
                const text = $(el).text().trim();
                // Heuristic: Content paragraphs are usually longer
                if (text.length > 60) body.push(text);
            });
        }

        return {
            title,
            image,
            body,
            date: $('.date, .read__time, .time').first().text().trim(),
            author: $('.author, .read__author, .editor').first().text().trim()
        };
    } catch (error) {
        console.error("Scraping Error:", error);
        return null;
    }
}

// Generate Metadata for SEO
export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
    const resolvedSearchParams = await searchParams;
    const url = resolvedSearchParams.url as string;
    const id = resolvedSearchParams.id as string; // Support ID param too

    // Check Internal dictionary
    const target = url || id;
    const internalArticle = INTERNAL_ARTICLES[target];

    if (internalArticle) {
        return {
            title: `${internalArticle.title} - Karang Taruna Asta Wira Dipta`,
            description: internalArticle.title, // Use title as description or truncate body in real app
            openGraph: {
                title: internalArticle.title,
                description: "Berita dan Artikel Karang Taruna Asta Wira Dipta, Kelurahan Mojo, Surakarta.",
                images: [internalArticle.image],
                type: 'article',
                authors: [internalArticle.author]
            }
        }
    }

    return {
        title: "Baca Berita - Karang Taruna Asta Wira Dipta",
        description: "Portal Berita dan Informasi Terkini Karang Taruna Asta Wira Dipta."
    }
}

export default async function ReadNews({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const url = resolvedSearchParams.url as string;

    // Support for ID param if URL is missing (fallback for some internal routing?)
    const id = resolvedSearchParams.id as string;
    const effectiveUrl = url || id;

    if (!effectiveUrl) return <div className="p-8 text-center">URL Invalid (Missing URL or ID)</div>;

    // 1. Cek Apakah URL adalah internal slug
    let detail = INTERNAL_ARTICLES[effectiveUrl];

    // 2. Jika bukan internal, coba fetch eksternal
    if (!detail) {
        detail = await getExternalNews(url) as NewsDetail;
    }

    if (!detail) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <h2 className="text-xl font-bold mb-4">Gagal memuat konten berita secara penuh.</h2>
                <p className="mb-6 text-gray-600">Ada kesalahan saat mengambil data. Silakan buka tautan asli.</p>
                <a href={url} target="_blank" rel="nofollow" className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                    Buka di Sumber Asli
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
            {/* Title - Mobile optimized */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white leading-snug sm:leading-tight">
                {detail.title}
            </h1>

            {/* Meta info - Stacked on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mb-4 sm:mb-6 space-y-1 sm:space-y-0 sm:space-x-4">
                {detail.date && <span className="flex items-center"><svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{detail.date}</span>}
                {detail.author && <span className="flex items-center"><svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{detail.author}</span>}
            </div>

            {/* Featured Image */}
            {detail.image && (
                <div className="mb-6 sm:mb-8 rounded-xl overflow-hidden shadow-lg -mx-4 sm:mx-0">
                    <img
                        src={detail.image}
                        alt={detail.title}
                        className="w-full h-auto object-cover"
                    />
                </div>
            )}

            {/* Article Body - Mobile reading optimized */}
            <div className="prose prose-base sm:prose-lg dark:prose-invert max-w-none 
                text-gray-700 dark:text-gray-300
                prose-p:text-[15px] sm:prose-p:text-base prose-p:leading-relaxed sm:prose-p:leading-loose prose-p:mb-4 sm:prose-p:mb-5
                prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:mt-6 sm:prose-headings:mt-8 prose-headings:mb-3 sm:prose-headings:mb-4
                prose-h3:text-xl sm:prose-h3:text-2xl
                prose-ul:my-3 sm:prose-ul:my-4 prose-ul:pl-4 sm:prose-ul:pl-5
                prose-li:text-[14px] sm:prose-li:text-base prose-li:my-1
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                [&_.bg-gradient-to-r]:p-3 sm:[&_.bg-gradient-to-r]:p-4 [&_.bg-gradient-to-r]:text-[13px] sm:[&_.bg-gradient-to-r]:text-sm
                [&_.grid]:gap-3 sm:[&_.grid]:gap-4
                [&_table]:text-xs sm:[&_table]:text-sm
            ">
                {Array.isArray(detail.body) ? (
                    detail.body.map((p, i) => (
                        <p key={i} className="mb-4 leading-relaxed">{p}</p>
                    ))
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: detail.body }} />
                )}
            </div>

            {/* Structured Data (JSON-LD) for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "NewsArticle",
                        "headline": detail.title,
                        "image": [detail.image],
                        "datePublished": new Date().toISOString(), // In real app, use article date
                        "author": [{
                            "@type": "Organization",
                            "name": detail.author || "Karang Taruna Asta Wira Dipta",
                            "url": "https://astawiradipta.my.id"
                        }]
                    })
                }}
            />

            {/* Source/Footer - Touch friendly */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                {url.startsWith('http') ? (
                    <>
                        <p className="text-sm text-gray-500 mb-3">Sumber: {new URL(url).hostname}</p>
                        <a href={url} target="_blank" rel="nofollow" className="inline-flex items-center bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            Buka di Sumber Asli
                        </a>
                    </>
                ) : (
                    <p className="text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        Sumber: Redaksi Karang Taruna Asta Wira Dipta
                    </p>
                )}
            </div>
        </div>
    );
}
