"use client"

import { useMemo, useState } from 'react'
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Stock } from '@/hooks/use-game-state'

export type AddStocksSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableCash: number
  availableStocks: Stock[]
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedSector: string
  setSelectedSector: (value: string) => void
  onAddStock: (stock: Stock, amount: number) => void
}

export function AddStocksSheet(props: AddStocksSheetProps) {
  const {
    open,
    onOpenChange,
    availableCash,
    availableStocks,
    searchTerm,
    setSearchTerm,
    selectedSector,
    setSelectedSector,
    onAddStock,
  } = props

  const [batchAmounts, setBatchAmounts] = useState<Record<string, string>>({})
  const [batchPct, setBatchPct] = useState<Record<string, number>>({})

  const filteredStocks = useMemo(() => {
    return availableStocks.filter(stock => {
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch = !term
        || stock.name.toLowerCase().includes(term)
        || stock.symbol.toLowerCase().includes(term)
      const matchesSector = selectedSector === 'all' || stock.sector === selectedSector
      return matchesSearch && matchesSector
    })
  }, [availableStocks, searchTerm, selectedSector])

  return (
    <SheetContent side="right" className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Add Stocks</SheetTitle>
        <SheetDescription>
          Select multiple stocks and set buy amounts. Total buy must be ≤ available cash.
        </SheetDescription>
      </SheetHeader>
      <div className="p-4 pt-0 space-y-3">
        <div className="text-xs text-gray-600">
          Available cash: <span className="font-semibold">₹{availableCash.toLocaleString()}</span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stocks..."
            className="pl-10"
          />
        </div>
        <Tabs value={selectedSector} onValueChange={setSelectedSector}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="Technology">Tech</TabsTrigger>
            <TabsTrigger value="Banking">Banking</TabsTrigger>
            <TabsTrigger value="Oil & Gas">Energy</TabsTrigger>
          </TabsList>
        </Tabs>
        <ScrollArea className="h-[22rem] pr-2">
          <div className="space-y-3">
            {filteredStocks.map((s) => {
              const amtStr = batchAmounts[s.id] ?? ''
              const amt = parseFloat(amtStr) || 0
              const pct = batchPct[s.id] ?? 0
              const isSelected = amt > 0

              const onPct = (vals: number[]) => {
                const p = Math.min(100, Math.max(0, vals[0] ?? 0))
                const rupees = (availableCash * p) / 100
                const shares = Math.floor(rupees / s.price)
                const snapped = shares * s.price
                setBatchPct(prev => ({ ...prev, [s.id]: p }))
                setBatchAmounts(prev => ({ ...prev, [s.id]: snapped ? String(Number(snapped.toFixed(2))) : '' }))
              }
              const onAmt = (v: string) => {
                const num = parseFloat(v)
                if (!Number.isFinite(num)) {
                  setBatchAmounts(prev => ({ ...prev, [s.id]: v }))
                  setBatchPct(prev => ({ ...prev, [s.id]: 0 }))
                  return
                }
                const clamped = Math.min(Math.max(0, num), availableCash)
                const shares = Math.floor(clamped / s.price)
                const snapped = shares * s.price
                const next = snapped === 0 ? '' : String(Number(snapped.toFixed(2)))
                setBatchAmounts(prev => ({ ...prev, [s.id]: next }))
                const p = availableCash > 0 ? (snapped / availableCash) * 100 : 0
                setBatchPct(prev => ({ ...prev, [s.id]: Math.round(p) }))
              }
              const quickSet = (p: number) => {
                const clamped = Math.min(100, Math.max(0, p))
                const rupees = (availableCash * clamped) / 100
                const shares = Math.floor(rupees / s.price)
                const snapped = shares * s.price
                setBatchPct(prev => ({ ...prev, [s.id]: clamped }))
                setBatchAmounts(prev => ({ ...prev, [s.id]: snapped ? String(Number(snapped.toFixed(2))) : '' }))
              }

              return (
                <div
                  key={s.id}
                  className={cn(
                    "border rounded-lg p-3 bg-white/80",
                    isSelected ? "border-emerald-300 ring-1 ring-emerald-200" : "border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{s.symbol} • {s.name}</div>
                      <div className="text-[11px] text-gray-500">₹{s.price.toLocaleString()} • {s.sector}</div>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", isSelected ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "")}>
                      {(batchPct[s.id]?.toFixed?.(0) ?? 0)}% of cash
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-600 mb-1">
                      <span className="font-medium">Buy</span>
                      <span className="px-2 py-0.5 rounded-full border border-emerald-300/50 bg-emerald-50 text-emerald-700 font-semibold">
                        {(batchPct[s.id]?.toFixed?.(0) ?? 0)}%
                      </span>
                    </div>
                    <Slider value={[pct]} onValueChange={onPct} min={0} max={100} step={1} className="[&_.range]:bg-gradient-to-r [&_.range]:from-blue-400 [&_.range]:to-emerald-500" />
                    <div className="flex items-center gap-1 mt-3">
                      {[10, 25, 50, 100].map(p => (
                        <Button key={p} type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => quickSet(p)}>
                          {p}%
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="number"
                      value={amtStr}
                      onChange={(e) => onAmt(e.target.value)}
                      placeholder="Amount"
                      className="h-8"
                      step="any"
                      max={availableCash}
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (amt > 0) {
                          const clamped = Math.min(amt, availableCash)
                          if (clamped > 0) {
                            onAddStock(s, clamped)
                            setBatchAmounts(prev => ({ ...prev, [s.id]: '' }))
                            setBatchPct(prev => ({ ...prev, [s.id]: 0 }))
                          }
                        }
                      }}
                      disabled={amt <= 0 || availableCash <= 0}
                      title={availableCash === 0 ? 'No available cash' : undefined}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setBatchAmounts(prev => ({ ...prev, [s.id]: '' })); setBatchPct(prev => ({ ...prev, [s.id]: 0 })); }}>Clear</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {(() => {
          const totals = Object.values(batchAmounts).map(v => parseFloat(v) || 0)
          const total = totals.reduce((sum, v) => sum + v, 0)
          const selectedCount = Object.values(batchAmounts).filter(v => (parseFloat(v) || 0) > 0).length
          const pct = availableCash > 0 ? Math.min(100, (total / availableCash) * 100) : 0
          const over = total > availableCash
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Selected: <span className="font-semibold">{selectedCount}</span></span>
                <span className={cn('font-medium', over ? 'text-red-600' : 'text-gray-800')}>₹{total.toLocaleString()}</span>
              </div>
              <Progress value={pct} />
              {over && (
                <div className="text-[11px] text-red-600">Total exceeds available cash. Reduce amounts.</div>
              )}
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={total <= 0 || selectedCount === 0 || availableCash <= 0}
                  onClick={() => {
                    // apply batched adds greedily until cash exhausts
                    let remaining = availableCash
                    const entries = Object.entries(batchAmounts)
                      .map(([id, v]) => ({ id, amt: parseFloat(v) || 0 }))
                      .filter(e => e.amt > 0)
                    for (const e of entries) {
                      if (remaining <= 0) break
                      const stock = availableStocks.find(s => s.id === e.id)
                      if (!stock) continue
                      const toAdd = Math.min(e.amt, remaining)
                      if (toAdd <= 0) continue
                      onAddStock(stock, toAdd)
                      remaining -= toAdd
                    }
                    setBatchAmounts({})
                    setBatchPct({})
                    onOpenChange(false)
                  }}
                >
                  {`Add Selected (${selectedCount})`}
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setBatchAmounts({}); setBatchPct({}); onOpenChange(false) }}>Cancel</Button>
              </div>
            </div>
          )
        })()}
      </div>
    </SheetContent>
  )
}
