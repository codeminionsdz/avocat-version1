'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThumbsUp, ThumbsDown, MessageSquare, AlertCircle, User, Briefcase, Loader2, Share2 } from 'lucide-react'
import { LegalInsightWithStats, InsightCategory } from '@/lib/database.types'
import { toast } from '@/hooks/use-toast'
import { shareInsight } from '@/lib/share-utils'
import { getWilayaName } from '@/lib/algeria-wilayas'

const CATEGORIES: { value: InsightCategory; label: string }[] = [
  { value: 'criminal', label: 'Criminal Law' },
  { value: 'family', label: 'Family Law' },
  { value: 'civil', label: 'Civil Law' },
  { value: 'commercial', label: 'Commercial Law' },
  { value: 'administrative', label: 'Administrative Law' },
  { value: 'labor', label: 'Labor Law' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'intellectual_property', label: 'Intellectual Property' },
  { value: 'tax', label: 'Tax Law' },
  { value: 'other', label: 'Other' }
]

export default function InsightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [insightId, setInsightId] = useState<string>('')
  const [insight, setInsight] = useState<LegalInsightWithStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then((resolvedParams) => {
      setInsightId(resolvedParams.id)
      fetchInsight(resolvedParams.id)
    })
  }, [params])

  const fetchInsight = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/insights/${id}`)
      if (response.ok) {
        const data = await response.json()
        setInsight(data)
      } else if (response.status === 404) {
        toast({
          title: 'Not found',
          description: 'This insight does not exist',
          variant: 'destructive'
        })
        router.push('/insights')
      }
    } catch (error) {
      console.error('Error fetching insight:', error)
      toast({
        title: 'Error',
        description: 'Failed to load insight',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async (rating: 'helpful' | 'not_helpful') => {
    if (!insight) return

    try {
      const response = await fetch(`/api/insights/${insight.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update local state with server counts
        setInsight({
          ...insight,
          user_rating: rating,
          helpful_count: data.helpfulCount,
          not_helpful_count: data.notHelpfulCount
        })
        
        toast({
          title: '✓ Thank you',
          description: 'Your feedback has been recorded'
        })
      } else if (response.status === 401) {
        toast({
          title: '🔐 Sign in required',
          description: 'Please sign in to rate insights',
          variant: 'destructive'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to submit rating',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error rating insight:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit rating',
        variant: 'destructive'
      })
    }
  }

  const handleRequestConsultation = () => {
    if (insight) {
      router.push(`/client/lawyers/${insight.lawyer_id}`)
    }
  }

  const handleShare = async () => {
    if (!insight) return
    
    const result = await shareInsight({ insight })
    
    if (result.success) {
      toast({
        title: '✓ ' + (result.method === 'clipboard' ? 'Copied to clipboard' : 'Shared'),
        description: result.message
      })
    } else if (result.method !== 'webshare') { // Don't show error if user cancelled
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Legal Insight" showBack />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!insight) {
    return null
  }

  const categoryLabel = CATEGORIES.find(c => c.value === insight.category)?.label

  return (
    <div className="min-h-screen">
      <Header title="Legal Insight" showBack />

      <div className="container max-w-4xl py-6 px-4">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Disclaimer:</strong> This content is for informational purposes only and does not constitute legal advice.
            For legal advice specific to your situation, please consult with a lawyer directly.
          </AlertDescription>
        </Alert>

      <Card className="mb-6 max-w-full overflow-hidden">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
            <Badge variant="outline" className="text-base px-3 py-1 w-fit">
              {categoryLabel}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 px-2"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(insight.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl mt-4 break-words hyphens-auto">{insight.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-slate max-w-none">
            <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words">{insight.content}</p>
          </div>
          
          {insight.ai_tags && insight.ai_tags.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm font-semibold mb-2">Topics:</p>
              <div className="flex flex-wrap gap-2">
                {insight.ai_tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-6 border-t">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant={insight.user_rating === 'helpful' ? 'default' : 'outline'}
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => handleRate('helpful')}
            >
              <ThumbsUp className="mr-2 h-5 w-5" />
              Helpful ({insight.helpful_count})
            </Button>
            <Button
              variant={insight.user_rating === 'not_helpful' ? 'default' : 'outline'}
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => handleRate('not_helpful')}
            >
              <ThumbsDown className="mr-2 h-5 w-5" />
              Not Helpful ({insight.not_helpful_count})
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card className="max-w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            About the Author
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg break-words">{insight.lawyer_name}</h3>
            {insight.specialization && (
              <p className="text-muted-foreground flex items-center gap-2 mt-1 break-words">
                <Briefcase className="h-4 w-4 shrink-0" />
                <span className="break-words">{insight.specialization}</span>
              </p>
            )}
            {insight.wilaya && (
              <p className="text-sm text-muted-foreground mt-1 break-words">
                📍 {getWilayaName(insight.wilaya)}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/lawyer/${insight.lawyer_id}`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
            <Button onClick={handleRequestConsultation} className="w-full sm:w-auto">
              <MessageSquare className="mr-2 h-4 w-4" />
              Request Consultation
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
