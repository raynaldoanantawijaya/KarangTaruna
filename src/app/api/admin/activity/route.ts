
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { checkAuth } from '@/lib/activity-logger';

const LOGS_COLLECTION = 'activity_logs';

export async function GET(request: Request) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Asynchronous Cleanup: Delete logs older than 30 days in the background
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        adminDb.collection(LOGS_COLLECTION)
            .where('timestamp', '<', thirtyDaysAgo.toISOString())
            .limit(100) // batch delete up to 100 per request to avoid blocking
            .get()
            .then(oldSnapshot => {
                if (!oldSnapshot.empty) {
                    const batch = adminDb.batch();
                    oldSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
                    batch.commit().catch(e => console.error("Batch delete err:", e));
                }
            })
            .catch(err => console.error("Cleanup old logs err:", err));

        const snapshot = await adminDb.collection(LOGS_COLLECTION)
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();

        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(logs);
    } catch (error) {
        console.error('Failed to fetch activity logs:', error);
        return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
    }
}
