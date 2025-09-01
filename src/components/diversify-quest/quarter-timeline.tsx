"use client"

import { useEffect } from 'react'
import { Timeline, type TimelineEntry } from '@/components/ui/timeline'

export type QuarterTimelineProps = {
  currentQuarter: number // 1..12
}

export function QuarterTimeline({ currentQuarter }: QuarterTimelineProps) {
  // Build 12 quarters worth of entries
  const data: TimelineEntry[] = Array.from({ length: 12 }, (_, i) => ({
    title: `Q${i + 1}`,
    content: (
      <div className="h-24 w-full rounded-xl bg-white/70 backdrop-blur-sm border border-brand-200/60 flex items-center px-4">
        <p className="text-sm text-gray-600">
          {i + 1 === currentQuarter ? 'Current quarter' : 'Upcoming milestone'}
        </p>
      </div>
    ),
  }))

  // Scroll only the timeline container to center the active quarter
  useEffect(() => {
    const container = document.getElementById('dq-timeline-container')
    const item = document.getElementById(`dq-timeline-item-${currentQuarter - 1}`)
    if (container && item) {
      const containerRect = container.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      const currentScrollTop = (container as HTMLElement).scrollTop
      const offset = itemRect.top - containerRect.top
      const target = currentScrollTop + offset - containerRect.height / 2 + itemRect.height / 2
      ;(container as HTMLElement).scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
    }
  }, [currentQuarter])

  return (
    <Timeline
      data={data}
      activeIndex={Math.max(0, Math.min(11, currentQuarter - 1))}
      idPrefix="dq-timeline"
      containerId="dq-timeline-container"
      scrollable
      maxHeight={320}
      title=""
      subtitle=""
      className="bg-transparent md:px-0"
    />
  )
}
