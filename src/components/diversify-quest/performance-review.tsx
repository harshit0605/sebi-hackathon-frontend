"use client"

import type { ComponentType, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGameState } from '@/hooks/use-game-state'
import { PerformanceChart } from '@/components/diversify-quest/performance-chart'
import { Activity, LineChart, TrendingUp, Info } from 'lucide-react'

export function PerformanceReview({ onProceed }: { onProceed: () => void }) {
  const { gameState } = useGameState()
  const lastQuarter = gameState.quarterHistory.at(-1)

  const invested = gameState.portfolio.reduce((sum, h) => sum + h.value, 0)
  const currentValue = invested + gameState.cash
  const totalReturn = gameState.startingCapital > 0
    ? ((currentValue - gameState.startingCapital) / gameState.startingCapital) * 100
    : 0
  const quarterReturn = lastQuarter?.quarterReturn ?? 0
  const isFinalQuarter = gameState.currentQuarter >= 12

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/40 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Portfolio performance review</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* <Badge variant="outline" className="bg-white/60 border-blue-200 text-blue-700">Step 5</Badge> */}
              <Button
                variant="secondary"
                size="sm"
                onClick={onProceed}
                className="gap-1 bg-gradient-to-r from-blue-600 to-emerald-600 text-white"
              >
                {isFinalQuarter ? 'Finish Quest' : 'Proceed to Next Quarter'}
              </Button>
            </div>
          </div>
          <CardTitle className="mt-2 text-xl text-gray-900">How did your portfolio perform?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 p-5 pt-0">
          <div className="grid md:grid-cols-3 gap-4">
            <MetricCard title="Total Return" icon={TrendingUp} accent="emerald">
              <div className={`text-3xl font-extrabold tracking-tight ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-gray-600 mt-2">Cumulative return since you started.</p>
            </MetricCard>

            <MetricCard title="Quarter Return" icon={LineChart} accent="blue">
              <div className={`text-3xl font-extrabold tracking-tight ${quarterReturn >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {quarterReturn >= 0 ? '+' : ''}{quarterReturn.toFixed(2)}%
              </div>
              <p className="text-xs text-gray-600 mt-2">Performance for the current quarter.</p>
            </MetricCard>

            <MetricCard title="Quick Tip" icon={Info} accent="purple">
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li>Compare returns with risk: higher return with lower risk scores is ideal.</li>
                <li>Watch for concentration: large single-stock weights can skew results.</li>
                <li>Use sector balance to smooth volatility across quarters.</li>
              </ul>
            </MetricCard>
          </div>
          <div className="rounded-xl border border-gray-200/60 bg-white/70 p-3 shadow-sm">
            <PerformanceChart />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

type IconType = ComponentType<{ className?: string }>

type MetricCardProps = {
  title: string
  icon: IconType
  children: ReactNode
  accent?: 'blue' | 'emerald' | 'purple'
}

function MetricCard({ title, icon: Icon, children, accent = 'blue' }: MetricCardProps) {
  const accentMap: Record<string, { bg: string; border: string; chip: string; icon: string }> = {
    blue: {
      bg: 'from-blue-50/70 to-cyan-50/40',
      border: 'border-blue-200/60',
      chip: 'bg-blue-100/70 text-blue-700 border-blue-200',
      icon: 'text-blue-600'
    },
    emerald: {
      bg: 'from-emerald-50/70 to-teal-50/40',
      border: 'border-emerald-200/60',
      chip: 'bg-emerald-100/70 text-emerald-700 border-emerald-200',
      icon: 'text-emerald-600'
    },
    purple: {
      bg: 'from-purple-50/70 to-pink-50/40',
      border: 'border-purple-200/60',
      chip: 'bg-purple-100/70 text-purple-700 border-purple-200',
      icon: 'text-purple-600'
    }
  }

  const colors = accentMap[accent]

  return (
    <div className={`relative overflow-hidden rounded-xl border ${colors.border} bg-white/50 backdrop-blur-md shadow-md p-4`}>
      <div className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${colors.bg}`} />
      <div className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-white/60 text-gray-700">
        <span className={`w-2 h-2 rounded-full ${colors.chip}`} />
        Metric
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colors.icon}`} />
        <span className="text-base font-semibold text-gray-800">{title}</span>
      </div>
      {children}
    </div>
  )
}
