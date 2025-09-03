"use client"

import type { ComponentType, ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGameState } from '@/hooks/use-game-state'
import { Shield, Trophy, PieChart, AlertTriangle, CheckCircle, Wand2 } from 'lucide-react'
import { AIGuidance } from '@/components/diversify-quest/ai-guidance'

export function AIReview({ onProceed }: { onProceed: () => void }) {
  const { gameState, useHint } = useGameState()
  const currentQuarterData = gameState.quarterHistory.find(q => q.quarter === gameState.currentQuarter)

  const quizScore = currentQuarterData?.quizScore ?? 0
  const quizPassed = !!currentQuarterData?.quizPassed

  const sectors = gameState.portfolio.reduce<Record<string, number>>((acc, h) => {
    acc[h.stock.sector] = (acc[h.stock.sector] || 0) + h.weight
    return acc
  }, {})
  const sectorsCount = Object.keys(sectors).length
  const maxConcentration = gameState.portfolio.length > 0 ? Math.max(...gameState.portfolio.map(h => h.weight)) : 0
  const lastMetrics = gameState.quarterHistory.at(-1)
  const diversificationScore = lastMetrics?.diversificationScore ?? 0
  const riskScore = lastMetrics?.riskScore ?? 0

  // Simple contextual flags
  const sectorOverConcentrated = Object.values(sectors).some(w => (w as number) > 40)
  const lowHoldings = gameState.portfolio.length > 0 && gameState.portfolio.length < 5
  const isFinalQuarter = gameState.currentQuarter >= 12

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-white/60 backdrop-blur-xl border-white/40 shadow-lg">
        <CardContent className="space-y-6 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wand2 className="w-4 h-4 text-purple-600" />
              <span>AI-generated review</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {/* <Badge variant="outline" className="bg-white/60 border-purple-200 text-purple-700">Step 4</Badge> */}
              <Button
                onClick={onProceed}
                className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:from-purple-700 hover:to-blue-700"
              >
                Proceed to Performance Review
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <SummaryCard title="Quiz Result" icon={Trophy} accent="emerald">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-extrabold tracking-tight text-gray-900">{quizScore}%</div>
                <Badge variant="outline" className={quizPassed ? 'bg-emerald-100/80 text-emerald-700 border-emerald-300' : 'bg-red-100/80 text-red-700 border-red-300'}>
                  {quizPassed ? 'Passed' : 'Failed'}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mt-2">You must pass to unlock rebalancing.</p>
            </SummaryCard>

            <SummaryCard title="Rebalance Summary" icon={PieChart} accent="blue">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">📦 Holdings</span>
                  <span className="font-semibold text-gray-900">{gameState.portfolio.length}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">🏢 Sectors</span>
                  <span className="font-semibold text-gray-900">{sectorsCount}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">🎯 Max Concentration</span>
                  <span className="font-semibold text-gray-900">{maxConcentration.toFixed(1)}%</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-1">🌐 Diversification Score</span>
                  <span className="font-semibold text-gray-900">{diversificationScore.toFixed(0)}</span>
                </li>
              </ul>
            </SummaryCard>

            <SummaryCard title="Risk & Compliance" icon={Shield} accent="purple">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  {(maxConcentration > 25) ? <AlertTriangle className="w-4 h-4 text-red-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  {(maxConcentration > 25) ? 'High single-stock concentration detected (>25%)' : 'No single-stock concentration risk detected'}
                </li>
                <li className="flex items-center gap-2">
                  {sectorOverConcentrated ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  {sectorOverConcentrated ? 'Sector over-concentration detected (>40%)' : 'Balanced sector allocation'}
                </li>
                <li className="flex items-center gap-2">
                  {lowHoldings ? <AlertTriangle className="w-4 h-4 text-blue-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                  {lowHoldings ? 'Consider 8–12 stocks for better diversification' : 'Healthy number of holdings'}
                </li>
                <li className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-600" /> Risk Score: <span className="ml-1 font-semibold text-gray-900">{riskScore.toFixed(0)}</span>
                </li>
              </ul>
            </SummaryCard>
          </div>

          {/* Removed review-complete banner to declutter per design feedback */}

          {/* Integrated AI Guidance (embedded, collapsible hints) */}
          <AIGuidance embedded showSebiPrinciples={false} onUseHint={useHint} hintsRemaining={gameState.hintsRemaining} />
        </CardContent>
      </Card>
    </div>
  )
}

type IconType = ComponentType<{ className?: string }>

type SummaryCardProps = {
  title: string
  icon: IconType
  children: ReactNode
  accent?: 'blue' | 'emerald' | 'purple'
}

function SummaryCard({ title, icon: Icon, children, accent = 'blue' }: SummaryCardProps) {
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
      {/* <div className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-1 rounded-full border bg-white/60 text-gray-700">
        <Wand2 className="w-3.5 h-3.5 text-purple-600" />
        AI
      </div> */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colors.icon}`} />
        <span className="text-base font-semibold text-gray-800">{title}</span>
      </div>
      {children}
    </div>
  )
}
