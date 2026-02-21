
import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { checkAuth, logActivity } from '@/lib/activity-logger';
import { checkRateLimitAndKillSwitch } from '@/lib/rate-limit';

const USERS_COLLECTION = 'users';

// Handle dynamic route params correctly for Next.js 15+
interface Params {
    params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: Params) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await checkRateLimitAndKillSwitch(currentUser.id, 'POST');

        const resolvedParams = await params;
        const userId = resolvedParams.id;
        const body = await request.json();
        const { name, password, role, permissions, isBlocked } = body;

        const docRef = adminDb.collection(USERS_COLLECTION).doc(userId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = { id: doc.id, ...doc.data() } as any;

        // FOUNDER PROTECTION FOR UPDATES
        if (user.email === 'anantawijaya212@gmail.com') {
            if (role && role !== 'superadmin') {
                return NextResponse.json({ error: 'Cannot demote the Founder account' }, { status: 403 });
            }
            if (isBlocked === true) {
                return NextResponse.json({ error: 'Cannot block the Founder account' }, { status: 403 });
            }
        }
        const updateData: any = {};

        // Update fields in Firestore
        if (name) updateData.name = name;
        if (role) updateData.role = role;
        if (permissions) updateData.permissions = permissions;
        if (typeof isBlocked === 'boolean') {
            if (user.id === currentUser.id && isBlocked) {
                return NextResponse.json({ error: 'Cannot block your own account' }, { status: 400 });
            }
            updateData.isBlocked = isBlocked;
        }

        // Update Firebase Auth if needed (password, name, or disabled status)
        if (user.uid) {
            const authUpdate: any = {};
            if (password) authUpdate.password = password;
            if (name) authUpdate.displayName = name;
            if (typeof isBlocked === 'boolean') authUpdate.disabled = isBlocked;

            if (Object.keys(authUpdate).length > 0) {
                await adminAuth.updateUser(user.uid, authUpdate);
            }
        }

        await docRef.update(updateData);

        await logActivity(currentUser.id, currentUser.username || currentUser.email, 'UPDATE_USER', `Memperbarui data user: ${user.email}`, request);

        const updatedDoc = await docRef.get();
        const { password: _, ...safeUser } = updatedDoc.data() as any;
        return NextResponse.json({ id: updatedDoc.id, ...safeUser });

    } catch (error: any) {
        if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'KILL_SWITCH_ACTIVATED') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        console.error('Failed to update user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: Params) {
    const currentUser = await checkAuth(request);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await checkRateLimitAndKillSwitch(currentUser.id, 'DELETE');

        const resolvedParams = await params;
        const userId = resolvedParams.id;

        const docRef = adminDb.collection(USERS_COLLECTION).doc(userId);
        const doc = await docRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userToDelete = { id: doc.id, ...doc.data() } as any;

        // Prevent deleting self
        if (userToDelete.id === currentUser.id) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        // Prevent deleting the main superadmin
        if (userToDelete.role === 'superadmin') {
            // Optional: you can relax this if you want superadmins to delete other superadmins,
            // but for ultimate safety, let's keep it restricted.
            // But definitely block deletion of the founder:
            if (userToDelete.email === 'anantawijaya212@gmail.com') {
                return NextResponse.json({ error: 'Cannot delete the Founder account' }, { status: 403 });
            }
        }

        // Delete from Firebase Auth first
        if (userToDelete.uid) {
            try {
                await adminAuth.deleteUser(userToDelete.uid);
            } catch (authError) {
                console.error('Failed to delete from Firebase Auth:', authError);
                // Continue with Firestore deletion even if Auth deletion fails
            }
        }

        // Delete from Firestore
        await docRef.delete();

        await logActivity(currentUser.id, currentUser.username || currentUser.email, 'DELETE_USER', `Menghapus user: ${userToDelete.email}`, request);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        if (error.message === 'RATE_LIMIT_EXCEEDED' || error.message === 'KILL_SWITCH_ACTIVATED') {
            return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
        }
        console.error('Failed to delete user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
