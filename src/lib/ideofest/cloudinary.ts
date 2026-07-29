import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Upload a file buffer to Cloudinary under the ideofest folder.
 * Returns the secure URL and public_id.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = 'ideofest/events',
  customFilename?: string,
  resourceType: 'auto' | 'image' | 'raw' = 'auto'
): Promise<{ url: string; publicId: string }> {
  const isSlip = folder === 'ideofest/slips';
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(customFilename ? { public_id: customFilename } : {}),
        // Slips must NOT be resized — preserve full resolution for admin review
        ...(isSlip
          ? {}
          : {
              transformation: [
                { width: 1200, height: 800, crop: 'fill', gravity: 'center', quality: 'auto:good' },
              ],
            }),
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}
