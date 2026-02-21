import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer to Cloudinary explicitly providing a folder
 * Returns an object containing the secure_url and public_id
 */
export async function uploadToCloudinary(
    fileBuffer: Buffer,
    folder: string = 'karangtaruna'
): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto', // Automatically detect image or video
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
}

/**
 * Delete a file from Cloudinary using its public_id
 */
export async function deleteFromCloudinary(public_id: string): Promise<any> {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
            public_id,
            {
                // Add this to make sure videos are properly destroyed since cloudinary needs the resource type for videos
                resource_type: public_id.includes('video') || public_id.includes('.mp4') ? 'video' : 'image',
                invalidate: true
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary destruction error:", error);
                    // Don't fully reject if it's already deleted or not found but log it
                    resolve(result);
                } else {
                    resolve(result);
                }
            }
        );
    });
}
