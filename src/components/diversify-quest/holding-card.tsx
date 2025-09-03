"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { PortfolioHolding } from '@/hooks/use-game-state'

export type HoldingCardProps = {
  holding: PortfolioHolding
  availableCash: number
  onAdd: (amount: number) => void
  onRemove: (amount: number) => void
}

export function HoldingCard({ holding, availableCash, onAdd, onRemove }: HoldingCardProps) {
  const [amount, setAmount] = useState('')
  const [sliderPct, setSliderPct] = useState(0) // percent of holding value to remove
  const [showRebalance, setShowRebalance] = useState(false)
  const [addAmount, setAddAmount] = useState('')
  const [addPct, setAddPct] = useState(0) // percent of available cash to buy
  const [mode, setMode] = useState<'sell' | 'buy'>('sell')
  const currentValue = holding.quantity * holding.stock.price
  const pnl = currentValue - holding.value
  const pnlPercent = (pnl / holding.value) * 100
  const numericAmount = parseFloat(amount) || 0
  const percentOfHolding = currentValue > 0 ? Math.min(100, (numericAmount / currentValue) * 100) : 0
  const numericAdd = parseFloat(addAmount) || 0
  // Compute snapped-to-shares values for allocation
  const price = holding.stock.price
  const sharesFromAmount = Math.floor(numericAdd / price)
  const sharesFromPct = Math.floor(((availableCash * addPct) / 100) / price)
  const effectiveSharesToBuy = Math.max(sharesFromAmount, sharesFromPct)
  const effectiveBuyValue = effectiveSharesToBuy * price
  const percentOfCash = availableCash > 0 ? Math.floor((effectiveBuyValue / availableCash) * 100) : 0
  // For better UX: show user's selected percent even if snapped shares are 0, and hint shares outcome
  const buyPctDisplay = availableCash > 0 ? Math.round(addPct) : 0
  const plannedShares = effectiveSharesToBuy

  const handleRemove = () => {
    const value = parseFloat(amount)
    if (value > 0 && value <= currentValue) {
      onRemove(value)
      setAmount('')
      setSliderPct(0)
    }
  }

  const handleSlider = (vals: number[]) => {
    const pct = Math.min(100, Math.max(0, vals[0] ?? 0))
    setSliderPct(pct)
    const rupees = (currentValue * pct) / 100
    setAmount(rupees ? String(Number(rupees.toFixed(2))) : '')
  }

  const quickSet = (pct: number) => {
    const clamped = Math.min(100, Math.max(0, pct))
    setSliderPct(clamped)
    const rupees = (currentValue * clamped) / 100
    setAmount(rupees ? String(Number(rupees.toFixed(2))) : '')
  }

  const handleAddSlider = (vals: number[]) => {
    const pct = Math.min(100, Math.max(0, vals[0] ?? 0))
    setAddPct(pct)
    const rupees = (availableCash * pct) / 100
    const shares = Math.floor(rupees / price)
    const snapped = shares * price
    setAddAmount(snapped > 0 ? String(Number(snapped.toFixed(2))) : '')
  }

  const quickSetAdd = (pct: number) => {
    const clamped = Math.min(100, Math.max(0, pct))
    setAddPct(clamped)
    const rupees = (availableCash * clamped) / 100
    const shares = Math.floor(rupees / price)
    const snapped = shares * price
    setAddAmount(snapped > 0 ? String(Number(snapped.toFixed(2))) : '')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="border border-gray-200 rounded-xl p-5 bg-white/90 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-lg tracking-tight">{holding.stock.symbol}</h4>
            <Badge variant="secondary" className="text-[11px]">{holding.weight.toFixed(1)}%</Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-gray-900">₹{currentValue.toLocaleString()}</span>
            <span className={cn(
              "text-sm font-semibold",
              pnl >= 0 ? "text-success-600" : "text-danger-600"
            )}>
              {pnl >= 0 ? '+' : ''}₹{pnl.toLocaleString()} ({pnlPercent.toFixed(2)}%)
            </span>
            <span className="ml-3 text-sm px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-700">{holding.quantity} shares</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button size="sm" variant="outline" onClick={() => setShowRebalance((s) => !s)}>
            {showRebalance ? 'Close' : 'Rebalance'}
          </Button>
        </div>
      </div>
      {showRebalance && (
        <div className="mt-3 space-y-3">
          <div className="inline-flex items-center gap-2">
            <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
              <Button
                type="button"
                size="sm"
                variant={mode === 'sell' ? 'default' : 'ghost'}
                className={cn('h-8 px-3 rounded-md', mode === 'sell' && 'bg-gradient-to-r from-amber-500 to-red-500 text-white')}
                onClick={() => setMode('sell')}
              >
                Sell
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === 'buy' ? 'default' : 'ghost'}
                className={cn('h-8 px-3 rounded-md', mode === 'buy' && 'bg-gradient-to-r from-emerald-500 to-green-600 text-white')}
                onClick={() => setMode('buy')}
              >
                Buy
              </Button>
            </div>
            <Tooltip>
              <TooltipTrigger aria-label="What does this do?" className="text-gray-500 hover:text-gray-700">
                <HelpCircle className="w-4 h-4" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[22rem]">
                {mode === 'sell' ? (
                  <span>
                    Sell lets you reduce your position in this stock. Use the slider to pick what percent of the current holding’s value you want to sell. The amount converts to rupees automatically and increases your available cash.
                  </span>
                ) : (
                  <span>
                    Buy invests part of your available cash into this stock. Use the slider to pick what percent of available cash to use. The amount converts to rupees and increases this holding.
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          </div>

          {mode === 'sell' ? (
            <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_auto] items-start gap-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                  <span className="font-medium">Sell</span>
                  <span className="px-2 py-0.5 rounded-full border border-amber-300/50 bg-amber-50 text-amber-700 font-semibold">
                    {percentOfHolding.toFixed(0)}% of holding
                  </span>
                </div>
                <Slider
                  value={[sliderPct]}
                  onValueChange={handleSlider}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="flex items-center gap-1 mt-3">
                  {[10, 25, 50, 100].map(p => (
                    <Button key={p} type="button" variant="outline" size="sm" className="h-7 px-2"
                      onClick={() => quickSet(p)}>
                      {p}%
                    </Button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-gray-500">Choose how much of this holding to sell. Selling converts shares to cash.</p>
              </div>
              <div className="flex items-start gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => {
                    const v = e.target.value
                    const num = parseFloat(v)
                    if (!Number.isFinite(num)) {
                      setAmount(v)
                      setSliderPct(0)
                      return
                    }
                    const clamped = Math.min(Math.max(0, num), currentValue)
                    const next = clamped === 0 ? '' : String(Number(clamped.toFixed(2)))
                    setAmount(next)
                    const pct = currentValue > 0 ? (clamped / currentValue) * 100 : 0
                    setSliderPct(Math.round(pct))
                  }}
                  className="w-28 h-9 text-sm"
                  step="any"
                  max={currentValue}
                />
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={!amount || !Number.isFinite(parseFloat(amount)) || parseFloat(amount) <= 0}
                  className="h-9 px-3"
                  title={currentValue === 0 ? 'Nothing to sell' : undefined}
                >
                  <Minus className="w-3 h-3 mr-1" />
                  Sell
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-[minmax(220px,1fr)_auto] items-start gap-3">
              <div>
                <div className="flex items-center justify-between text-[12px] text-gray-600 mb-1">
                  <span className="font-medium">Buy</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full border border-emerald-300/50 bg-emerald-50 text-emerald-700 font-semibold">
                      {buyPctDisplay}% of cash
                    </span>
                    <span className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                      {plannedShares > 0 ? `${plannedShares} ${plannedShares === 1 ? 'share' : 'shares'}` : '<1 share'}
                    </span>
                  </div>
                </div>
                <Slider
                  value={[addPct]}
                  onValueChange={handleAddSlider}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="flex items-center gap-1 mt-1">
                  {[10, 25, 50, 100].map(p => (
                    <Button key={p} type="button" variant="outline" size="sm" className="h-7 px-2 rounded-full"
                      onClick={() => quickSetAdd(p)}>
                      {p}%
                    </Button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-gray-500">Choose how much of your available cash to invest in this stock.</p>
              </div>
              <div className="flex items-start gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={addAmount}
                  onChange={(e) => {
                    const v = e.target.value
                    const num = parseFloat(v)
                    if (!Number.isFinite(num)) {
                      setAddAmount(v)
                      setAddPct(0)
                      return
                    }
                    const clamped = Math.min(Math.max(0, num), availableCash)
                    const shares = Math.floor(clamped / price)
                    const snapped = shares * price
                    const next = snapped === 0 ? '' : String(Number(snapped.toFixed(2)))
                    setAddAmount(next)
                    const pct = availableCash > 0 ? (snapped / availableCash) * 100 : 0
                    setAddPct(Math.round(pct))
                  }}
                  className="w-28 h-9 text-sm"
                  step="any"
                  max={availableCash}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    // Use snapped effective value
                    const vAmount = effectiveBuyValue
                    if (vAmount > 0) {
                      onAdd(vAmount)
                      setAddAmount('')
                      setAddPct(0)
                    }
                  }}
                  disabled={availableCash < price || effectiveSharesToBuy <= 0}
                  className="h-9 px-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white"
                  title={availableCash === 0 ? 'No available cash' : undefined}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Buy
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
