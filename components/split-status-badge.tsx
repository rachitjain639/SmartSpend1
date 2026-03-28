'use client'

import { BadgeCheckIcon, Clock, AlertCircle } from 'lucide-react'

interface SplitStatusBadgeProps {
  status: 'pending' | 'partially_settled' | 'settled'
}

export function SplitStatusBadge({ status }: SplitStatusBadgeProps) {
  const config = {
    pending: {
      label: 'Pending',
      icon: Clock,
      bgColor: 'bg-amber-500/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/30'
    },
    partially_settled: {
      label: 'Partially Settled',
      icon: AlertCircle,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500/30'
    },
    settled: {
      label: 'Settled',
      icon: BadgeCheckIcon,
      bgColor: 'bg-emerald-500/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/30'
    }
  }

  const current = config[status]
  const Icon = current.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${current.bgColor} border ${current.borderColor}`}>
      <Icon className={`h-3.5 w-3.5 ${current.textColor}`} />
      <span className={`text-xs font-medium ${current.textColor}`}>
        {current.label}
      </span>
    </div>
  )
}
