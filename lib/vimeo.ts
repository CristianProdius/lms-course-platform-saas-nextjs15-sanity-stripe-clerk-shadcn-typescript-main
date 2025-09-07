// Utility functions for handling Vimeo URLs and IDs

/**
 * Extract Vimeo video ID from various URL formats
 * Supports:
 * - https://vimeo.com/1115230490
 * - https://player.vimeo.com/video/1115230490
 * - https://player.vimeo.com/video/1115230490?h=4990abe118&badge=0&autopause=0&player_id=0&app_id=58479
 * - Just the ID: 1115230490
 */
export function extractVimeoId(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // If it's already just a numeric ID, return it
  if (/^\d+$/.test(input.trim())) {
    return input.trim();
  }

  // Try to extract ID from various Vimeo URL formats
  const patterns = [
    // https://player.vimeo.com/video/1115230490 (with or without params)
    /(?:player\.)?vimeo\.com\/video\/(\d+)/,
    // https://vimeo.com/1115230490
    /(?:www\.)?vimeo\.com\/(\d+)/,
    // Any other format that has /video/ followed by numbers
    /\/video\/(\d+)/,
    // Just numbers in the string
    /(\d{8,})/  // At least 8 digits to avoid matching other numbers
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Convert Vimeo ID to embed URL
 */
export function vimeoIdToEmbedUrl(vimeoId: string): string {
  return `https://player.vimeo.com/video/${vimeoId}`;
}

/**
 * Convert Vimeo ID to embed URL with custom parameters
 */
export function vimeoIdToEmbedUrlWithParams(
  vimeoId: string, 
  params: Record<string, string | number> = {}
): string {
  const defaultParams = {
    badge: 0,
    autopause: 0,
    player_id: 0,
    app_id: 58479
  };

  const mergedParams = { ...defaultParams, ...params };
  const paramString = new URLSearchParams(
    Object.entries(mergedParams).map(([key, value]) => [key, value.toString()])
  ).toString();

  return `https://player.vimeo.com/video/${vimeoId}?${paramString}`;
}

/**
 * Check if a string looks like a Vimeo URL or ID
 */
export function isVimeoUrlOrId(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  return (
    input.includes('vimeo.com') ||
    /^\d+$/.test(input.trim())
  );
}