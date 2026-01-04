"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({ onSend, placeholder = "Type a message...", disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (!message.trim()) return
    onSend(message)
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!message.trim() || disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
