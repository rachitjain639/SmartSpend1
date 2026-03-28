'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SplitChat } from './split-chat'
import { SplitStatusBadge } from './split-status-badge'
import { formatCurrency } from '@/lib/expense-engine'
import { Bell, MessageCircle, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { SplitBill, SplitMessage } from '@/lib/types'

interface SplitDetailModalProps {
  bill: SplitBill | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateBill: (updates: Partial<SplitBill>) => void
}

export function SplitDetailModal({
  bill,
  open,
  onOpenChange,
  onUpdateBill
}: SplitDetailModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<'chat' | 'details'>('details')

  if (!bill) return null

  const handleSendMessage = (message: SplitMessage) => {
    onUpdateBill({
      messages: [...bill.messages, message]
    })
    toast({
      title: 'Message sent',
      description: `Message from ${message.author}`,
      duration: 2000
    })
  }

  const handleSendReminder = (memberName: string) => {
    const reminderMessage: SplitMessage = {
      id: Math.random().toString(),
      author: 'System',
      text: `Reminder: ${memberName}, please settle your share of ₹${formatCurrency(bill.participants.find(p => p.name === memberName)?.share || 0)}`,
      mentions: [memberName],
      timestamp: new Date(),
      type: 'reminder'
    }

    onUpdateBill({
      messages: [...bill.messages, reminderMessage]
    })

    toast({
      title: 'Reminder sent!',
      description: `Reminder sent to ${memberName}`,
      duration: 2000
    })
  }

  const handleRemindAll = () => {
    const pendingMembers = bill.participants.filter(p => !p.paid)

    pendingMembers.forEach(member => {
      const reminderMessage: SplitMessage = {
        id: Math.random().toString(),
        author: 'System',
        text: `Reminder: ${member.name}, please settle your share of ₹${formatCurrency(member.share)}`,
        mentions: [member.name],
        timestamp: new Date(),
        type: 'reminder'
      }
    })

    const allReminders = pendingMembers.map(member => ({
      id: Math.random().toString(),
      author: 'System',
      text: `Reminder: ${member.name}, please settle your share of ₹${formatCurrency(member.share)}`,
      mentions: [member.name],
      timestamp: new Date(),
      type: 'reminder' as const
    }))

    onUpdateBill({
      messages: [...bill.messages, ...allReminders]
    })

    toast({
      title: 'Reminders sent!',
      description: `Sent reminders to ${pendingMembers.length} pending member${pendingMembers.length !== 1 ? 's' : ''}`,
      duration: 2000
    })
  }

  const unpaidParticipants = bill.participants.filter(p => !p.paid)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center justify-between">
            <span>{bill.description}</span>
            <SplitStatusBadge status={bill.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Chat ({bill.messages.length})
            </button>
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Total Amount */}
              <Card className="bg-secondary/50 border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="text-2xl font-bold text-foreground">
                    ₹{formatCurrency(bill.totalAmount)}
                  </span>
                </div>
              </Card>

              {/* Participants Grid */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Split Details</h3>
                <div className="grid gap-2">
                  {bill.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{participant.name}</span>
                          {participant.paid && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                              Paid
                            </span>
                          )}
                          {!participant.paid && (
                            <span className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {participant.name === bill.paidBy ? 'Paid by' : 'Owes'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-foreground">
                          ₹{formatCurrency(participant.share)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                {unpaidParticipants.length > 0 && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {unpaidParticipants.length} member{unpaidParticipants.length !== 1 ? 's' : ''} pending payment
                    </p>
                    <Button
                      onClick={handleRemindAll}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Remind All
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <SplitChat
              messages={bill.messages}
              participants={bill.participants}
              currentUser="You"
              onSendMessage={handleSendMessage}
              onTagMember={(memberName) => handleSendReminder(memberName)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
