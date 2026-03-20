import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Info Bencana - Gempa, Cuaca & Kualitas Udara Real-Time',
    description: 'Informasi gempa bumi, cuaca, dan kualitas udara real-time untuk Surakarta dan sekitarnya. Monitoring gempa BMKG, peringatan tsunami, gunung berapi, dan notifikasi otomatis.',
    alternates: {
        canonical: 'https://astawiradipta.my.id/bencana',
    },
    openGraph: {
        title: 'Info Bencana - Gempa, Cuaca & Kualitas Udara',
        description: 'Informasi gempa bumi, cuaca, dan kualitas udara real-time untuk Surakarta dan sekitarnya dari Karang Taruna Asta Wira Dipta.',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Info Bencana - Gempa, Cuaca & Kualitas Udara',
        description: 'Informasi gempa bumi, cuaca, dan kualitas udara real-time untuk Surakarta dan sekitarnya.',
    },
};

export default function BencanaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
