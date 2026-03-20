import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'PDDIKTI Lookup - Cari Mahasiswa, Dosen & Kampus',
    description: 'Akses data pendidikan tinggi Indonesia secara real-time. Cari mahasiswa, dosen, dan perguruan tinggi di seluruh Indonesia melalui database PDDIKTI Kemendikbudristek.',
    alternates: {
        canonical: 'https://astawiradipta.my.id/alat/pddikti',
    },
    openGraph: {
        title: 'PDDIKTI Lookup - Cari Mahasiswa, Dosen & Kampus',
        description: 'Akses data pendidikan tinggi Indonesia secara real-time dari PDDIKTI Kemendikbudristek.',
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'PDDIKTI Lookup - Cari Mahasiswa, Dosen & Kampus',
        description: 'Akses data pendidikan tinggi Indonesia secara real-time dari PDDIKTI Kemendikbudristek.',
    },
};

export default function PDDIKTILayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
