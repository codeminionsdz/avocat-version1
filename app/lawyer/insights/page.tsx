'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Eye, EyeOff, ThumbsUp, ThumbsDown } from 'lucide-react'
import { LegalInsight } from '@/lib/database.types'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'

interface InsightWithStats extends LegalInsight {
  helpful_count: number
  not_helpful_count: number
  total_ratings: number
}

export default function LawyerInsightsPage() {
  const router = useRouter()
  const [insights, setInsights] = useState<InsightWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/insights/my?include_unpublished=true')
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
      toast({
        title: 'Error',
        description: 'Failed to load insights',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/insights/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setInsights(insights.filter(i => i.id !== id))
        toast({
          title: 'Success',
          description: 'Insight deleted successfully'
        })
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete insight',
        variant: 'destructive'
      })
    } finally {
      setDeleteId(null)
    }
  }

  const togglePublish = async (insight: InsightWithStats) => {
    const willPublish = !insight.is_published
    
    try {
      const response = await fetch(`/api/insights/${insight.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: willPublish })
      })

      if (response.ok) {
        setInsights(insights.map(i => 
          i.id === insight.id 
            ? { ...i, is_published: willPublish }
            : i
        ))
        toast({
          title: '✅ Success',
          description: willPublish 
            ? '🌟 Insight published! It\'s now visible to all users.' 
            : '📝 Insight unpublished. It\'s now only visible to you.'
        })
      } else {
        const error = await response.json()
        
        if (error.error?.includes('subscription')) {
          toast({
            title: '❌ Subscription Required',
            description: 'You need an active subscription to publish insights.',
            variant: 'destructive'
          })
        } else {
          toast({
            title: '❌ Error',
            description: error.error || 'Failed to update insight',
            variant: 'destructive'
          })
        }
      }
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'Failed to update insight. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      criminal: 'Criminal Law',
      family: 'Family Law',
      civil: 'Civil Law',
      commercial: 'Commercial Law',
      administrative: 'Administrative Law',
      labor: 'Labor Law',
      real_estate: 'Real Estate',
      intellectual_property: 'IP Law',
      tax: 'Tax Law',
      other: 'Other'
    }
    return labels[category] || category
  }

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Legal Insights</h1>
          <p className="text-muted-foreground mt-2">
            Share your legal knowledge with potential clients
          </p>
        </div>
        <Button onClick={() => router.push('/lawyer/insights/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Insight
        </Button>
      </div>

      {insights.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any insights yet.
            </p>
            <Button onClick={() => router.push('/lawyer/insights/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Insight
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={insight.is_published ? 'default' : 'secondary'}>
                        {insight.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoryLabel(insight.category)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-2">{insight.title}</CardTitle>
                    <CardDescription>
                      {new Date(insight.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublish(insight)}
                    >
                      {insight.is_published ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/lawyer/insights/${insight.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(insight.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {insight.content}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{insight.helpful_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className="h-4 w-4" />
                    <span>{insight.not_helpful_count || 0}</span>
                  </div>
                  <span>•</span>
                  <span>{insight.total_ratings || 0} total ratings</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Insight</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this insight? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
