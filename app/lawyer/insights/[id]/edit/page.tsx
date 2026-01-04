'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { InsightCategory, LegalInsight } from '@/lib/database.types'

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

interface EditInsightPageProps {
  params: Promise<{ id: string }>
}

export default function EditInsightPage({ params }: EditInsightPageProps) {
  const router = useRouter()
  const [insightId, setInsightId] = useState<string>('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<InsightCategory>('criminal')
  const [isPublished, setIsPublished] = useState(false)
  const [aiTags, setAiTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([])
  const [clarityCheck, setClarityCheck] = useState<any>(null)
  const [legalAdviceCheck, setLegalAdviceCheck] = useState<any>(null)

  useEffect(() => {
    params.then((resolvedParams) => {
      setInsightId(resolvedParams.id)
      fetchInsight(resolvedParams.id)
    })
  }, [params])

  const fetchInsight = async (id: string) => {
    try {
      const response = await fetch(`/api/insights/${id}`)
      if (response.ok) {
        const data: LegalInsight = await response.json()
        setTitle(data.title)
        setContent(data.content)
        setCategory(data.category)
        setIsPublished(data.is_published)
        setAiTags(data.ai_tags || [])
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load insight',
          variant: 'destructive'
        })
        router.push('/lawyer/insights')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load insight',
        variant: 'destructive'
      })
      router.push('/lawyer/insights')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (title.length < 10 || title.length > 200) {
      toast({
        title: 'Invalid Title',
        description: 'Title must be between 10 and 200 characters',
        variant: 'destructive'
      })
      return
    }

    if (content.length < 100 || content.length > 5000) {
      toast({
        title: 'Invalid Content',
        description: 'Content must be between 100 and 5000 characters',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/insights/${insightId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          is_published: isPublished,
          ai_tags: aiTags
        })
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Insight updated successfully'
        })
        router.push('/lawyer/insights')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAIAssist = async (action: string) => {
    if (!content && action !== 'suggest_titles') {
      toast({
        title: 'Content Required',
        description: 'Please enter some content first',
        variant: 'destructive'
      })
      return
    }

    setAiLoading(true)
    try {
      const response = await fetch('/api/insights/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, title, content })
      })

      if (response.ok) {
        const { result } = await response.json()
        
        switch (action) {
          case 'suggest_titles':
            setTitleSuggestions(result)
            break
          case 'check_clarity':
            setClarityCheck(result)
            break
          case 'detect_legal_advice':
            setLegalAdviceCheck(result)
            break
          case 'suggest_tags':
            setAiTags(result)
            break
        }
      }
    } catch (error) {
      toast({
        title: 'AI Error',
        description: 'Failed to get AI assistance',
        variant: 'destructive'
      })
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Legal Insight</h1>
        <p className="text-muted-foreground mt-2">
          Update your legal knowledge content
        </p>
      </div>

      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-900">
          <strong>Important:</strong> Your insight must be informational only and not constitute legal advice.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as InsightCategory)}>
                <SelectTrigger>
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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="title">Title * (10-200 characters)</Label>
                <span className="text-sm text-muted-foreground">
                  {title.length}/200
                </span>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear, engaging title..."
                maxLength={200}
              />
            </div>

            {content && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAIAssist('suggest_titles')}
                disabled={aiLoading}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Title Suggestions
              </Button>
            )}

            {titleSuggestions.length > 0 && (
              <div className="space-y-2">
                <Label>Suggested Titles (click to use)</Label>
                <div className="space-y-2">
                  {titleSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => {
                        setTitle(suggestion)
                        setTitleSuggestions([])
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>
              Edit your legal insight (100-5000 characters)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Insight Content *</Label>
                <span className="text-sm text-muted-foreground">
                  {content.length}/5000
                </span>
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your legal knowledge..."
                rows={15}
                maxLength={5000}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAIAssist('check_clarity')}
                disabled={aiLoading || !content}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Check Clarity
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAIAssist('detect_legal_advice')}
                disabled={aiLoading || !content}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Check Legal Advice Risk
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAIAssist('suggest_tags')}
                disabled={aiLoading || !content}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Suggest Tags
              </Button>
            </div>

            {clarityCheck && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Clarity Score:</strong> {clarityCheck.score}/10
                    </div>
                    {clarityCheck.issues?.length > 0 && (
                      <div>
                        <strong>Issues:</strong>
                        <ul className="list-disc ml-4 mt-1">
                          {clarityCheck.issues.map((issue: any, idx: number) => (
                            <li key={idx}>
                              <strong>{issue.type}:</strong> "{issue.text}" - {issue.suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-sm">{clarityCheck.overall_feedback}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {legalAdviceCheck && (
              <Alert variant={legalAdviceCheck.risk_level === 'high' || legalAdviceCheck.risk_level === 'medium' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div>
                      <strong>Risk Level:</strong> {legalAdviceCheck.risk_level.toUpperCase()}
                    </div>
                    {legalAdviceCheck.warnings?.length > 0 && (
                      <div>
                        <strong>Warnings:</strong>
                        <ul className="list-disc ml-4 mt-1">
                          {legalAdviceCheck.warnings.map((warning: any, idx: number) => (
                            <li key={idx}>
                              "{warning.text}" - {warning.reason}
                              <br />
                              <em>Suggestion: {warning.suggestion}</em>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="text-sm">{legalAdviceCheck.overall_assessment}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {aiTags.length > 0 && (
              <div className="space-y-2">
                <Label>AI Suggested Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {aiTags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="publish">Published</Label>
                <p className="text-sm text-muted-foreground">
                  Make this insight visible to the public
                </p>
              </div>
              <Switch
                id="publish"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
