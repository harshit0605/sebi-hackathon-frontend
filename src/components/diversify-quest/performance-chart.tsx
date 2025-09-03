"use client"

import { motion } from 'framer-motion'
import { PieChart as PieChartIcon, Activity } from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGameState } from '@/hooks/use-game-state'
import { cn } from '@/lib/utils'

// Sector color helper
const SECTOR_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Banking: '#10b981',
  'Oil & Gas': '#f59e0b',
  Pharmaceuticals: '#8b5cf6',
  Automobiles: '#06b6d4',
  'Consumer Goods': '#ef4444',
  Metals: '#a3e635',
  Infrastructure: '#94a3b8',
  Default: '#64748b',
}

function getSectorColor(sector: string): string {
  return SECTOR_COLORS[sector] ?? SECTOR_COLORS.Default
}

export function PerformanceChart() {
  const { gameState } = useGameState()
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'return' | 'diversification'>('value')

  // Prepare chart data
  const chartData = gameState.quarterHistory.map((quarter) => ({
    quarter: `Q${quarter.quarter}`,
    portfolioValue: quarter.portfolioValue / 100000, // Convert to lakhs
    totalReturn: quarter.totalReturn,
    quarterReturn: quarter.quarterReturn,
    diversificationScore: quarter.diversificationScore,
    riskScore: quarter.riskScore,
  }))

  // Add a baseline point for charts only (not for metrics) when only one quarter exists
  const withBaseline = chartData.length === 1
    ? [
      {
        quarter: 'Start',
        portfolioValue: gameState.startingCapital / 100000,
        totalReturn: 0,
        quarterReturn: 0,
        diversificationScore: chartData[0].diversificationScore,
        riskScore: chartData[0].riskScore,
      },
      chartData[0],
    ]
    : chartData

  // Recompute benchmark after inserting baseline so index 0 equals starting capital
  const chartDataForCharts = withBaseline.map((d, i) => ({
    ...d,
    benchmark: (gameState.startingCapital * Math.pow(1.03, i)) / 100000,
  }))

  // Portfolio composition data
  const portfolioComposition = gameState.portfolio.reduce((acc, holding) => {
    const existing = acc.find(item => item.sector === holding.stock.sector)
    if (existing) {
      existing.value += holding.value
      existing.weight += holding.weight
    } else {
      acc.push({
        sector: holding.stock.sector,
        value: holding.value,
        weight: holding.weight,
        color: getSectorColor(holding.stock.sector)
      })
    }
    return acc
  }, [] as Array<{ sector: string; value: number; weight: number; color: string }>)

  // Top holdings data
  const topHoldings = [...gameState.portfolio]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map(holding => ({
      name: holding.stock.symbol,
      weight: holding.weight,
      value: holding.value,
      pnl: (holding.stock.price - holding.avgPrice) * holding.quantity,
      pnlPercent: ((holding.stock.price - holding.avgPrice) / holding.avgPrice) * 100
    }))

  const currentValue = gameState.portfolio.reduce((sum, holding) => sum + holding.value, 0) + gameState.cash
  const totalReturn = ((currentValue - gameState.startingCapital) / gameState.startingCapital) * 100

  return (
    <div className="space-y-6">

      {/* Main Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Portfolio Performance Chart */}
        <Card className="bg-white/80 backdrop-blur-xl border-brand-200 shadow-md shadow-brand-100/40 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>
                  Track your portfolio value and returns over time
                </CardDescription>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">₹{(chartDataForCharts.at(-1)?.portfolioValue ?? 0).toFixed(1)}L</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${totalReturn >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as 'value' | 'return' | 'diversification')}>
              <TabsList className="grid w-full grid-cols-3 rounded-xl border border-gray-200 bg-white/70 p-1 shadow-inner">
                <TabsTrigger className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white" value="value">Value</TabsTrigger>
                <TabsTrigger className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white" value="return">Returns</TabsTrigger>
                <TabsTrigger className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-blue-500 data-[state=active]:text-white" value="diversification">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="value" className="mt-4">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-b from-slate-50 to-white p-3">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartDataForCharts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `₹${value.toFixed(1)}L`,
                          name === 'portfolioValue' ? 'Portfolio' : 'Benchmark'
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="portfolioValue"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.3}
                        name="Portfolio Value"
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="#6b7280"
                        strokeDasharray="5 5"
                        name="Benchmark"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="return" className="mt-4">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-b from-slate-50 to-white p-3">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartDataForCharts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, 'Return']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="totalReturn"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Total Return"
                      />
                      <Line
                        type="monotone"
                        dataKey="quarterReturn"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Quarterly Return"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="diversification" className="mt-4">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-b from-slate-50 to-white p-3">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartDataForCharts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="diversificationScore"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Diversification Score"
                      />
                      <Line
                        type="monotone"
                        dataKey="riskScore"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Risk Score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Portfolio Composition */}
        <Card className="bg-white/80 backdrop-blur-xl border-brand-200 shadow-md shadow-brand-100/40 hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Portfolio Composition
                </CardTitle>
                <CardDescription>
                  Current sector allocation and diversification
                </CardDescription>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Sectors: {portfolioComposition.length || 0}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">Holdings: {gameState.portfolio.length}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {portfolioComposition.length > 0 ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-gradient-to-b from-slate-50 to-white p-3">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={portfolioComposition}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="weight"
                        label={({ sector, weight }) => `${sector}: ${weight.toFixed(1)}%`}
                      >
                        {portfolioComposition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Weight']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2">
                  {portfolioComposition.map((sector) => (
                    <div key={sector.sector} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sector.color }}
                        />
                        <span className="text-sm font-medium">{sector.sector}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{sector.weight.toFixed(1)}%</div>
                        <div className="text-xs text-gray-500">
                          ₹{(sector.value / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <PieChartIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No portfolio data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Holdings and Performance Metrics side-by-side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Holdings */}
        <Card className="bg-white/80 backdrop-blur-xl border-brand-200 shadow-md shadow-brand-100/40 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Top Holdings</CardTitle>
            <CardDescription>
              Your largest portfolio positions and their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topHoldings.length > 0 ? (
              <div className="space-y-3">
                {topHoldings.map((holding, index) => (
                  <motion.div
                    key={holding.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white/70 backdrop-blur hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full flex items-center justify-center ring-1 ring-inset ring-emerald-300/40">
                        <span className="text-sm font-bold text-gray-700">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{holding.name}</h4>
                        <p className="text-sm text-gray-600">{holding.weight.toFixed(1)}% • ₹{(holding.value / 100000).toFixed(1)}L</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn("font-semibold", holding.pnl >= 0 ? "text-emerald-600" : "text-red-600")}>
                        {holding.pnl >= 0 ? '+' : ''}₹{Math.abs(holding.pnl).toLocaleString()}
                      </div>
                      <div className={cn("text-sm", holding.pnlPercent >= 0 ? "text-emerald-600" : "text-red-600")}>
                        {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No holdings to display</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-white/80 backdrop-blur-xl border-brand-200 shadow-md shadow-brand-100/40 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Detailed analysis of your portfolio performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Returns Analysis</h4>
                <div className="space-y-2 text-sm rounded-lg border border-gray-200 bg-white/60 p-3">
                  <div className="flex justify-between">
                    <span>Total Return:</span>
                    <span className={cn(
                      "font-medium",
                      totalReturn >= 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Best Quarter:</span>
                    <span className="font-medium text-emerald-600">
                      +{(chartData.length ? Math.max(...chartData.map(d => d.quarterReturn)) : 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Worst Quarter:</span>
                    <span className="font-medium text-red-600">
                      {(chartData.length ? Math.min(...chartData.map(d => d.quarterReturn)) : 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Risk Metrics</h4>
                <div className="space-y-2 text-sm rounded-lg border border-gray-200 bg-white/60 p-3">
                  <div className="flex justify-between">
                    <span>Current Risk Score:</span>
                    <span className="font-medium">{gameState.quarterHistory.length > 0 ? gameState.quarterHistory[gameState.quarterHistory.length - 1].riskScore.toFixed(0) : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Concentration:</span>
                    <span className="font-medium">{Math.max(...gameState.portfolio.map(h => h.weight), 0).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sectors Count:</span>
                    <span className="font-medium">{portfolioComposition.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Diversification</h4>
                <div className="space-y-2 text-sm rounded-lg border border-gray-200 bg-white/60 p-3">
                  <div className="flex justify-between">
                    <span>Diversification Score:</span>
                    <span className="font-medium">{gameState.quarterHistory.length > 0 ? gameState.quarterHistory[gameState.quarterHistory.length - 1].diversificationScore.toFixed(0) : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Holdings:</span>
                    <span className="font-medium">{gameState.portfolio.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rebalancing Rate:</span>
                    <span className="font-medium">{gameState.quarterHistory.length - 1}/{gameState.currentQuarter}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

}
