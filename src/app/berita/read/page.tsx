import { load } from 'cheerio';

interface NewsDetail {
    title: string;
    image: string;
    body: string[]; // Paragraphs
    date: string;
    author: string;
}

async function getNewsDetail(url: string): Promise<NewsDetail | null> {
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
            throw new Error(`Failed to fetch ${url}`);
        }

        const html = await res.text();
        const $ = load(html);

        const title = $('h1').first().text().trim();

        // Prioritize Open Graph image, then Twitter image, then specific content selectors
        // Also try to find JSON-LD which might have the image
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

export default async function ReadNews({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;
    const url = resolvedSearchParams.url as string;

    if (!url) return <div className="p-8 text-center">URL Invalid</div>;

    const detail = await getNewsDetail(url);

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
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white leading-tight">{detail.title}</h1>

            <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
                {detail.date && <span>{detail.date}</span>}
                {detail.author && <span>Oleh: {detail.author}</span>}
            </div>

            {detail.image && (
                <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                    <img
                        src={detail.image}
                        alt={detail.title}
                        className="w-full h-auto object-cover"
                    />
                </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {detail.body.map((p, i) => (
                    <p key={i} className="mb-4 leading-relaxed">{p}</p>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 mb-2">Sumber: {new URL(url).hostname}</p>
                <a href={url} target="_blank" rel="nofollow" className="text-primary hover:underline font-medium">
                    Lihat artikel asli di sumber pemberitaan
                </a>
            </div>
        </div>
    );
}
