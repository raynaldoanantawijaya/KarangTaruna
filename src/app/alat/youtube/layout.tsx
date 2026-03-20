import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Download YouTube - MP3 & MP4 Converter',
    description: 'Download video YouTube dalam format MP3 atau MP4 secara gratis. Konverter YouTube cepat dan mudah digunakan.',
    alternates: {
        canonical: 'https://astawiradipta.my.id/alat/youtube',
    },
    openGraph: {
        title: 'Download YouTube - MP3 & MP4 Converter',
        description: 'Download video YouTube dalam format MP3 atau MP4 secara gratis.',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'Download YouTube - MP3 & MP4 Converter',
        description: 'Download video YouTube dalam format MP3 atau MP4 secara gratis.',
    },
};

export default function YouTubeLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
