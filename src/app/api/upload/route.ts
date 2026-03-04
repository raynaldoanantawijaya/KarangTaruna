import { NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Image extensions that should be converted to WebP
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.avif'];

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let buffer: any = Buffer.from(bytes);

        const ext = path.extname(file.name).toLowerCase();

        // Check if the file is an image that should be converted
        const isImage = IMAGE_EXTENSIONS.includes(ext);

        if (isImage) {
            // Convert to WebP with iterative compression to ensure < 100KB
            // Step 1: Resize to max 1200px (good enough for web display)
            let sharpInstance = sharp(buffer)
                .resize({
                    width: 1200,
                    height: 1200,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: 80 });

            buffer = await sharpInstance.toBuffer() as Buffer;

            // Step 2: If still > 100KB, reduce quality progressively
            const MAX_SIZE = 100 * 1024; // 100KB
            const qualities = [70, 60, 50, 40, 30];

            for (const q of qualities) {
                if (buffer.length <= MAX_SIZE) break;
                buffer = await sharp(buffer)
                    .webp({ quality: q })
                    .toBuffer() as Buffer;
            }

            // Step 3: If STILL > 100KB (very rare), resize smaller
            if (buffer.length > MAX_SIZE) {
                buffer = await sharp(buffer)
                    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 40 })
                    .toBuffer() as Buffer;
            }
        }

        // Upload to Cloudinary explicitly providing the 'karangtaruna' folder
        const cloudinaryResult = await uploadToCloudinary(buffer, 'karangtaruna');

        // Return the secure URL and the public_id for future deletion
        return NextResponse.json({
            success: true,
            url: cloudinaryResult.url,
            public_id: cloudinaryResult.public_id
        });
    } catch (error) {
        console.error('Upload to Cloudinary error:', error);
        return NextResponse.json({ error: 'Failed to upload file to Cloudinary' }, { status: 500 });
    }
}
