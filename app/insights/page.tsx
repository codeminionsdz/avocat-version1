'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ThumbsUp, ThumbsDown, MessageSquare, AlertCircle, Search, Share2 } from 'lucide-react'
import { LegalInsightWithStats, InsightCategory } from '@/lib/database.types'
import { toast } from '@/hooks/use-toast'
import { shareInsight } from '@/lib/share-utils'
import { getWilayaName } from '@/lib/algeria-wilayas'

const CATEGORIES: { value: InsightCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
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

export default function InsightsPage() {
  const router = useRouter()
  const [insights, setInsights] = useState<LegalInsightWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<InsightCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchInsights()
  }, [category])

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') {
        params.set('category', category)
      }
      
      const response = await fetch(`/api/insights?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async (insightId: string, rating: 'helpful' | 'not_helpful') => {
    try {
      const response = await fetch(`/api/insights/${insightId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update local state with server counts
        setInsights(insights.map(insight => {
          if (insight.id === insightId) {
            return {
              ...insight,
              user_rating: rating,
              helpful_count: data.helpfulCount,
              not_helpful_count: data.notHelpfulCount
            }
          }
          return insight
        }))
        
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

  const handleRequestConsultation = (lawyerId: string) => {
    router.push(`/client/lawyers/${lawyerId}`)
  }

  const handleShare = async (insight: LegalInsightWithStats) => {
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

  const filteredInsights = insights.filter(insight =>
    searchQuery === '' ||
    insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insight.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insight.lawyer_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      <Header title="Legal Insights" />

      <div className="container max-w-6xl py-8 px-4">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Educational legal content from verified lawyers
          </p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Disclaimer:</strong> This content is for informational purposes only and does not constitute legal advice.
            For legal advice specific to your situation, please consult with a lawyer directly.
          </AlertDescription>
        </Alert>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={category} onValueChange={(v) => setCategory(v as InsightCategory | 'all')}>
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading insights...</div>
      ) : filteredInsights.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery || category !== 'all' 
                ? 'No insights found matching your criteria'
                : 'No insights available yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="max-w-full overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <Badge variant="outline" className="w-fit">
                    {CATEGORIES.find(c => c.value === insight.category)?.label}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(insight)
                      }}
                      className="h-8 px-2"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(insight.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-xl md:text-2xl font-bold break-words">{insight.title}</CardTitle>
                <CardDescription className="break-words text-sm">
                  By {insight.lawyer_name}
                  {insight.specialization && ` • ${insight.specialization}`}
                  {insight.wilaya && ` • ${getWilayaName(insight.wilaya)}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground line-clamp-3 break-words text-sm md:text-base">
                  {insight.content}
                </p>
                
                {insight.ai_tags && insight.ai_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {insight.ai_tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {insight.ai_tags.length > 3 && (
                      <Badge variant="secondary">+{insight.ai_tags.length - 3} more</Badge>
                    )}
                  </div>
                )}

                <Button
                  variant="link"
                  className="h-auto p-0 text-primary"
                  onClick={() => router.push(`/insights/${insight.id}`)}
                >
                  Read full insight →
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row gap-3 md:justify-between md:items-center border-t pt-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button
                    variant={insight.user_rating === 'helpful' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRate(insight.id, 'helpful')
                    }}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Helpful ({insight.helpful_count})
                  </Button>
                  <Button
                    variant={insight.user_rating === 'not_helpful' ? 'default' : 'outline'}
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRate(insight.id, 'not_helpful')
                    }}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Not Helpful ({insight.not_helpful_count})
                  </Button>
                </div>
                <Button
                  className="w-full md:w-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRequestConsultation(insight.lawyer_id)
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Request Consultation
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}