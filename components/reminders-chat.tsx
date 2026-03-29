'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReminderItem } from './reminder-item'
import { ReminderSettings } from './reminder-settings'
import type { Reminder, ChatMessage } from '@/lib/types'
import { Bell, MessageSquare, Send, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface RemindersChatProps {
  reminders: Reminder[]
  chatMessages: ChatMessage[]
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void
  onUpdateReminder: (id: string, updates: Partial<Reminder>) => void
  onSendMessage: (message: Omit<ChatMessage, 'id' | 'isRead' | 'createdAt'>) => void
}

export function RemindersChat({
  reminders,
  chatMessages,
  onAddReminder,
  onUpdateReminder,
  onSendMessage
}: RemindersChatProps) {
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { toast } = useToast()

  const pendingReminders = reminders.filter(r => r.status === 'pending')
  const sentReminders = reminders.filter(r => r.status === 'sent')
  const completedReminders = reminders.filter(r => r.status === 'completed')
  const unreadCount = reminders.filter(r => !r.isRead).length

  const reminderMessages = selectedReminder
    ? chatMessages.filter(m => m.reminderId === selectedReminder.id)
    : []

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReminder || !messageInput.trim()) return

    onSendMessage({
      reminderId: selectedReminder.id,
      sender: 'You',
      text: messageInput,
      timestamp: new Date(),
      type: 'message'
    })

    setMessageInput('')
    toast({
      title: 'Message sent',
      description: `Reminder message sent to ${selectedReminder.title}`
    })
  }

  const handleSendReminder = (reminder: Reminder) => {
    onUpdateReminder(reminder.id, {
      status: 'sent',
      isRead: true
    })

    onSendMessage({
      reminderId: reminder.id,
      sender: 'System',
      text: reminder.message,
      timestamp: new Date(),
      type: 'reminder_sent'
    })

    toast({
      title: 'Reminder Sent',
      description: `Reminder sent for: ${reminder.title}`
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          Reminders & Chat
          {unreadCount > 0 && (
            <span className="ml-2 inline-block px-2 py-1 rounded-full bg-red-500 text-xs text-white font-bold">
              {unreadCount}
            </span>
          )}
        </h2>
        <Button
          onClick={() => setSettingsOpen(true)}
          variant="outline"
          size="icon"
          className="border-border hover:bg-secondary"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-secondary/50 border border-border p-1">
          <TabsTrigger value="pending" className="data-[state=active]:bg-card">
            Pending ({pendingReminders.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-card">
            Sent ({sentReminders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-card">
            Completed ({completedReminders.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-3">
          {pendingReminders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pending reminders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  isSelected={selectedReminder?.id === reminder.id}
                  onSelect={setSelectedReminder}
                  onSendReminder={() => handleSendReminder(reminder)}
                  onMarkComplete={() =>
                    onUpdateReminder(reminder.id, { status: 'completed' })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent" className="space-y-3">
          {sentReminders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sent reminders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sentReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  isSelected={selectedReminder?.id === reminder.id}
                  onSelect={setSelectedReminder}
                  onMarkComplete={() =>
                    onUpdateReminder(reminder.id, { status: 'completed' })
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-3">
          {completedReminders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No completed reminders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedReminders.map(reminder => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  isSelected={selectedReminder?.id === reminder.id}
                  onSelect={setSelectedReminder}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Chat Section */}
      {selectedReminder && (
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4 space-y-4">
          <h3 className="font-semibold text-foreground">{selectedReminder.title}</h3>

          <div className="h-64 bg-background/50 rounded-lg p-4 overflow-y-auto space-y-3 border border-border/30">
            {reminderMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No messages yet
              </div>
            ) : (
              reminderMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`text-sm rounded-lg px-3 py-2 ${
                    msg.sender === 'You'
                      ? 'bg-primary/20 ml-8 text-foreground'
                      : msg.type === 'system'
                      ? 'bg-secondary/50 mx-auto w-fit text-muted-foreground text-xs'
                      : 'bg-background/50 mr-8 text-foreground'
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium">{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p>{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="bg-background border-border text-foreground"
            />
            <Button
              type="submit"
              disabled={!messageInput.trim()}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {/* Settings Modal */}
      <ReminderSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  )
}
