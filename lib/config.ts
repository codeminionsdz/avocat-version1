/**
 * Application Configuration
 * 
 * Centralized configuration for URLs and environment-specific settings.
 * Handles both development and production environments.
 */

/**
 * Get the base URL for the application
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (production/staging)
 * 2. window.location.origin (client-side fallback)
 * 3. Default localhost (SSR fallback)
 */
export function getBaseUrl(): string {
  // Server-side: use environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  }
  
  // Client-side: prefer env var, fallback to window.location
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
}

/**
 * Get the full URL for a specific path
 * @param path - The path to append (should start with /)
 */
export function getUrl(path: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path}`
}

/**
 * Get the public lawyer profile URL
 * @param lawyerId - The lawyer's user ID
 */
export function getLawyerProfileUrl(lawyerId: string): string {
  return getUrl(`/lawyer/${lawyerId}`)
}

/**
 * Get the legal insight URL
 * @param insightId - The insight ID
 */
export function getInsightUrl(insightId: string): string {
  return getUrl(`/insights/${insightId}`)
}

/**
 * Configuration constants
 */
export const config = {
  site: {
    name: 'Avoca',
    title: 'Avoca – Legal Services in Algeria',
    description: 'Connect with verified lawyers in Algeria. Professional legal marketplace with AI-assisted case classification.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://avocat-dz.online',
  },
  email: {
    from: 'no-reply@avocat-dz.online',
    support: 'support@avocat-dz.online',
  },
  social: {
    // Add social media URLs when available
  },
} as const
