"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Calendar, Trophy, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

export type QuarterHUDProps = {
  currentQuarter: number
  totalQuarters?: number
}

export function QuarterHUD({ currentQuarter, totalQuarters = 12 }: QuarterHUDProps) {
  const pct = Math.min(100, Math.max(0, (currentQuarter / totalQuarters) * 100))
  const year = Math.max(1, Math.min(3, Math.ceil(currentQuarter / 4)))

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-brand-200 shadow-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[13px] text-emerald-700 font-medium">Quarter Journey</p>
                <p className="text-xl font-bold text-gray-900">Q{currentQuarter}/{totalQuarters} • Year {year} of 3</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-300 bg-purple-50">
              <Trophy className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700">Complete all quarters to finish your quest</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600 font-medium">Overall Progress</span>
              <span className="text-xs text-emerald-700 font-semibold">{Math.round(pct)}%</span>
            </div>
            <Progress value={pct} className="h-3 bg-gray-200" />
          </div>

          {/* Quarter markers */}
          <div className="grid grid-cols-12 gap-1.5">
            {Array.from({ length: totalQuarters }).map((_, i) => {
              const q = i + 1
              const state: 'done' | 'current' | 'todo' = q < currentQuarter ? 'done' : q === currentQuarter ? 'current' : 'todo'
              return (
                <motion.div
                  key={q}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.01 * i }}
                  className={cn(
                    'h-3 rounded-sm',
                    state === 'done' && 'bg-gradient-to-r from-emerald-400 to-blue-400',
                    state === 'current' && 'bg-amber-400',
                    state === 'todo' && 'bg-gray-200'
                  )}
                  title={`Quarter ${q}`}
                />
              )
            })}
          </div>

          {/* Quarter actions hint */}
          <div className="flex items-center gap-2 text-[12px] text-gray-600">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Build • Review • Rebalance • Proceed — repeat each quarter</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
