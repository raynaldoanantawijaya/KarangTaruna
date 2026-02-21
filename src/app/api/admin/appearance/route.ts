
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { checkAuth, logActivity } from '@/lib/activity-logger';
import { checkRateLimitAndKillSwitch } from '@/lib/rate-limit';

const SETTINGS_COLLECTION = 'settings';
const APPEARANCE_DOC = 'appearance';

const defaultAppearance = {
    hero: {
        title: "Karang Taruna Asta Wira Dipta",
        subtitle: "Kelurahan Mojo - Surakarta",
        description: "Organisasi kepemudaan resmi tingkat Kelurahan Mojo, Kecamatan Pasar Kliwon, Kota Surakarta (Solo).",
        buttonText: "Gabung Sekarang",
        secondaryButtonText: "Pelajari Lebih Lanjut"
    },
    stats: {
        members: "20",
        membersLabel: "Anggota Aktif",
        programs: "10",
        programsLabel: "Program Terlaksana",
        units: "12",
        unitsLabel: "Unit RW Binaan",
        awards: "3",
        awardsLabel: "Penghargaan"
    },
    vision: "Mewujudkan generasi muda yang mandiri, tangguh, terampil, berakhlak, dan berkualitas dalam pembangunan kesejahteraan sosial.",
    mission: [
        "Mengembangkan potensi generasi muda dan wawasan kebangsaan.",
        "Memperkuat kerjasama antar pemuda dan masyarakat.",
        "Berperan aktif dalam kegiatan sosial dan kemanusiaan."
    ]
};

export async function GET() {
    try {
        const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(APPEARANCE_DOC);
        const doc = await docRef.get();

        if (!doc.exists) {
            // Initialize with default data if document doesn't exist
            await docRef.set(defaultAppearance);
            return NextResponse.json(defaultAppearance);
        }

        return NextResponse.json(doc.data());
    } catch (error) {
        console.error('Failed to read appearance settings:', error);
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await checkRateLimitAndKillSwitch(currentUser.id, 'POST');

        const body = await request.json();
        const docRef = adminDb.collection(SETTINGS_COLLECTION).doc(APPEARANCE_DOC);

        await docRef.set(body, { merge: true });

        await logActivity(
            currentUser.id,
            currentUser.username || currentUser.email,
            'UPDATE_APPEARANCE',
            'Memperbarui pengaturan tampilan (Appearance)',
            request
        );

        return NextResponse.json({ success: true, data: body });
    } catch (error: any) {
        if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'KILL_SWITCH_ACTIVATED') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        console.error('Failed to save appearance settings:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
