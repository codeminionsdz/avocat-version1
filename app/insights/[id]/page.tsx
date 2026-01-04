'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThumbsUp, ThumbsDown, MessageSquare, AlertCircle, User, Briefcase, Loader2 } from 'lucide-react'
import { LegalInsightWithStats, InsightCategory } from '@/lib/database.types'
import { toast } from '@/hooks/use-toast'

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

export default function InsightDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [insight, setInsight] = useState<LegalInsightWithStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsight()
  }, [params.id])

  const fetchInsight = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/insights/${params.id}`)
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
        // Update local state
        const oldRating = insight.user_rating
        const newInsight = { ...insight, user_rating: rating }
        
        // Adjust counts
        if (oldRating === 'helpful') {
          newInsight.helpful_count--
        } else if (oldRating === 'not_helpful') {
          newInsight.not_helpful_count--
        }
        
        if (rating === 'helpful') {
          newInsight.helpful_count++
        } else {
          newInsight.not_helpful_count++
        }
        
        setInsight(newInsight)
        
        toast({
          title: 'Thank you',
          description: 'Your feedback has been recorded'
        })
      } else if (response.status === 401) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to rate insights',
          variant: 'destructive'
        })
      }
    } catch (error) {
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

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="text-base px-3 py-1">
              {categoryLabel}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(insight.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <CardTitle className="text-3xl mt-4">{insight.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-slate max-w-none">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{insight.content}</p>
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
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t">
          <div className="flex gap-2">
            <Button
              variant={insight.user_rating === 'helpful' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleRate('helpful')}
            >
              <ThumbsUp className="mr-2 h-5 w-5" />
              Helpful ({insight.helpful_count})
            </Button>
            <Button
              variant={insight.user_rating === 'not_helpful' ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleRate('not_helpful')}
            >
              <ThumbsDown className="mr-2 h-5 w-5" />
              Not Helpful ({insight.not_helpful_count})
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            About the Author
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{insight.lawyer_name}</h3>
            {insight.specialization && (
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Briefcase className="h-4 w-4" />
                {insight.specialization}
              </p>
            )}
            {insight.wilaya && (
              <p className="text-sm text-muted-foreground mt-1">
                📍 {insight.wilaya}
              </p>
            )}
          </div>
          
          <div className="flex gap-4 pt-2">
            <Link href={`/lawyer/${insight.lawyer_id}`}>
              <Button variant="outline">
                View Profile
              </Button>
            </Link>
            <Button onClick={handleRequestConsultation}>
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
