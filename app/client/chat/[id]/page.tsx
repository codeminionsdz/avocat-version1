"use client"

import { useEffect, useRef, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useConsultation } from "@/lib/hooks/use-consultations"
import type { Message } from "@/lib/database.types"

export default function ClientChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { consultation, isLoading: consultationLoading } = useConsultation(id)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const supabase = createClient()

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    getUser()
  }, [])

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("consultation_id", id)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching messages:", error)
      } else {
        setMessages(data || [])
      }
      setLoading(false)
    }

    fetchMessages()

    // Subscribe to new messages in real-time
    const channel = supabase
      .channel(`messages:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `consultation_id=eq.${id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [id])

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUserId) return

    setSending(true)
    try {
      const { error } = await supabase.from("messages").insert({
        consultation_id: id,
        sender_id: currentUserId,
        content: newMessage.trim(),
        is_read: false,
      })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("فشل إرسال الرسالة / Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (consultationLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">استشارة غير موجودة / Consultation not found</p>
        <Button onClick={() => router.back()}>رجوع / Go Back</Button>
      </div>
    )
  }

  const lawyerName = consultation.lawyerName || "محامي"
  const lawyerInitials = lawyerName.split(" ").map((n) => n[0]).join("").toUpperCase() || "L"

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">{lawyerInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">{lawyerName}</h2>
            <p className="text-xs text-muted-foreground">{consultation.category}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-muted/20">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              لا توجد رسائل بعد
              <br />
              <span className="text-sm">ابدأ المحادثة!</span>
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId
            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isOwn ? "bg-primary text-primary-foreground" : "bg-background border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  <span
                    className={`text-xs mt-1 block ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {new Date(message.created_at).toLocaleTimeString("ar-DZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-background px-4 py-3 sticky bottom-0">
        <div className="flex items-center gap-2">
          <Input
            placeholder="اكتب رسالة... / Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={sending || !newMessage.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
