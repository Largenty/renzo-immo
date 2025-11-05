'use client'

import { useState } from 'react'
import { Card } from './card'
import { Slider } from './slider'
import { cn } from '../utils/utils'

interface BeforeAfterProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function BeforeAfter({
  beforeImage,
  afterImage,
  beforeLabel = 'Avant',
  afterLabel = 'Après',
  className,
}: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50)

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="relative aspect-[16/9] w-full">
        {/* After Image (background) */}
        <div className="absolute inset-0">
          <img
            src={afterImage}
            alt={afterLabel}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium">
            {afterLabel}
          </div>
        </div>

        {/* Before Image (foreground with clip) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-slate-600 text-white px-3 py-1 rounded-md text-sm font-medium">
            {beforeLabel}
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute inset-y-0 w-1 bg-white shadow-lg"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-1 h-4 bg-slate-400 rounded-full" />
          </div>
        </div>

        {/* Invisible Slider Control */}
        <div className="absolute inset-0 cursor-ew-resize">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          />
        </div>
      </div>
    </Card>
  )
}
