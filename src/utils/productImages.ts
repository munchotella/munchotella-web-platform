/**
 * Munchotella - Local Optimized Product Image Resolver
 * 
 * Maps known heavy external CDN product images (Webflow PNGs ~1.3MB) to lightweight local WebP assets (~104KB).
 * Ensures that live database fetches never regress client performance by overwriting optimized assets.
 */

const LOCAL_OPTIMIZED_PRODUCT_IMAGES: Record<string, string> = {
  "delux crepe": "/images/products/delux-crepe.webp",
  "delux mini waffle": "/images/products/delux-mini-waffle.webp",
  "lotus mini waffle": "/images/products/lotus-mini-waffle.webp",
  "lotus mini waffles": "/images/products/lotus-mini-waffle.webp",
};

/**
 * Returns the optimized local WebP asset path if available, or falls back to the original image URL.
 */
export function getOptimizedProductImage(productName?: string, fallbackUrl?: string): string {
  if (!productName) return fallbackUrl || "";
  const lowerName = productName.toLowerCase().trim();

  for (const [key, localPath] of Object.entries(LOCAL_OPTIMIZED_PRODUCT_IMAGES)) {
    if (lowerName.includes(key)) {
      return localPath;
    }
  }

  return fallbackUrl || "";
}
