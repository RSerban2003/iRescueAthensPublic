/**
 * Utilities for handling images in the application
 */

/**
 * Validate and sanitize an image URL or provide a fallback
 * @param imageUrl The image URL to validate
 * @returns A safe image URL
 */
export function validateImageUrl(imageUrl: string): string {
  if (!imageUrl) return '/images/default-phone.jpg';
  
  // Remove potentially harmful content
  const sanitized = imageUrl.replace(/[<>]/g, '');
  
  // Basic validation for common image URLs
  const isValidUrl = /^(https?:\/\/|\/)/i.test(sanitized);
  if (!isValidUrl) return '/images/default-phone.jpg';
  
  return sanitized;
}

/**
 * Parse a JSON string of images and return the first valid image
 * @param imageString JSON string of images or a single image URL
 * @returns The first valid image URL or a default image
 */
export function getFirstImageFromString(imageString: string): string {
  if (!imageString) return '/images/default-phone.jpg';
  
  try {
    const images = JSON.parse(imageString);
    if (Array.isArray(images) && images.length > 0) {
      return validateImageUrl(images[0]);
    } else if (typeof images === 'string') {
      return validateImageUrl(images);
    }
  } catch {
    // If parsing fails, treat the input as a single URL
    return validateImageUrl(imageString);
  }
  
  return '/images/default-phone.jpg';
}

/**
 * Parse a JSON string of images and return an array of valid image URLs
 * @param imageString JSON string of images or a single image URL
 * @returns Array of valid image URLs
 */
export function getAllImagesFromString(imageString: string): string[] {
  if (!imageString) return ['/images/default-phone.jpg'];
  
  try {
    const images = JSON.parse(imageString);
    if (Array.isArray(images)) {
      return images.map(validateImageUrl).filter(Boolean);
    } else if (typeof images === 'string') {
      const validUrl = validateImageUrl(images);
      return validUrl ? [validUrl] : ['/images/default-phone.jpg'];
    }
  } catch {
    // If parsing fails, treat the input as a single URL
    const validUrl = validateImageUrl(imageString);
    return validUrl ? [validUrl] : ['/images/default-phone.jpg'];
  }
  
  return ['/images/default-phone.jpg'];
}

/**
 * Convert an array of image URLs to a JSON string
 * @param imageUrls Array of image URLs
 * @returns JSON string of valid image URLs
 */
export function imagesToJsonString(imageUrls: string[]): string {
  if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return JSON.stringify(['/images/default-phone.jpg']);
  }
  
  const validUrls = imageUrls.map(validateImageUrl).filter(Boolean);
  return JSON.stringify(validUrls.length > 0 ? validUrls : ['/images/default-phone.jpg']);
} 