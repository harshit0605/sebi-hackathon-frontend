"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet } from '@/components/ui/sheet'
import { useGameState, type Stock, type PortfolioHolding } from '@/hooks/use-game-state'
import { Target } from 'lucide-react'
import { AddStocksSheet } from './add-stocks-sheet'
import { HoldingCard } from './holding-card'
import { toast } from 'sonner'
import { ConfettiBurst } from './confetti-burst'

type PortfolioBuilderProps = {
  onRebalance: (holdings: PortfolioHolding[], cashLeft: number) => void
  onProceed: () => void
  onRegisterActions?: (actions: { submit: () => void; skip: () => void }) => void
}

export function PortfolioBuilder({ onRebalance, onProceed, onRegisterActions }: PortfolioBuilderProps) {
  const { gameState, availableStocks, markRebalanced } = useGameState()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [tempPortfolio, setTempPortfolio] = useState<PortfolioHolding[]>(gameState.portfolio)
  // Prefer persisted store cash if present
  const initialInvested = gameState.portfolio.reduce((s, h) => s + h.value, 0)
  const initialCash = typeof (gameState as any).cash === 'number'
    ? (gameState as any).cash
    : Math.max(0, gameState.currentCapital - initialInvested)
  const [availableCash, setAvailableCash] = useState(initialCash)
  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Filtering is handled inside AddStocksSheet

  const totalPortfolioValue = tempPortfolio.reduce((sum, holding) => sum + holding.value, 0)

  // Helper to keep weights consistent after any change
  const recalcWeights = (holdings: PortfolioHolding[]) => {
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
    if (totalValue <= 0) return holdings
    return holdings.map(h => ({
      ...h,
      weight: (h.value / totalValue) * 100,
    }))
  }

  // Calculate portfolio metrics
  const sectorAllocation = tempPortfolio.reduce((acc, holding) => {
    acc[holding.stock.sector] = (acc[holding.stock.sector] || 0) + holding.weight
    return acc
  }, {} as Record<string, number>)

  const diversificationScore = calculateDiversificationScore(tempPortfolio)
  const concentrationRisk = Math.max(...tempPortfolio.map(h => h.weight), 0)
  // Current quarter events are displayed on the main page's sidebar; not needed here

  useEffect(() => {
    // Sync holdings from store, but do NOT overwrite local available cash
    setTempPortfolio(recalcWeights(gameState.portfolio))
  }, [gameState.portfolio])

  // Persist available cash across remounts for continuity
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('dq_available_cash') : null
      if (saved != null) {
        const n = Number(saved)
        if (Number.isFinite(n) && n >= 0 && n <= gameState.currentCapital) {
          setAvailableCash(n)
        }
      }
    } catch { }
    // run only on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('dq_available_cash', String(availableCash))
      }
    } catch { }
  }, [availableCash])

  // Reset available cash on brand new game start
  useEffect(() => {
    if (gameState.isStarted && gameState.currentQuarter === 1 && gameState.portfolio.length === 0) {
      const init = Math.max(0, gameState.currentCapital)
      setAvailableCash(init)
      try { if (typeof window !== 'undefined') window.localStorage.setItem('dq_available_cash', String(init)) } catch { }
    }
  }, [gameState.isStarted, gameState.currentQuarter, gameState.portfolio.length, gameState.currentCapital])

  const addToPortfolio = (stock: Stock, amount: number) => {
    // Enforce whole-share buys; snap down to nearest multiple of stock.price
    const investCap = Math.min(Math.max(0, amount), availableCash)
    const maxShares = Math.floor(investCap / stock.price)
    if (maxShares <= 0) return
    const quantity = maxShares
    const value = quantity * stock.price

    setTempPortfolio((prev: PortfolioHolding[]) => {
      const existingIndex = prev.findIndex(h => h.stock.id === stock.id)
      if (existingIndex >= 0) {
        const existing = prev[existingIndex]
        const newQuantity = existing.quantity + quantity
        const newValue = existing.value + value
        const newAvgPrice = newValue / newQuantity
        const updated = [...prev]
        updated[existingIndex] = {
          ...existing,
          quantity: newQuantity,
          value: newValue,
          avgPrice: newAvgPrice,
        }
        return recalcWeights(updated)
      } else {
        const newHolding: PortfolioHolding = {
          stock,
          quantity,
          value,
          weight: 0,
          avgPrice: stock.price
        }
        return recalcWeights([...prev, newHolding])
      }
    })
    setAvailableCash((prev: number) => prev - value)
  }

  const removeFromPortfolio = (stockId: string, amount: number) => {
    const existingIndex = tempPortfolio.findIndex(h => h.stock.id === stockId)
    if (existingIndex < 0) return

    const existing = tempPortfolio[existingIndex]
    // Remove whole shares to keep portfolio integral
    const quantityToRemove = Math.min(Math.floor(amount / existing.stock.price), Math.floor(existing.quantity))
    const valueToRemove = quantityToRemove * existing.stock.price

    if (quantityToRemove >= existing.quantity) {
      // Remove entire holding
      const updated = tempPortfolio.filter((_, i) => i !== existingIndex)
      setTempPortfolio(recalcWeights(updated))
    } else {
      // Reduce holding
      const updated = [...tempPortfolio]
      updated[existingIndex] = {
        ...existing,
        quantity: existing.quantity - quantityToRemove,
        value: existing.value - valueToRemove,
        weight: existing.weight,
      }
      setTempPortfolio(recalcWeights(updated))
    }

    setAvailableCash((prev: number) => prev + valueToRemove)
  }

  // Weights are recalculated after each add/remove via recalcWeights

  const handleRebalance = () => {
    onRebalance(tempPortfolio, availableCash)
  }

  const handleSubmit = () => {
    if (tempPortfolio.length === 0) return
    // Persist changes
    handleRebalance()
    // Celebrate and inform
    toast.success(`Rebalance submitted for Q${gameState.currentQuarter}`, {
      description: 'Proceeding to next quarter...'
    })
    // Play a short confetti animation, then proceed
    setShowConfetti(true)
    setTimeout(() => {
      setShowConfetti(false)
      onProceed()
    }, 1200)
  }

  const handleSkip = () => {
    // Mark current quarter as rebalanced to advance the stepper
    markRebalanced(gameState.currentQuarter)
    toast('Skipped rebalance')
    onProceed()
  }

  // Register submit/skip actions for header controls
  useEffect(() => {
    if (!onRegisterActions) return
    onRegisterActions({ submit: handleSubmit, skip: handleSkip })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRegisterActions, tempPortfolio, availableCash])

  return (
    <div className="space-y-6">
      {showConfetti && <ConfettiBurst />}
      <div className="grid grid-cols-1 gap-6">
        {/* Main - Portfolio List */}
        <Card className="bg-white/90 backdrop-blur border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight text-slate-900">
              <div className="w-7 h-7 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <Target className="w-4 h-4 text-white" />
              </div>
              Your Portfolio
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="outline" className="text-xs rounded-full border-amber-200 bg-amber-50 text-amber-700">
                  Capital: ₹{(gameState.currentCapital / 100000).toFixed(1)}L
                </Badge>
                <Badge variant="outline" className="text-xs rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                  Cash: ₹{(availableCash / 100000).toFixed(1)}L
                </Badge>
                <Badge variant="secondary" className="text-xs rounded-full bg-blue-50 text-blue-700">
                  Invested: ₹{(totalPortfolioValue / 100000).toFixed(1)}L
                </Badge>
                {/* <Button size="sm" variant="outline" onClick={handleSkip} className="border-slate-300 text-slate-700 ml-5">
                  Skip
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={tempPortfolio.length === 0}
                  className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:from-purple-700 hover:to-blue-700"
                >
                  Submit Rebalance
                </Button> */}
              </div>
            </CardTitle>
            <CardDescription className="text-gray-600"><span className="font-base text-sm flex items-center gap-1 mt-1">
              <span className="text-xl leading-none">🚨</span>
              <b>NOTE:</b> Use the <b>Market Events</b> panel on the right since questions reflect this quarter's events. <span className="text-xl leading-none">➡️</span>
            </span></CardDescription>
            <div className="mt-6 flex items-center justify-between">
              <Button size="sm" className="rounded-md text-white " onClick={() => setAddSheetOpen(true)}>Add Stocks</Button>
              <div>
                <Button size="sm" variant="outline" onClick={handleSkip} className="border-slate-300 text-slate-700 mr-5">
                  Skip rebalance
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={tempPortfolio.length === 0}
                  className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:from-purple-700 hover:to-blue-700"
                >
                  Submit Rebalance
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[30rem]">
              {tempPortfolio.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">No holdings yet. Click "Add Stocks" to begin.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tempPortfolio.map((holding) => (
                    <HoldingCard
                      key={holding.stock.id}
                      holding={holding}
                      availableCash={availableCash}
                      onAdd={(amt: number) => addToPortfolio(holding.stock, amt)}
                      onRemove={(amt: number) => removeFromPortfolio(holding.stock.id, amt)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
            {/* <div className="mt-4 flex items-center justify-between">
              <Button size="sm" className="rounded-md text-white " onClick={() => setAddSheetOpen(true)}>Add Stocks</Button>
              <div>
                <Button size="sm" variant="outline" onClick={handleSkip} className="border-slate-300 text-slate-700 mr-5">
                  Skip rebalance
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={tempPortfolio.length === 0}
                  className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow hover:from-purple-700 hover:to-blue-700"
                >
                  Submit Rebalance
                </Button>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>

      {/* Add Stocks Sheet */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <AddStocksSheet
          open={addSheetOpen}
          onOpenChange={setAddSheetOpen}
          availableCash={availableCash}
          availableStocks={availableStocks}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          onAddStock={(stock: Stock, amount: number) => addToPortfolio(stock, amount)}
        />
      </Sheet>
    </div>
  )
}

function calculateDiversificationScore(portfolio: PortfolioHolding[]): number {
  if (portfolio.length === 0) return 0

  // Calculate Herfindahl-Hirschman Index for stocks
  const stockHHI = portfolio.reduce((sum, holding) => {
    const weight = holding.weight / 100
    return sum + (weight * weight)
  }, 0)

  // Calculate sector concentration
  const sectorWeights: { [key: string]: number } = {}
  portfolio.forEach(holding => {
    sectorWeights[holding.stock.sector] = (sectorWeights[holding.stock.sector] || 0) + holding.weight
  })

  const sectorHHI = Object.values(sectorWeights).reduce((sum, weight) => {
    const normalizedWeight = weight / 100
    return sum + (normalizedWeight * normalizedWeight)
  }, 0)

  // Convert HHI to diversification score (lower HHI = higher diversification)
  const stockDiversification = Math.max(0, (1 - stockHHI) * 100)
  const sectorDiversification = Math.max(0, (1 - sectorHHI) * 100)

  return (stockDiversification + sectorDiversification) / 2
}
