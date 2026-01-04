/**
 * Share Legal Insight Utility
 * 
 * Professional sharing for educational legal content.
 * Promotes Avoca as the platform while crediting the lawyer.
 */

import type { LegalInsightWithStats } from './database.types'
import { getWilayaName } from './algeria-wilayas'
import { getBaseUrl, getInsightUrl } from './config'

export interface ShareInsightParams {
  insight: LegalInsightWithStats
  baseUrl?: string
}

/**
 * Generates professional share text for a legal insight
 */
export function generateShareText(params: ShareInsightParams): string {
  const { insight, baseUrl } = params
  const finalBaseUrl = baseUrl || getBaseUrl()
  
  // Truncate content to 200 characters for excerpt
  const excerpt = insight.content.length > 200 
    ? insight.content.substring(0, 197) + '...'
    : insight.content
  
  const url = `${finalBaseUrl}/insights/${insight.id}`
  
  // Professional share format
  const shareText = `📚 Legal Insight – ${insight.title}

${excerpt}

✍️ By: ${insight.lawyer_name}
${insight.specialization ? `⚖️ ${insight.specialization}` : ''}
${insight.wilaya ? `📍 ${getWilayaName(insight.wilaya)}` : ''}

⚠️ Disclaimer: This content is for informational purposes only and does not constitute legal advice.

🔗 Read full insight:
${url}

Published via Avoca – Legal Services Platform`
  
  return shareText
}

/**
 * Shares a legal insight using Web Share API or clipboard fallback
 */
export async function shareInsight(params: ShareInsightParams): Promise<{
  success: boolean
  method: 'webshare' | 'clipboard' | 'error'
  message: string
}> {
  const shareText = generateShareText(params)
  const finalBaseUrl = params.baseUrl || getBaseUrl()
  const url = `${finalBaseUrl}/insights/${params.insight.id}`
  
  // Try Web Share API first (mobile/modern browsers)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: `Legal Insight – Avoca`,
        text: shareText,
        url: url
      })
      return {
        success: true,
        method: 'webshare',
        message: 'Shared successfully'
      }
    } catch (err) {
      // User cancelled or error occurred
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          success: false,
          method: 'webshare',
          message: 'Share cancelled'
        }
      }
      // Fall through to clipboard
    }
  }
  
  // Fallback to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText)
      return {
        success: true,
        method: 'clipboard',
        message: 'Link copied to clipboard'
      }
    } catch (err) {
      return {
        success: false,
        method: 'error',
        message: 'Failed to share'
      }
    }
  }
  
  return {
    success: false,
    method: 'error',
    message: 'Sharing not supported'
  }
}
