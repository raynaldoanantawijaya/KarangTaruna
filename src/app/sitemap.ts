import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://astawiradipta.my.id'

    return [
        {
            url: baseUrl,
            lastModified: new Date('2026-02-20'),
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
            lastModified: new Date('2026-02-23'),
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
        // Internal Articles Only (artikel internal saja, bukan berita eksternal)
        {
            url: `${baseUrl}/berita/read?url=internal-profil-kota-surakarta`,
            lastModified: new Date('2026-02-10'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/berita/read?url=internal-profil-mojo`,
            lastModified: new Date('2026-02-10'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/berita/read?url=internal-sejarah-kelurahan-mojo`,
            lastModified: new Date('2026-02-10'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/berita/read?url=internal-profil-pasar-kliwon`,
            lastModified: new Date('2026-02-10'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ]
}
