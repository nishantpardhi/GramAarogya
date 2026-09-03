import { v2 as cloudinary } from 'cloudinary';

let isCloudinaryConfigured = false;

export const getCloudinary = () => {
  if (!isCloudinaryConfigured) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      isCloudinaryConfigured = true;
    }
  }
  return cloudinary;
};

export const uploadBase64Image = async (base64Data: string, folder = 'gramarogya_profiles'): Promise<{ success: boolean; url?: string; error?: string }> => {
  const cld = getCloudinary();
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Return the base64 data directly or fallback data URL if Cloudinary credentials aren't supplied
    return { success: true, url: base64Data };
  }

  try {
    const uploadRes = await cld.uploader.upload(base64Data, {
      folder,
      resource_type: 'auto',
    });
    return { success: true, url: uploadRes.secure_url };
  } catch (err: any) {
    console.error('Cloudinary upload error:', err);
    return { success: false, error: err.message || 'Image upload failed' };
  }
};
