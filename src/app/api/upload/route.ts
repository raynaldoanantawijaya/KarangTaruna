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
            // Convert to WebP with quality reduction and resize
            buffer = await sharp(buffer)
                .resize({
                    width: 1920,
                    height: 1920,
                    fit: 'inside',           // Keep aspect ratio, fit within bounds
                    withoutEnlargement: true  // Don't upscale small images
                })
                .webp({ quality: 80 })
                .toBuffer() as Buffer;
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
