'use client'

import { Button } from '@/components/ui/button'
import type { Reminder } from '@/lib/types'
import { Bell, Check, Send, User } from 'lucide-react'

interface ReminderItemProps {
  reminder: Reminder
  isSelected?: boolean
  onSelect?: (reminder: Reminder) => void
  onSendReminder?: () => void
  onMarkComplete?: () => void
}

export function ReminderItem({
  reminder,
  isSelected = false,
  onSelect,
  onSendReminder,
  onMarkComplete
}: ReminderItemProps) {
  const statusColors = {
    pending: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
    sent: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
    completed: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
  }

  return (
    <div
      onClick={() => onSelect?.(reminder)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? 'bg-primary/10 border-primary'
          : 'bg-secondary/30 border-border/50 hover:border-border'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg mt-0.5 ${
              reminder.type === 'split'
                ? 'bg-primary/20'
                : 'bg-secondary/50'
            }`}>
              {reminder.type === 'split' ? (
                <User className="h-4 w-4 text-primary" />
              ) : (
                <Bell className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{reminder.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{reminder.message}</p>
              
              {reminder.members && reminder.members.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {reminder.members.map(member => (
                    <span
                      key={member.id}
                      className={`text-xs px-2 py-1 rounded-full ${
                        member.paid
                          ? 'bg-emerald-500/20 text-emerald-600'
                          : 'bg-amber-500/20 text-amber-600'
                      }`}
                    >
                      {member.name} {member.paid ? '✓' : '⏳'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
            statusColors[reminder.status]
          }`}>
            {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <span className="text-xs text-muted-foreground">
            Due: {reminder.dueDate.toLocaleDateString()}
          </span>

          <div className="flex gap-2">
            {reminder.status === 'pending' && onSendReminder && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onSendReminder()
                }}
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 h-8"
              >
                <Send className="h-3 w-3 mr-1" />
                Send
              </Button>
            )}

            {reminder.status !== 'completed' && onMarkComplete && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkComplete()
                }}
                size="sm"
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 h-8"
              >
                <Check className="h-3 w-3 mr-1" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>

      {!reminder.isRead && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
      )}
    </div>
  )
}
