'use client'

import { type ReactNode } from 'react'

interface PageHeaderWithActionProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeaderWithAction({
  title,
  description,
  action,
}: PageHeaderWithActionProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-slate-600">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
