import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function getCloudinaryCredentials() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary server credentials are not configured.');
  }

  return { cloudName, apiKey, apiSecret };
}

function configureCloudinary() {
  const credentials = getCloudinaryCredentials();
  if (configured) return credentials;

  cloudinary.config({
    cloud_name: credentials.cloudName,
    api_key: credentials.apiKey,
    api_secret: credentials.apiSecret,
  });
  configured = true;
  return credentials;
}

export function createImageUploadSignature() {
  const { cloudName, apiKey, apiSecret } = configureCloudinary();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'lahit';
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret);
  return { cloudName, apiKey, folder, timestamp, signature };
}

export async function uploadImageSource(source, options = {}) {
  configureCloudinary();
  return cloudinary.uploader.upload(source, {
    resource_type: 'image',
    folder: 'lahit',
    ...options,
  });
}
