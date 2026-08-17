import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok } from "../utils/apiResponse.js";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "velora/products" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

export const uploadImages = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(
      503,
      "Image hosting is not configured yet. Set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in server/.env."
    );
  }
  if (!req.files?.length) throw ApiError.badRequest("No images were provided");

  const results = await Promise.all(req.files.map((file) => uploadBuffer(file.buffer)));
  const images = results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));

  ok(res, { images }, "Images uploaded");
});
