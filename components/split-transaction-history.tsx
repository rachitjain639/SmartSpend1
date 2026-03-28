'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SplitDetailModal } from './split-detail-modal'
import { SplitStatusBadge } from './split-status-badge'
import { formatCurrency } from '@/lib/expense-engine'
import { History, ChevronRight, Users } from 'lucide-react'
import type { SplitBill } from '@/lib/types'

interface SplitTransactionHistoryProps {
  splitBills: SplitBill[]
  onUpdateBill: (id: string, updates: Partial<SplitBill>) => void
}

export function SplitTransactionHistory({
  splitBills,
  onUpdateBill
}: SplitTransactionHistoryProps) {
  const [selectedBill, setSelectedBill] = useState<SplitBill | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'settled'>('all')

  const filteredBills = splitBills.filter(bill => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'pending') return bill.status !== 'settled'
    return bill.status === 'settled'
  })

  const handleBillClick = (bill: SplitBill) => {
    setSelectedBill(bill)
    setModalOpen(true)
  }

  const handleUpdateBill = (updates: Partial<SplitBill>) => {
    if (selectedBill) {
      onUpdateBill(selectedBill.id, updates)
      setSelectedBill({ ...selectedBill, ...updates })
    }
  }

  return (
    <>
      <Card className="bg-card border-border/50 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <History className="h-6 w-6 text-primary" />
                Split History
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                View all your split bills and track settlements
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs defaultValue="all" onValueChange={(v) => setFilterStatus(v as 'all' | 'pending' | 'settled')}>
            <TabsList className="bg-secondary/50 border border-border p-1.5 inline-flex rounded-xl">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-sm"
              >
                All ({splitBills.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-sm"
              >
                Pending ({splitBills.filter(b => b.status !== 'settled').length})
              </TabsTrigger>
              <TabsTrigger
                value="settled"
                className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-lg transition-all duration-200 text-sm"
              >
                Settled ({splitBills.filter(b => b.status === 'settled').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filterStatus} className="space-y-4 mt-6">
              {filteredBills.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                  <p className="text-foreground font-medium">No split bills</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filterStatus === 'all'
                      ? 'Create your first split bill to get started'
                      : `No ${filterStatus} split bills`}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredBills.map((bill) => {
                    const userShare = bill.participants[0]?.share || 0
                    const paidCount = bill.participants.filter(p => p.paid).length
                    const unpaidMembers = bill.participants.filter(p => !p.paid).length

                    return (
                      <div
                        key={bill.id}
                        className="group p-4 rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border/50 backdrop-blur-md hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => handleBillClick(bill)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          {/* Left Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {bill.description}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {bill.date.toLocaleDateString()} · Paid by {bill.paidBy}
                                </p>
                              </div>
                              <SplitStatusBadge status={bill.status} />
                            </div>

                            {/* Split Details */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                              <div className="p-2.5 rounded-lg bg-background/50 border border-border/30">
                                <p className="text-xs text-muted-foreground">Total Amount</p>
                                <p className="text-lg font-bold text-foreground">
                                  ₹{formatCurrency(bill.totalAmount)}
                                </p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-background/50 border border-border/30">
                                <p className="text-xs text-muted-foreground">Your Share</p>
                                <p className="text-lg font-bold text-primary">
                                  ₹{formatCurrency(userShare)}
                                </p>
                              </div>
                            </div>

                            {/* Members Status */}
                            <div className="mt-4 flex items-center gap-2 text-xs">
                              <div className="flex -space-x-1.5">
                                {bill.participants.slice(0, 3).map((participant) => (
                                  <div
                                    key={participant.id}
                                    className="w-6 h-6 rounded-full bg-primary/20 border border-border flex items-center justify-center"
                                  >
                                    <span className="text-xs font-bold text-primary">
                                      {participant.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                ))}
                                {bill.participants.length > 3 && (
                                  <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center">
                                    <span className="text-xs font-bold text-muted-foreground">
                                      +{bill.participants.length - 3}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-muted-foreground">
                                {paidCount} of {bill.participants.length} settled
                              </span>
                            </div>
                          </div>

                          {/* Right Arrow */}
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 flex-shrink-0" />
                        </div>

                        {/* Status Bar */}
                        {unpaidMembers > 0 && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                              {unpaidMembers} member{unpaidMembers !== 1 ? 's' : ''} pending payment
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Card>

      {/* Detail Modal */}
      <SplitDetailModal
        bill={selectedBill}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpdateBill={handleUpdateBill}
      />
    </>
  )
}
