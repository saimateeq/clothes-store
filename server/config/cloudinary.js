import { v2 as cloudinary } from "cloudinary";

const configured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn(
    "Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in server/.env. " +
      "Image upload routes will return a 503 until then."
  );
}

export const isCloudinaryConfigured = configured;
export default cloudinary;
