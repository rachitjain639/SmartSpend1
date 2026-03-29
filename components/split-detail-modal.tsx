'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import type { SplitBill } from '@/lib/types'
import { SplitChat } from './split-chat'
import { SplitStatusBadge } from './split-status-badge'
import { formatCurrency } from '@/lib/expense-engine'
import { X, Users } from 'lucide-react'

interface SplitDetailModalProps {
  split: SplitBill | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateBill: (id: string, updates: Partial<SplitBill>) => void
  currentUser?: string
}

export function SplitDetailModal({
  split,
  open,
  onOpenChange,
  onUpdateBill,
  currentUser = 'You'
}: SplitDetailModalProps) {
  if (!split) return null

  const yourShare = split.participants.find(p => p.name === currentUser)?.share || 0
  const totalPaid = split.participants.filter(p => p.paid).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {split.description}
              </DialogTitle>
              <div className="flex items-center gap-3">
                <SplitStatusBadge status={split.status} />
                <span className="text-sm text-muted-foreground">
                  {split.date.toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 border border-border p-1">
            <TabsTrigger value="details" className="data-[state=active]:bg-card">
              Details
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-card">
              Chat
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Amount Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-secondary/30 border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(split.totalAmount)}
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 border border-primary/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">Your Share</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(yourShare)}
                </p>
              </div>
              <div className="rounded-lg bg-secondary/30 border border-border/50 p-4">
                <p className="text-xs text-muted-foreground mb-1">Paid By</p>
                <p className="text-lg font-semibold text-foreground">
                  {split.paidBy}
                </p>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({totalPaid}/{split.participants.length} paid)
              </h3>
              <div className="space-y-2">
                {split.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {participant.name}
                          {participant.name === currentUser && (
                            <span className="text-xs text-muted-foreground ml-2">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Share: {formatCurrency(participant.share)}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      participant.paid
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}>
                      {participant.paid ? 'Paid' : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="mt-6">
            <SplitChat
              messages={split.messages}
              participants={split.participants}
              currentUser={currentUser}
              onSendMessage={(message) => {
                onUpdateBill(split.id, {
                  messages: [...split.messages, message]
                })
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
