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
import { ThumbsUp, ThumbsDown, MessageSquare, AlertCircle, Search } from 'lucide-react'
import { LegalInsightWithStats, InsightCategory } from '@/lib/database.types'
import { toast } from '@/hooks/use-toast'

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
        // Update local state
        setInsights(insights.map(insight => {
          if (insight.id === insightId) {
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
            
            return newInsight
          }
          return insight
        }))
        
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

  const handleRequestConsultation = (lawyerId: string) => {
    router.push(`/client/lawyers/${lawyerId}`)
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
            <Card key={insight.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push(`/insights/${insight.id}`)}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">
                    {CATEGORIES.find(c => c.value === insight.category)?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(insight.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <CardTitle className="text-2xl">{insight.title}</CardTitle>
                <CardDescription>
                  By {insight.lawyer_name}
                  {insight.specialization && ` • ${insight.specialization}`}
                  {insight.wilaya && ` • ${insight.wilaya}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {insight.content.length > 200 ? `${insight.content.substring(0, 200)}...` : insight.content}
                </p>
                
                {insight.ai_tags && insight.ai_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
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
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant={insight.user_rating === 'helpful' ? 'default' : 'outline'}
                    size="sm"
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