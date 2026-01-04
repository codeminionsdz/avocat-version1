"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, User, AlertTriangle, Loader2, Scale, Building2, BookOpen } from "lucide-react"
import { categoryLabels } from "@/lib/mock-data"
import type { LegalCategory, CourtLevel, LawyerType, LegalInsightWithStats } from "@/lib/database.types"

interface ChatMessage {
  id: string
  role: "ai" | "user"
  content: string
}

interface ClassificationResult {
  category: LegalCategory
  courtLevel: CourtLevel
  requiredLawyerType: LawyerType
  followUpQuestions: string[]
  explanation: string
}

const courtLevelLabels: Record<CourtLevel, string> = {
  first_instance: "First Instance / المحكمة الابتدائية",
  appeal: "Court of Appeal / محكمة الاستئناف",
  supreme_court: "Supreme Court / المحكمة العليا",
  council_of_state: "Council of State / مجلس الدولة",
}

function AIAssistantContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialIssue = searchParams.get("issue") || ""

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [classification, setClassification] = useState<ClassificationResult | null>(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [recommendedInsights, setRecommendedInsights] = useState<LegalInsightWithStats[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)

  useEffect(() => {
    if (initialIssue && !classification) {
      classifyCase(initialIssue)
    }
  }, [initialIssue])

  useEffect(() => {
    if (classification && isComplete) {
      fetchRecommendedInsights()
    }
  }, [classification, isComplete])

  const fetchRecommendedInsights = async () => {
    if (!classification) return
    
    setLoadingInsights(true)
    try {
      const response = await fetch('/api/ai/recommend-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: messages[0]?.content || '',
          category: classification.category,
          limit: 3
        })
      })

      if (response.ok) {
        const { insights } = await response.json()
        setRecommendedInsights(insights || [])
      }
    } catch (error) {
      console.error('Error fetching recommended insights:', error)
    } finally {
      setLoadingInsights(false)
    }
  }

  const classifyCase = async (userMessage: string) => {
    setIsClassifying(true)
    try {
      const response = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage }),
      })

      if (!response.ok) {
        throw new Error("Classification failed")
      }

      const result: ClassificationResult = await response.json()
      setClassification(result)

      // Add user message
      const newMessages: ChatMessage[] = [
        {
          id: "1",
          role: "user",
          content: userMessage,
        },
      ]

      // Add AI classification response
      newMessages.push({
        id: "2",
        role: "ai",
        content: result.explanation,
      })

      // Add first follow-up question if available
      if (result.followUpQuestions.length > 0) {
        newMessages.push({
          id: "3",
          role: "ai",
          content: result.followUpQuestions[0],
        })
      } else {
        setIsComplete(true)
      }

      setMessages(newMessages)
    } catch (error) {
      console.error("Classification error:", error)
      setMessages([
        {
          id: "1",
          role: "user",
          content: userMessage,
        },
        {
          id: "2",
          role: "ai",
          content: "I apologize, but I'm having trouble classifying your case. Please try describing your issue in more detail.",
        },
      ])
    } finally {
      setIsClassifying(false)
    }
  }

  const handleAnswerFollowUp = (answer: string) => {
    const newAnswers = [...answers, answer]
    setAnswers(newAnswers)

    const newMessages: ChatMessage[] = [...messages, { id: `user-${Date.now()}`, role: "user", content: answer }]

    // Move to next question
    if (classification && currentQuestionIndex < classification.followUpQuestions.length - 1) {
      const nextQuestion = classification.followUpQuestions[currentQuestionIndex + 1]
      newMessages.push({
        id: `ai-${Date.now()}`,
        role: "ai",
        content: nextQuestion,
      })
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // All questions answered
      newMessages.push({
        id: `ai-summary-${Date.now()}`,
        role: "ai",
        content: `Thank you for providing additional details. I've gathered enough information to help you find the right lawyer.\n\n**Case Summary:**\n- Category: ${classification ? categoryLabels[classification.category] : "Unknown"}\n- Court Level: ${classification ? courtLevelLabels[classification.courtLevel] : "Unknown"}\n- Additional Details: ${newAnswers.join(", ")}\n\nClick below to find lawyers authorized to handle your case.`,
      })
      setIsComplete(true)
    }

    setMessages(newMessages)
  }

  const handleFindLawyers = () => {
    if (!classification) return
    
    // Pass court level requirement to lawyer search
    router.push(`/client/lawyers?category=${classification.category}&courtLevel=${classification.requiredLawyerType}`)
  }

  const currentFollowUpQuestion = 
    classification && !isComplete && currentQuestionIndex < classification.followUpQuestions.length
      ? classification.followUpQuestions[currentQuestionIndex]
      : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="AI Assistant" showBack />

      {/* Legal Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <span className="text-amber-800">AI classification only - not legal advice</span>
        </div>
      </div>

      {/* Classification Summary */}
      {classification && !isClassifying && (
        <div className="px-4 pt-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Case Classification</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[classification.category]}
                </Badge>
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {courtLevelLabels[classification.courtLevel]}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {isClassifying && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing your case...</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
            {message.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <Card className={`max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : ""}`}>
              <CardContent className="p-3">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </CardContent>
            </Card>
            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Follow-up Questions or Complete */}
      <div className="p-4 border-t border-border bg-card">
        {!isComplete && currentFollowUpQuestion && !isClassifying ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 bg-transparent"
                onClick={() => handleAnswerFollowUp("Yes / نعم")}
              >
                Yes / نعم
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3 px-4 bg-transparent"
                onClick={() => handleAnswerFollowUp("No / لا")}
              >
                No / لا
              </Button>
            </div>
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={() => {
                setIsComplete(true)
                setMessages([
                  ...messages,
                  {
                    id: `skip-${Date.now()}`,
                    role: "ai",
                    content: "No problem. You have enough information to proceed. Click below to find lawyers.",
                  },
                ])
              }}
            >
              Skip remaining questions
            </Button>
          </div>
        ) : isComplete && classification ? (
          <div className="space-y-4">
            {/* Recommended Insights Section */}
            {loadingInsights && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            
            {!loadingInsights && recommendedInsights.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Recommended Legal Insights</span>
                </div>
                <div className="space-y-2">
                  {recommendedInsights.map((insight) => (
                    <Card 
                      key={insight.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => router.push('/insights')}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium line-clamp-2 mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {insight.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {categoryLabels[insight.category as LegalCategory]}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                by {insight.lawyer_name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/insights')}
                >
                  View All Insights
                </Button>
              </div>
            )}
            
            <Button onClick={handleFindLawyers} className="w-full h-12" disabled={!classification}>
              Find Authorized Lawyers
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function AIAssistantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AIAssistantContent />
    </Suspense>
  )
}
