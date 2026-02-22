import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface Post {
    id: string;
    title: string;
    content: string;
    image?: string;
    date?: string;
    createdAt?: string;
    categories?: string[];
    tags?: string[];
    metaTitle?: string;
    metaDesc?: string;
    status?: string;
}

async function getPost(slug: string): Promise<Post | null> {
    try {
        const snapshot = await adminDb
            .collection('posts')
            .where('slug', '==', slug)
            .where('status', '==', 'published')
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Post;
    } catch {
        return null;
    }
}

// ── SEO generateMetadata ────────────────────────────────────────────────────
export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: 'Berita Tidak Ditemukan' };

    const title = post.metaTitle || post.title;
    const description = post.metaDesc || post.title;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: post.image ? [{ url: post.image }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.image ? [post.image] : [],
        },
        keywords: post.tags?.join(', '),
    };
}

// ── Page Component ──────────────────────────────────────────────────────────
export default async function ArtikelDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) notFound();

    const dateStr = post.date || post.createdAt;
    const displayDate = dateStr
        ? new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : '';

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950">
            {/* Hero Image */}
            {post.image && (
                <div className="relative w-full aspect-[21/9] max-h-[500px] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.categories.map((cat) => (
                            <Link
                                key={cat}
                                href={`/berita?kategori=${encodeURIComponent(cat)}`}
                                className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase tracking-wide"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                    {post.title}
                </h1>

                {/* Meta: Date */}
                {displayDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        🗓️ {displayDate}
                    </p>
                )}

                <hr className="border-gray-200 dark:border-gray-800 mb-8" />

                {/* Article Body */}
                <article
                    className="prose prose-lg dark:prose-invert max-w-none
                               prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                               prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                               prose-img:rounded-xl prose-img:shadow-md"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <hr className="border-gray-200 dark:border-gray-800 mt-10 mb-6" />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">🏷️ Tag:</span>
                        {post.tags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/berita?tag=${encodeURIComponent(tag)}`}
                                className="text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary transition-colors"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Back link */}
                <div className="mt-10">
                    <Link
                        href="/berita"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                        ← Kembali ke Berita
                    </Link>
                </div>
            </div>
        </main>
    );
}
