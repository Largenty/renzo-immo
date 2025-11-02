/**
 * ✅ Image Blur Placeholder Utilities
 *
 * Provides utilities to generate blur placeholders for Next.js Image component
 * for improved perceived performance and better UX.
 */

/**
 * Generate a simple blur data URL placeholder
 * This creates a tiny blurred image as base64 data URL
 *
 * @param width - Width of the placeholder
 * @param height - Height of the placeholder
 * @returns Base64 data URL for blur placeholder
 */
export function generateBlurPlaceholder(width = 10, height = 10): string {
  // Create a simple gray gradient SVG
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e2e8f0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#cbd5e1;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `;

  // Convert SVG to base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate a shimmer effect placeholder
 * Creates an animated shimmer effect for loading state
 *
 * @param width - Width of the placeholder
 * @param height - Height of the placeholder
 * @returns Base64 data URL with shimmer animation
 */
export function generateShimmerPlaceholder(width = 700, height = 475): string {
  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f1f5f9" offset="20%" />
          <stop stop-color="#e2e8f0" offset="50%" />
          <stop stop-color="#f1f5f9" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#f1f5f9" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `;

  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;
}

/**
 * Generate a solid color placeholder
 *
 * @param color - Hex color (e.g., "#f1f5f9")
 * @param width - Width of the placeholder
 * @param height - Height of the placeholder
 * @returns Base64 data URL with solid color
 */
export function generateColorPlaceholder(
  color = '#f1f5f9',
  width = 10,
  height = 10
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}" />
    </svg>
  `;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Common placeholder presets for different use cases
 */
export const BLUR_PLACEHOLDERS = {
  // Default gray shimmer
  default: generateShimmerPlaceholder(),

  // Project card placeholder (4:3 ratio)
  projectCard: generateShimmerPlaceholder(800, 600),

  // Image card placeholder (16:9 ratio)
  imageCard: generateShimmerPlaceholder(1920, 1080),

  // Avatar placeholder (square)
  avatar: generateShimmerPlaceholder(200, 200),

  // Solid colors for different contexts
  slate: generateColorPlaceholder('#f1f5f9'),
  blue: generateColorPlaceholder('#dbeafe'),
  green: generateColorPlaceholder('#dcfce7'),
} as const;

/**
 * Usage example:
 *
 * ```tsx
 * import Image from 'next/image';
 * import { BLUR_PLACEHOLDERS } from '@/lib/image-blur-utils';
 *
 * <Image
 *   src={imageUrl}
 *   alt="Project cover"
 *   fill
 *   placeholder="blur"
 *   blurDataURL={BLUR_PLACEHOLDERS.projectCard}
 * />
 * ```
 */
