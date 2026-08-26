// Requests an appropriately-sized image instead of downloading the same
// large source for every context (a 300px grid thumbnail doesn't need the
// same bytes as a full-bleed hero shot). Unsplash serves resized variants
// on the fly via query params, so this just rewrites those — any other host
// (Cloudinary uploads, one-off hotlinks) passes through unchanged.
export function resizeImage(url, width) {
  if (!url || !url.includes("images.unsplash.com")) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("q", "75");
    return parsed.toString();
  } catch {
    return url;
  }
}
