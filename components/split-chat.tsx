'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { generateId } from '@/lib/expense-engine'
import type { SplitMessage, SplitBillParticipant } from '@/lib/types'
import { Send, AtSign, MessageCircle } from 'lucide-react'

interface SplitChatProps {
  messages: SplitMessage[]
  participants: SplitBillParticipant[]
  currentUser: string
  onSendMessage: (message: SplitMessage) => void
  onTagMember: (memberName: string) => void
}

export function SplitChat({
  messages,
  participants,
  currentUser,
  onSendMessage,
  onTagMember
}: SplitChatProps) {
  const [input, setInput] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentions, setMentions] = useState<string[]>([])

  const handleInputChange = (value: string) => {
    setInput(value)
    
    // Detect @ mentions
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true)
    } else if (value.includes('@')) {
      const afterAt = value.substring(lastAtIndex + 1)
      const hasSpace = afterAt.includes(' ')
      if (!hasSpace) {
        setShowMentions(true)
      }
    } else {
      setShowMentions(false)
      setMentions([])
    }
  }

  const handleAddMention = (name: string) => {
    setInput(input + name + ' ')
    setMentions([...mentions, name])
    setShowMentions(false)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const message: SplitMessage = {
      id: generateId(),
      author: currentUser,
      text: input,
      mentions,
      timestamp: new Date(),
      type: 'message'
    }

    onSendMessage(message)
    setInput('')
    setMentions([])
  }

  return (
    <div className="space-y-3">
      <div className="h-[300px] w-full rounded-lg bg-secondary/30 p-4 border border-border/50 overflow-y-auto">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm rounded-lg px-3 py-2 ${
                  msg.author === currentUser
                    ? 'bg-primary/20 ml-8 text-foreground'
                    : 'bg-background/50 mr-8 text-foreground'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-xs">{msg.author}</span>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="mt-1 break-words">{msg.text}</p>
                {msg.mentions.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {msg.mentions.map((mention) => (
                      <span
                        key={mention}
                        className="inline-block text-xs bg-primary/30 text-primary px-2 py-0.5 rounded"
                      >
                        @{mention}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="relative space-y-2">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type @ to mention someone..."
            className="bg-secondary border-border text-foreground pr-10"
          />
          
          {showMentions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
              {participants
                .filter((p) => p.name.toLowerCase().includes(input.slice(input.lastIndexOf('@') + 1).toLowerCase()))
                .map((participant) => (
                  <button
                    key={participant.id}
                    type="button"
                    onClick={() => handleAddMention(participant.name)}
                    className="w-full text-left px-3 py-2 hover:bg-secondary text-foreground flex items-center gap-2 text-sm"
                  >
                    <AtSign className="h-3 w-3 text-primary" />
                    {participant.name}
                  </button>
                ))}
            </div>
          )}
          
          <Button
            type="submit"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
