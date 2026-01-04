"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  content: string
  timestamp: Date
  isOwn: boolean
  senderName: string
  senderInitials: string
}

export function ChatMessage({ content, timestamp, isOwn, senderName, senderInitials }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3", isOwn && "justify-end")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">{senderInitials}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isOwn ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm",
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        <p className={cn("text-xs mt-1", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {isOwn && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">{senderInitials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
