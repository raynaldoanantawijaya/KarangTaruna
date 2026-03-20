import { MetadataRoute } from 'next'
import { adminDb } from '@/lib/firebase-admin';

export const revalidate = 3600; // revalidate at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://astawiradipta.my.id'

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/profil`,
            lastModified: new Date('2026-02-20'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/program-kerja`,
            lastModified: new Date('2026-02-20'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/berita`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/bencana`,
            lastModified: new Date('2026-02-23'),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/kontak`,
            lastModified: new Date('2026-02-20'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/alat/pddikti`,
            lastModified: new Date('2026-02-20'),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/alat/youtube`,
            lastModified: new Date('2026-02-20'),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        // Internal Articles Only (artikel internal profil)
        {
            url: `${baseUrl}/berita/internal-profil-kota-surakarta`,
            lastModified: new Date('2026-02-10'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/berita/internal-profil-mojo`,
            lastModified: new Date('2026-02-10'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/berita/internal-sejarah-kelurahan-mojo`,
            lastModified: new Date('2026-02-10'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/berita/internal-profil-pasar-kliwon`,
            lastModified: new Date('2026-02-10'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ];

    let dynamicRoutes: MetadataRoute.Sitemap = [];

    try {
        const postsRef = adminDb.collection('posts');
        const snapshot = await postsRef
            .where('status', '==', 'published')
            .orderBy('createdAt', 'desc')
            .get();

        dynamicRoutes = snapshot.docs.flatMap(doc => {
            const data = doc.data();
            let lastModDate = new Date();
            if (data.updatedAt) {
                lastModDate = new Date(data.updatedAt);
            } else if (data.createdAt) {
                lastModDate = new Date(data.createdAt);
            } else if (data.date) {
                lastModDate = new Date(data.date);
            }

            const slug = data.slug || doc.id;

            return [
                {
                    url: `${baseUrl}/berita/${slug}`,
                    lastModified: lastModDate,
                    changeFrequency: 'weekly' as const,
                    priority: 0.8,
                },
                {
                    url: `${baseUrl}/artikel/${slug}`,
                    lastModified: lastModDate,
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                },
            ];
        });
    } catch (error) {
        console.error("Error fetching dynamic sitemap pages from Firebase:", error);
    }

    return [...staticRoutes, ...dynamicRoutes];
}
