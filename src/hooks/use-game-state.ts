"use client"

import { useState, useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Stock = {
  id: string
  symbol: string
  name: string
  sector: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  pe: number
  dividend: number
}

export type PortfolioHolding = {
  stock: Stock
  quantity: number
  value: number
  weight: number
  avgPrice: number
}

export type GameEvent = {
  id: string
  title: string
  type: 'earnings' | 'macro' | 'geopolitical' | 'policy' | 'commodity' | 'sentiment'
  description: string
  affectedSectors: string[]
  affectedStocks: string[]
  direction: 1 | -1 | 0
  impactScore: number
  confidence: 'low' | 'medium' | 'high'
  isUnverifiedTip: boolean
  shockProfile: 'impulse' | 'step' | 'ramp'
  decayHalfLife: number
}

export type QuarterData = {
  quarter: number
  events: GameEvent[]
  portfolioValue: number
  totalReturn: number
  quarterReturn: number
  diversificationScore: number
  riskScore: number
  rebalanced: boolean
  // Guided journey flags
  eventsReviewed: boolean
  quizPassed: boolean
  quizScore: number | null
  // Persisted quiz state
  quizAnswers: Record<string, string>
  quizSubmitted: boolean
  // Post-rebalance steps
  aiReviewed: boolean
  performanceReviewed: boolean
}

export type GameState = {
  isStarted: boolean
  isComplete: boolean
  startingCapital: number
  currentCapital: number
  cash: number
  currentQuarter: number
  hintsRemaining: number
  hintsUsed: number
  portfolio: PortfolioHolding[]
  quarterHistory: QuarterData[]
  totalScore: number
  achievements: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

const STARTING_CAPITAL = 1000000 // ₹10 lakhs
const TOTAL_QUARTERS = 12 // 3 years
const INITIAL_HINTS = 6

// Mock stock data - in real implementation, this would come from API
const MOCK_STOCKS: Stock[] = [
  // Technology
  { id: 'TCS', symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'Technology', price: 3850, change: 45, changePercent: 1.18, marketCap: 1400000, pe: 28.5, dividend: 1.2 },
  { id: 'INFY', symbol: 'INFY', name: 'Infosys Limited', sector: 'Technology', price: 1720, change: -12, changePercent: -0.69, marketCap: 720000, pe: 25.8, dividend: 2.1 },
  { id: 'WIPRO', symbol: 'WIPRO', name: 'Wipro Limited', sector: 'Technology', price: 445, change: 8, changePercent: 1.83, marketCap: 245000, pe: 22.1, dividend: 1.8 },
  
  // Banking & Financial Services
  { id: 'HDFCBANK', symbol: 'HDFCBANK', name: 'HDFC Bank Limited', sector: 'Banking', price: 1650, change: 25, changePercent: 1.54, marketCap: 1250000, pe: 18.5, dividend: 1.5 },
  { id: 'ICICIBANK', symbol: 'ICICIBANK', name: 'ICICI Bank Limited', sector: 'Banking', price: 1180, change: -8, changePercent: -0.67, marketCap: 825000, pe: 16.2, dividend: 1.8 },
  { id: 'KOTAKBANK', symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', price: 1750, change: 15, changePercent: 0.87, marketCap: 345000, pe: 20.1, dividend: 0.8 },
  
  // Oil & Gas
  { id: 'RELIANCE', symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Oil & Gas', price: 2850, change: 35, changePercent: 1.24, marketCap: 1925000, pe: 24.8, dividend: 0.7 },
  { id: 'ONGC', symbol: 'ONGC', name: 'Oil & Natural Gas Corp', sector: 'Oil & Gas', price: 285, change: 12, changePercent: 4.40, marketCap: 358000, pe: 8.5, dividend: 5.2 },
  { id: 'IOC', symbol: 'IOC', name: 'Indian Oil Corporation', sector: 'Oil & Gas', price: 145, change: -3, changePercent: -2.03, marketCap: 205000, pe: 12.1, dividend: 4.1 },
  
  // Pharmaceuticals
  { id: 'SUNPHARMA', symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharmaceuticals', price: 1485, change: 28, changePercent: 1.92, marketCap: 356000, pe: 32.5, dividend: 1.1 },
  { id: 'DRREDDY', symbol: 'DRREDDY', name: 'Dr Reddys Laboratories', sector: 'Pharmaceuticals', price: 6250, change: -85, changePercent: -1.34, marketCap: 104000, pe: 18.9, dividend: 0.9 },
  { id: 'CIPLA', symbol: 'CIPLA', name: 'Cipla Limited', sector: 'Pharmaceuticals', price: 1580, change: 22, changePercent: 1.41, marketCap: 128000, pe: 28.1, dividend: 1.4 },
  
  // Automobiles
  { id: 'MARUTI', symbol: 'MARUTI', name: 'Maruti Suzuki India', sector: 'Automobiles', price: 12500, change: 185, changePercent: 1.50, marketCap: 378000, pe: 26.8, dividend: 1.8 },
  { id: 'TATAMOTORS', symbol: 'TATAMOTORS', name: 'Tata Motors Limited', sector: 'Automobiles', price: 785, change: -15, changePercent: -1.88, marketCap: 289000, pe: 15.2, dividend: 0.0 },
  { id: 'M&M', symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobiles', price: 2850, change: 45, changePercent: 1.60, marketCap: 356000, pe: 22.5, dividend: 1.2 },
  
  // Consumer Goods
  { id: 'HINDUNILVR', symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'Consumer Goods', price: 2650, change: 18, changePercent: 0.68, marketCap: 622000, pe: 58.2, dividend: 1.9 },
  { id: 'ITC', symbol: 'ITC', name: 'ITC Limited', sector: 'Consumer Goods', price: 485, change: 8, changePercent: 1.68, marketCap: 602000, pe: 28.5, dividend: 5.2 },
  { id: 'NESTLEIND', symbol: 'NESTLEIND', name: 'Nestle India Limited', sector: 'Consumer Goods', price: 2450, change: -25, changePercent: -1.01, marketCap: 236000, pe: 78.5, dividend: 2.8 },
  
  // Metals & Mining
  { id: 'TATASTEEL', symbol: 'TATASTEEL', name: 'Tata Steel Limited', sector: 'Metals', price: 145, change: 8, changePercent: 5.84, marketCap: 178000, pe: 45.2, dividend: 0.0 },
  { id: 'HINDALCO', symbol: 'HINDALCO', name: 'Hindalco Industries', sector: 'Metals', price: 485, change: 12, changePercent: 2.54, marketCap: 108000, pe: 18.5, dividend: 1.2 },
  { id: 'JSWSTEEL', symbol: 'JSWSTEEL', name: 'JSW Steel Limited', sector: 'Metals', price: 885, change: 25, changePercent: 2.91, marketCap: 218000, pe: 28.5, dividend: 0.8 },
]

interface GameStore extends GameState {
  initializeGame: () => void
  proceedToNextQuarter: () => void
  rebalancePortfolio: (newHoldings: PortfolioHolding[], cashLeft: number) => void
  useHint: () => void
  resetGame: () => void
  calculatePortfolioMetrics: () => void
  // Guided journey actions
  markEventsReviewed: (quarter: number) => void
  submitQuizResult: (quarter: number, score: number, passed: boolean) => void
  saveQuizAnswer: (quarter: number, questionId: string, answerId: string) => void
  resetQuiz: (quarter: number) => void
  // Mark quarter as rebalanced without changing holdings (used for skip)
  markRebalanced: (quarter: number) => void
  // Post-rebalance step markers
  markAIReviewed: (quarter: number) => void
  markPerformanceReviewed: (quarter: number) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      isStarted: false,
      isComplete: false,
      startingCapital: STARTING_CAPITAL,
      currentCapital: STARTING_CAPITAL,
      cash: STARTING_CAPITAL,
      currentQuarter: 0,
      hintsRemaining: INITIAL_HINTS,
      hintsUsed: 0,
      portfolio: [],
      quarterHistory: [],
      totalScore: 0,
      achievements: [],
      difficulty: 'medium',

      initializeGame: () => {
        // On start, generate events for Quarter 1 so users can review and take quiz before rebalancing
        const initialPortfolio: PortfolioHolding[] = []
        const q1Events = generateQuarterEvents(1, initialPortfolio)
        const initialHoldingsValue = initialPortfolio.reduce((sum, h) => sum + h.value, 0)
        const initialCapital = initialHoldingsValue + STARTING_CAPITAL
        const initialTotalReturn = 0
        const initialQuarterData: QuarterData = {
          quarter: 1,
          events: q1Events,
          portfolioValue: initialCapital,
          totalReturn: initialTotalReturn,
          quarterReturn: 0,
          diversificationScore: calculateDiversificationScore(initialPortfolio),
          riskScore: calculateRiskScore(initialPortfolio),
          rebalanced: false,
          eventsReviewed: false,
          quizPassed: false,
          quizScore: null,
          quizAnswers: {},
          quizSubmitted: false,
          aiReviewed: false,
          performanceReviewed: false,
        }

        set({
          isStarted: true,
          isComplete: false,
          currentQuarter: 1,
          currentCapital: STARTING_CAPITAL,
          cash: STARTING_CAPITAL,
          hintsRemaining: INITIAL_HINTS,
          hintsUsed: 0,
          portfolio: initialPortfolio,
          quarterHistory: [initialQuarterData],
          totalScore: 0,
          achievements: [],
        })
      },

      proceedToNextQuarter: () => {
        const state = get()
        if (state.currentQuarter >= TOTAL_QUARTERS) {
          set({ isComplete: true })
          return
        }

        // Generate events for the new quarter (do NOT apply impacts here)
        const nextQuarter = state.currentQuarter + 1
        const events = generateQuarterEvents(nextQuarter, state.portfolio)

        // Carry forward current portfolio and capital
        const holdingsValue = state.portfolio.reduce((sum, h) => sum + h.value, 0)
        const capital = holdingsValue + state.cash
        const totalReturn = ((capital - STARTING_CAPITAL) / STARTING_CAPITAL) * 100

        console.debug('[DQ] proceedToNextQuarter', {
          fromQuarter: state.currentQuarter,
          toQuarter: nextQuarter,
          eventsCount: events.length,
          carryForwardHoldingsValue: holdingsValue,
          cash: state.cash,
          capital,
          totalReturn,
        })

        const quarterData: QuarterData = {
          quarter: nextQuarter,
          events,
          portfolioValue: capital,
          totalReturn,
          quarterReturn: 0,
          diversificationScore: calculateDiversificationScore(state.portfolio),
          riskScore: calculateRiskScore(state.portfolio),
          rebalanced: false,
          eventsReviewed: false,
          quizPassed: false,
          quizScore: null,
          quizAnswers: {},
          quizSubmitted: false,
          aiReviewed: false,
          performanceReviewed: false
        }

        set({
          currentQuarter: nextQuarter,
          quarterHistory: [...state.quarterHistory, quarterData]
        })
      },

      rebalancePortfolio: (newHoldings: PortfolioHolding[], cashLeft: number) => {
        const state = get()
        console.debug('[DQ] rebalancePortfolio: input', { newHoldingsCount: newHoldings.length, cashLeft })

        // Find current quarter entry and its events
        const currentIdx = state.quarterHistory.findIndex(q => q.quarter === state.currentQuarter)
        const idx = currentIdx >= 0 ? currentIdx : (state.quarterHistory.length - 1)
        const currentQuarterData = state.quarterHistory[idx]
        const events = currentQuarterData?.events ?? []

        // Apply event impacts once at rebalance time
        const impactedHoldings = applyEventImpacts(newHoldings, events, state.currentQuarter)

        // Recompute weights after impact
        const totalValue = impactedHoldings.reduce((sum, holding) => sum + holding.value, 0)
        const updatedHoldings = impactedHoldings.map(holding => ({
          ...holding,
          weight: totalValue > 0 ? (holding.value / totalValue) * 100 : 0
        }))

        const capital = totalValue + cashLeft

        // Previous quarter capital (second last entry) for quarter return
        const prevEntry = state.quarterHistory[state.quarterHistory.length - 2]
        const prevCapital = prevEntry ? prevEntry.portfolioValue : STARTING_CAPITAL
        const totalReturnPct = ((capital - STARTING_CAPITAL) / STARTING_CAPITAL) * 100
        const quarterReturnPct = prevCapital > 0 ? ((capital - prevCapital) / prevCapital) * 100 : 0
        const dScore = totalValue > 0 ? calculateDiversificationScore(updatedHoldings) : 0
        const rScore = totalValue > 0 ? calculateRiskScore(updatedHoldings) : 0

        console.debug('[DQ] rebalancePortfolio: computed', { totalValue, capital, totalReturnPct, quarterReturnPct, dScore, rScore, eventsApplied: events.length })

        // Update current quarter entry with metrics and mark rebalanced
        const updatedHistory = state.quarterHistory.map((quarter, i) =>
          i === idx
            ? {
                ...quarter,
                rebalanced: true,
                portfolioValue: capital,
                totalReturn: totalReturnPct,
                quarterReturn: quarterReturnPct,
                diversificationScore: dScore,
                riskScore: rScore,
              }
            : quarter
        )

        set({
          portfolio: updatedHoldings,
          currentCapital: capital,
          cash: cashLeft,
          quarterHistory: updatedHistory
        })
      },

      // Allow marking rebalanced on skip without modifying holdings/cash
      markRebalanced: (quarterNumber: number) => {
        const state = get()
        const updatedHistory = state.quarterHistory.map(q =>
          q.quarter === quarterNumber ? { ...q, rebalanced: true } : q
        )
        set({ quarterHistory: updatedHistory })
      },

      // Mark AI review as completed
      markAIReviewed: (quarterNumber: number) => {
        const state = get()
        const updatedHistory = state.quarterHistory.map(q =>
          q.quarter === quarterNumber ? { ...q, aiReviewed: true } : q
        )
        set({ quarterHistory: updatedHistory })
      },

      // Mark Performance review as completed
      markPerformanceReviewed: (quarterNumber: number) => {
        const state = get()
        const updatedHistory = state.quarterHistory.map(q =>
          q.quarter === quarterNumber ? { ...q, performanceReviewed: true } : q
        )
        set({ quarterHistory: updatedHistory })
      },

      useHint: () => {
        const state = get()
        if (state.hintsRemaining > 0) {
          set({
            hintsRemaining: state.hintsRemaining - 1,
            hintsUsed: state.hintsUsed + 1
          })
        }
      },

      resetGame: () => {
        set({
          isStarted: false,
          isComplete: false,
          currentQuarter: 0,
          currentCapital: STARTING_CAPITAL,
          cash: STARTING_CAPITAL,
          hintsRemaining: INITIAL_HINTS,
          hintsUsed: 0,
          portfolio: [],
          quarterHistory: [],
          totalScore: 0,
          achievements: [],
        })
      },

      calculatePortfolioMetrics: () => {
        // This will be called to update real-time metrics
      },

      // Guided journey actions
      markEventsReviewed: (quarter: number) => {
        const state = get()
        const updatedHistory = state.quarterHistory.map(q =>
          q.quarter === quarter ? { ...q, eventsReviewed: true } : q
        )
        set({ quarterHistory: updatedHistory })
      },
      submitQuizResult: (quarter: number, score: number, passed: boolean) => {
        const state = get()
        const updatedHistory = state.quarterHistory.map(q =>
          q.quarter === quarter ? { ...q, quizScore: score, quizPassed: passed, quizSubmitted: true } : q
        )
        set({ quarterHistory: updatedHistory })
      },
      saveQuizAnswer: (quarter: number, questionId: string, answerId: string) => {
        const state = get()
        const updatedHistory = state.quarterHistory.map(q =>
          q.quarter === quarter ? { ...q, quizAnswers: { ...(q.quizAnswers || {}), [questionId]: answerId } } : q
        )
        set({ quarterHistory: updatedHistory })
      },
      resetQuiz: (quarter: number) => {
        const state = get()
        const updatedHistory = state.quarterHistory.map(q =>
          q.quarter === quarter ? { ...q, quizAnswers: {}, quizSubmitted: false, quizScore: null, quizPassed: false } : q
        )
        set({ quarterHistory: updatedHistory })
      }
    }),
    {
      name: 'diversify-quest-game-state',
      version: 1,
      migrate: (state: any, version: number) => {
        try {
          if (version < 1 && state?.quarterHistory?.length) {
            const last = state.quarterHistory[state.quarterHistory.length - 1]
            const hasPortfolio = Array.isArray(state.portfolio) && state.portfolio.length > 0
            if (last) {
              const dscore = hasPortfolio ? calculateDiversificationScore(state.portfolio) : last.diversificationScore
              const rscore = hasPortfolio ? calculateRiskScore(state.portfolio) : last.riskScore
              state.quarterHistory[state.quarterHistory.length - 1] = {
                ...last,
                diversificationScore: last.diversificationScore || dscore || 0,
                riskScore: last.riskScore || rscore || 0,
              }
            }
          }
        } catch (_) {
          // no-op: best-effort migrate
        }
        return state
      }
    }
  )
)

export function useGameState() {
  const store = useGameStore()
  
  const investedValue = store.portfolio.reduce((sum, holding) => sum + holding.value, 0)
  const portfolioValue = investedValue + store.cash
  const totalReturn = ((portfolioValue - store.startingCapital) / store.startingCapital) * 100

  const startNewGame = useCallback(() => {
    store.initializeGame()
  }, [store])

  return {
    gameState: store,
    currentQuarter: store.currentQuarter,
    portfolioValue,
    totalReturn,
    isGameComplete: store.isComplete,
    startNewGame,
    proceedToNextQuarter: store.proceedToNextQuarter,
    rebalancePortfolio: store.rebalancePortfolio,
    useHint: store.useHint,
    // Guided journey actions
    markEventsReviewed: store.markEventsReviewed,
    submitQuizResult: store.submitQuizResult,
    saveQuizAnswer: store.saveQuizAnswer,
    resetQuiz: store.resetQuiz,
    markRebalanced: store.markRebalanced,
    markAIReviewed: store.markAIReviewed,
    markPerformanceReviewed: store.markPerformanceReviewed,
    availableStocks: MOCK_STOCKS,
    resetGame: store.resetGame,
  }
}

// Helper functions
type RNG = () => number

// Deterministic PRNG (mulberry32)
function mulberry32(a: number): RNG {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function strHash(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seedFromQuarterAndPortfolio(quarter: number, portfolio: PortfolioHolding[]): number {
  const ids = portfolio
    .slice()
    .sort((a, b) => (a.stock.id > b.stock.id ? 1 : -1))
    .map(h => `${h.stock.id}:${Math.round(h.weight * 100)}`)
    .join('|')
  const base = strHash(`q${quarter}|${ids}`)
  return (base ^ strHash('dq-seeded-v1')) >>> 0
}

function randInt(rng: RNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function choice<T>(rng: RNG, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function chance(rng: RNG, p: number): boolean {
  return rng() < p
}

type QuarterMacro = {
  title: string
  description: string
  type: GameEvent['type']
  affectedSectors: string[]
  directionBias: -1 | 0 | 1
  impact: [number, number]
  shock: GameEvent['shockProfile']
  halfLife: number
}

type QuarterTheme = {
  name: string
  macros: QuarterMacro[]
}

const QUARTER_THEMES: QuarterTheme[] = [
  { name: 'Budget & Guidance', macros: [
    { title: 'Union Budget Expectations', description: 'Pre-budget positioning affects Banking and Infrastructure.', type: 'policy', affectedSectors: ['Banking', 'Metals', 'Automobiles'], directionBias: 1, impact: [18, 35], shock: 'step', halfLife: 8 },
    { title: 'IT Hiring Pause Headlines', description: 'Global clients slow tech spending; large-cap IT under pressure.', type: 'macro', affectedSectors: ['Technology'], directionBias: -1, impact: [12, 28], shock: 'ramp', halfLife: 6 },
  ]},
  { name: 'RBI Policy & Inflation', macros: [
    { title: 'RBI Maintains Policy Rate', description: 'Stable rates support banks; rate-sensitives steady.', type: 'policy', affectedSectors: ['Banking', 'Automobiles', 'Consumer Goods'], directionBias: 1, impact: [12, 24], shock: 'step', halfLife: 8 },
    { title: 'Sticky Core Inflation', description: 'Consumer staples pass-through mixed; discretionary demand wobbly.', type: 'macro', affectedSectors: ['Consumer Goods', 'Automobiles'], directionBias: -1, impact: [10, 22], shock: 'ramp', halfLife: 5 },
  ]},
  { name: 'Monsoon Watch', macros: [
    { title: 'IMD Monsoon Forecast Above Normal', description: 'Agri-linked demand improves; FMCG rural mix benefits.', type: 'macro', affectedSectors: ['Consumer Goods', 'Automobiles'], directionBias: 1, impact: [15, 30], shock: 'ramp', halfLife: 6 },
    { title: 'Fertilizer Subsidy Update', description: 'Policy clarity for agri input supply chains.', type: 'policy', affectedSectors: ['Metals', 'Oil & Gas'], directionBias: 0, impact: [8, 18], shock: 'step', halfLife: 6 },
  ]},
  { name: 'Global Cues & FX', macros: [
    { title: 'US Fed Guidance Turns Hawkish', description: 'Risk-off; IT exporters mixed with FX tailwinds.', type: 'macro', affectedSectors: ['Technology', 'Banking'], directionBias: -1, impact: [15, 30], shock: 'impulse', halfLife: 4 },
    { title: 'INR Volatility vs USD', description: 'Exporters benefit; import-cost sectors cautious.', type: 'macro', affectedSectors: ['Technology', 'Oil & Gas', 'Automobiles'], directionBias: 0, impact: [10, 20], shock: 'ramp', halfLife: 5 },
  ]},
  { name: 'Commodity Cycles', macros: [
    { title: 'Crude Oil Spike on Supply Cuts', description: 'Upstream benefits; downstream and autos face margin pressure.', type: 'commodity', affectedSectors: ['Oil & Gas', 'Automobiles'], directionBias: -1, impact: [18, 32], shock: 'step', halfLife: 7 },
    { title: 'Base Metals Firm Up', description: 'Metals rally; capital goods optimism.', type: 'commodity', affectedSectors: ['Metals', 'Automobiles'], directionBias: 1, impact: [12, 26], shock: 'ramp', halfLife: 6 },
  ]},
  { name: 'Elections & Policy Signals', macros: [
    { title: 'State Election Outcome Stable', description: 'Policy continuity supports risk appetite.', type: 'geopolitical', affectedSectors: ['Banking', 'Infrastructure', 'Metals'], directionBias: 1, impact: [14, 28], shock: 'step', halfLife: 7 },
    { title: 'Regulatory Scrutiny on Select Sectors', description: 'Sentiment overhang on impacted industries.', type: 'policy', affectedSectors: ['Technology', 'Pharmaceuticals'], directionBias: -1, impact: [10, 24], shock: 'impulse', halfLife: 4 },
  ]},
  { name: 'Festive Demand & Logistics', macros: [
    { title: 'Festive Demand Stronger Than Expected', description: 'Autos and consumer goods see volume uplift.', type: 'macro', affectedSectors: ['Automobiles', 'Consumer Goods'], directionBias: 1, impact: [16, 30], shock: 'ramp', halfLife: 6 },
    { title: 'Supply Chain Normalization', description: 'Input cost pressures ease; margins stabilize.', type: 'macro', affectedSectors: ['Consumer Goods', 'Pharmaceuticals', 'Automobiles'], directionBias: 1, impact: [12, 24], shock: 'step', halfLife: 6 },
  ]},
  { name: 'Healthcare & Compliance', macros: [
    { title: 'USFDA Inspections Mixed', description: 'Plant observations create stock-specific volatility.', type: 'policy', affectedSectors: ['Pharmaceuticals'], directionBias: 0, impact: [10, 22], shock: 'impulse', halfLife: 5 },
    { title: 'Pricing Controls Review', description: 'Regulatory uncertainty around select therapies.', type: 'policy', affectedSectors: ['Pharmaceuticals'], directionBias: -1, impact: [10, 20], shock: 'step', halfLife: 6 },
  ]},
  { name: 'Capex & Infra', macros: [
    { title: 'Government Capex Push', description: 'Infra order books strengthen; metals sentiment improves.', type: 'policy', affectedSectors: ['Metals', 'Banking'], directionBias: 1, impact: [14, 28], shock: 'ramp', halfLife: 7 },
    { title: 'Private Capex Cycle Watch', description: 'Green shoots but funding costs relevant.', type: 'macro', affectedSectors: ['Banking', 'Metals', 'Automobiles'], directionBias: 0, impact: [10, 22], shock: 'step', halfLife: 6 },
  ]},
  { name: 'Global Risk Events', macros: [
    { title: 'Geopolitical Flashpoint', description: 'Risk assets wobble; safe-haven bid rises.', type: 'geopolitical', affectedSectors: ['Oil & Gas', 'Metals', 'Technology'], directionBias: -1, impact: [16, 30], shock: 'impulse', halfLife: 4 },
    { title: 'Trade Policy Uncertainty', description: 'Exporters reprice pipelines; sentiment cautious.', type: 'geopolitical', affectedSectors: ['Technology', 'Pharmaceuticals'], directionBias: -1, impact: [12, 24], shock: 'step', halfLife: 5 },
  ]},
  { name: 'Rates & Credit', macros: [
    { title: 'Credit Growth Strong', description: 'Banks see robust lending; NIMs stable.', type: 'macro', affectedSectors: ['Banking'], directionBias: 1, impact: [12, 22], shock: 'ramp', halfLife: 6 },
    { title: 'Liquidity Tightening', description: 'Short-term rates rise; risk appetite moderates.', type: 'macro', affectedSectors: ['Banking', 'Automobiles'], directionBias: -1, impact: [12, 24], shock: 'step', halfLife: 6 },
  ]},
  { name: 'Earnings Season Wrap', macros: [
    { title: 'Broad-Based Earnings Beat', description: 'Multiple sectors deliver better-than-expected results.', type: 'macro', affectedSectors: ['Technology', 'Banking', 'Automobiles', 'Pharmaceuticals'], directionBias: 1, impact: [14, 28], shock: 'impulse', halfLife: 5 },
    { title: 'Guidance Resets for Select Sectors', description: 'Some companies trim outlook; dispersion rises.', type: 'macro', affectedSectors: ['Technology', 'Consumer Goods'], directionBias: -1, impact: [12, 22], shock: 'step', halfLife: 6 },
  ]},
  { name: 'Year-End Positioning', macros: [
    { title: 'Window Dressing & Rebalancing', description: 'Flows drive near-term moves; fundamentals intact.', type: 'sentiment', affectedSectors: ['Banking', 'Technology', 'Automobiles'], directionBias: 0, impact: [10, 18], shock: 'impulse', halfLife: 3 },
    { title: 'Tax-Loss Harvesting Effects', description: 'Underperformers see pressure; quality holds.', type: 'sentiment', affectedSectors: ['Metals', 'Technology'], directionBias: -1, impact: [10, 18], shock: 'impulse', halfLife: 3 },
  ]},
]

function generateQuarterEvents(quarter: number, portfolio: PortfolioHolding[]): GameEvent[] {
  const rng = mulberry32(seedFromQuarterAndPortfolio(quarter, portfolio))
  const events: GameEvent[] = []

  // Earnings for top holdings or representative names if portfolio empty
  const top = portfolio.slice().sort((a, b) => b.weight - a.weight).slice(0, 3)
  const earnStocks = top.length > 0
    ? top.map(h => h.stock)
    : [MOCK_STOCKS.find(s => s.id === 'TCS')!, MOCK_STOCKS.find(s => s.id === 'HDFCBANK')!, MOCK_STOCKS.find(s => s.id === 'RELIANCE')!].filter(Boolean)

  earnStocks.forEach((stock, idx) => {
    const isPositive = chance(rng, 0.6)
    const impact = randInt(rng, 20, 55)
    events.push({
      id: `q${quarter}-earnings-${stock.id}-${idx}`,
      title: `${stock.name} Q${quarter} Earnings ${isPositive ? 'Beat' : 'Miss'}`,
      type: 'earnings',
      description: `${stock.name} reported ${isPositive ? 'better-than-expected' : 'weaker-than-expected'} results with guidance ${isPositive ? 'upbeat' : 'cautious'}.`,
      affectedSectors: [stock.sector],
      affectedStocks: [stock.id],
      direction: isPositive ? 1 : -1,
      impactScore: impact,
      confidence: 'high',
      isUnverifiedTip: false,
      shockProfile: 'impulse',
      decayHalfLife: 4,
    })
  })

  // Macro/Policy/Commodity theme-driven event(s)
  const theme = QUARTER_THEMES[(quarter - 1) % QUARTER_THEMES.length]
  const m1 = choice(rng, theme.macros)
  const biasFlip = chance(rng, 0.2) ? -1 : 1
  const dir1: 1 | -1 | 0 = m1.directionBias === 0 ? (chance(rng, 0.5) ? 1 : -1) : ((m1.directionBias * biasFlip) > 0 ? 1 : -1)
  const imp1 = randInt(rng, m1.impact[0], m1.impact[1])
  events.push({
    id: `q${quarter}-macro-0`,
    title: m1.title,
    type: m1.type,
    description: m1.description,
    affectedSectors: m1.affectedSectors,
    affectedStocks: [],
    direction: dir1,
    impactScore: imp1,
    confidence: 'medium',
    isUnverifiedTip: false,
    shockProfile: m1.shock,
    decayHalfLife: m1.halfLife,
  })

  if (chance(rng, 0.4)) {
    const m2 = choice(rng, theme.macros)
    const dir2: 1 | -1 | 0 = m2.directionBias === 0 ? (chance(rng, 0.5) ? 1 : -1) : (m2.directionBias > 0 ? 1 : -1)
    const imp2 = randInt(rng, Math.max(10, m2.impact[0] - 4), m2.impact[1])
    events.push({
      id: `q${quarter}-macro-1`,
      title: m2.title,
      type: m2.type,
      description: m2.description,
      affectedSectors: m2.affectedSectors,
      affectedStocks: [],
      direction: dir2,
      impactScore: imp2,
      confidence: 'medium',
      isUnverifiedTip: false,
      shockProfile: m2.shock,
      decayHalfLife: m2.halfLife,
    })
  }

  // Rare unverified tip for education
  if (chance(rng, 0.25)) {
    const s = choice(rng, MOCK_STOCKS)
    const up = chance(rng, 0.6)
    events.push({
      id: `q${quarter}-tip-${s.id}`,
      title: `Hot Tip: ${s.name} ${up ? 'Set to Soar' : 'Faces Pressure'}`,
      type: 'sentiment',
      description: 'Unverified market chatter. Treat cautiously per SEBI guidelines.',
      affectedSectors: [s.sector],
      affectedStocks: [s.id],
      direction: up ? 1 : -1,
      impactScore: randInt(rng, 10, 28),
      confidence: 'low',
      isUnverifiedTip: true,
      shockProfile: 'ramp',
      decayHalfLife: 2,
    })
  }

  return events
}

// --- Pricing model helpers ---
const QUARTER_WEEKS = 12

function averageDecayFactor(halfLife: number): number {
  // Average of exp(-lambda t) over one quarter duration (T weeks)
  const T = QUARTER_WEEKS
  const hl = Math.max(0.1, halfLife || 6)
  const lambda = Math.log(2) / hl
  const avg = (1 - Math.exp(-lambda * T)) / (lambda * T)
  // Clamp to [0.25, 1.0] to avoid negligible weights or explosions
  return Math.max(0.25, Math.min(1.0, avg))
}

function shockProfileWeight(profile: GameEvent['shockProfile']): number {
  // Relative shape weight for a single-quarter aggregation
  // impulse: sharp early move that decays -> lower average
  // step: regime shift persisting through quarter -> highest average
  // ramp: gradual build-up -> mid-high average
  switch (profile) {
    case 'impulse': return 0.6
    case 'ramp': return 0.8
    case 'step':
    default: return 1.0
  }
}

const SECTOR_BASE_VOL: Record<string, number> = {
  'Technology': 0.03,
  'Metals': 0.035,
  'Oil & Gas': 0.03,
  'Pharmaceuticals': 0.025,
  'Automobiles': 0.028,
  'Consumer Goods': 0.02,
  'Banking': 0.022,
}

function baseReturnForSector(quarter: number, sector: string): number {
  // Deterministic sector-level base return centered around 0 within ±vol
  const vol = SECTOR_BASE_VOL[sector] ?? 0.025
  const seed = (strHash('base') ^ strHash(`q${quarter}`) ^ strHash(sector)) >>> 0
  const rng = mulberry32(seed)
  const r = (rng() - 0.5) * 2 * vol // [-vol, +vol]
  return r
}

function applyEventImpacts(portfolio: PortfolioHolding[], events: GameEvent[], quarter: number): PortfolioHolding[] {
  return portfolio.map(holding => {
    // 1) Base historical return (sector-level proxy)
    const rBase = baseReturnForSector(quarter, holding.stock.sector)

    // 2) Event abnormal overlay with shock/decay weighting
    let overlay = 0
    events.forEach(event => {
      if (event.affectedStocks.includes(holding.stock.id) ||
          event.affectedSectors.includes(holding.stock.sector)) {
        const sectorSensitivity = event.affectedStocks.includes(holding.stock.id) ? 1.0 : 0.4
        const confidenceMultiplier = event.confidence === 'high' ? 1.0 :
                                   event.confidence === 'medium' ? 0.75 : 0.5
        const shapeWeight = shockProfileWeight(event.shockProfile)
        const decayWeight = averageDecayFactor(event.decayHalfLife)
        const eventWeight = shapeWeight * decayWeight
        const impact = (event.impactScore / 100) * event.direction * sectorSensitivity * confidenceMultiplier * eventWeight
        overlay += impact
      }
    })

    // Cap overlay (abnormal component) at ±6%
    overlay = Math.max(-0.06, Math.min(0.06, overlay))

    const totalReturn = rBase + overlay
    const newPrice = holding.stock.price * (1 + totalReturn)
    const newValue = holding.quantity * newPrice

    return {
      ...holding,
      stock: {
        ...holding.stock,
        price: newPrice,
        change: newPrice - holding.stock.price,
        changePercent: totalReturn * 100
      },
      value: newValue
    }
  })
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

function calculateRiskScore(portfolio: PortfolioHolding[]): number {
  if (portfolio.length === 0) return 0

  // Simple risk calculation based on sector volatility and concentration
  const sectorRiskWeights: { [key: string]: number } = {
    'Technology': 1.2,
    'Metals': 1.3,
    'Oil & Gas': 1.1,
    'Pharmaceuticals': 0.9,
    'Automobiles': 1.0,
    'Consumer Goods': 0.7,
    'Banking': 0.8,
  }

  const weightedRisk = portfolio.reduce((sum, holding) => {
    const sectorRisk = sectorRiskWeights[holding.stock.sector] || 1.0
    return sum + (holding.weight / 100) * sectorRisk
  }, 0)

  return Math.min(100, weightedRisk * 50) // Normalize to 0-100 scale
}
