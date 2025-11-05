'use client'

import { Card } from './card'
import { type LucideIcon } from 'lucide-react'
import { cn } from '../utils/utils'

interface InfoCardProps {
  icon: LucideIcon
  title: string
  description: string
  variant?: 'default' | 'blue' | 'green' | 'orange' | 'purple'
  className?: string
}

const variantStyles = {
  default: 'bg-slate-50 border-slate-200',
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  orange: 'bg-orange-50 border-orange-200',
  purple: 'bg-purple-50 border-purple-200',
}

const iconVariantStyles = {
  default: 'text-slate-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  purple: 'text-purple-600',
}

const titleVariantStyles = {
  default: 'text-slate-900',
  blue: 'text-blue-900',
  green: 'text-green-900',
  orange: 'text-orange-900',
  purple: 'text-purple-900',
}

const descriptionVariantStyles = {
  default: 'text-slate-700',
  blue: 'text-blue-800',
  green: 'text-green-800',
  orange: 'text-orange-800',
  purple: 'text-purple-800',
}

export function InfoCard({
  icon: Icon,
  title,
  description,
  variant = 'default',
  className,
}: InfoCardProps) {
  return (
    <Card className={cn('p-4 border-2', variantStyles[variant], className)}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', iconVariantStyles[variant])} />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className={cn('font-semibold text-sm', titleVariantStyles[variant])}>
            {title}
          </h3>
          <p className={cn('text-sm', descriptionVariantStyles[variant])}>
            {description}
          </p>
        </div>
      </div>
    </Card>
  )
}
