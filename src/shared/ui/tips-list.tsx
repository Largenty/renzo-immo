'use client'

import { Card } from './card'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '../utils/utils'

interface TipsListProps {
  title: string
  tips: string[]
  className?: string
}

export function TipsList({ title, tips, className }: TipsListProps) {
  return (
    <Card className={cn('p-6 bg-slate-50 border-slate-200', className)}>
      <h3 className="font-semibold text-slate-900 mb-4">{title}</h3>
      <ul className="space-y-3">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">{tip}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
