import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const doc = await adminDb.collection('posts').doc(id).get();
        if (!doc.exists) return new NextResponse('Not found', { status: 404 });
        
        const data = doc.data();
        const image = data?.image;
        if (!image || typeof image !== 'string' || (!image.startsWith('data:image') && !image.startsWith('http'))) {
            return new NextResponse('No valid image', { status: 404 });
        }
        
        // If it's already a URL, redirect to it
        if (image.startsWith('http')) {
            return NextResponse.redirect(image);
        }

        // It's a base64 string: data:image/jpeg;base64,...
        const mimeMatch = image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*?,(.*)/);
        if (!mimeMatch) return new NextResponse('Invalid format', { status: 400 });
        
        const mimeType = mimeMatch[1];
        const base64Data = mimeMatch[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (e) {
        console.error("Error serving post image:", e);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
