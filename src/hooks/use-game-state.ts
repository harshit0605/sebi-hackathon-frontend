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

        // Generate events for the new quarter
        const events = generateQuarterEvents(state.currentQuarter + 1, state.portfolio)
        
        // Apply event impacts to portfolio
        const updatedPortfolio = applyEventImpacts(state.portfolio, events)

        // Calculate total capital (holdings + cash)
        const holdingsValue = updatedPortfolio.reduce((sum, holding) => sum + holding.value, 0)
        const capital = holdingsValue + state.cash
        const totalReturn = ((capital - STARTING_CAPITAL) / STARTING_CAPITAL) * 100
        const prev = state.quarterHistory[state.quarterHistory.length - 1]
        const prevCapital = prev ? prev.portfolioValue : STARTING_CAPITAL
        const quarterReturn = prevCapital > 0 ? ((capital - prevCapital) / prevCapital) * 100 : 0

        const quarterData: QuarterData = {
          quarter: state.currentQuarter + 1,
          events,
          portfolioValue: capital,
          totalReturn,
          quarterReturn,
          diversificationScore: calculateDiversificationScore(updatedPortfolio),
          riskScore: calculateRiskScore(updatedPortfolio),
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
          currentQuarter: state.currentQuarter + 1,
          portfolio: updatedPortfolio,
          currentCapital: capital,
          quarterHistory: [...state.quarterHistory, quarterData]
        })
      },

      rebalancePortfolio: (newHoldings: PortfolioHolding[], cashLeft: number) => {
        const state = get()
        const totalValue = newHoldings.reduce((sum, holding) => sum + holding.value, 0)
        const capital = totalValue + cashLeft
        
        // Update weights
        const updatedHoldings = newHoldings.map(holding => ({
          ...holding,
          weight: (holding.value / totalValue) * 100
        }))

        // Mark current quarter as rebalanced
        const updatedHistory = state.quarterHistory.map((quarter, index) =>
          index === state.quarterHistory.length - 1
            ? {
                ...quarter,
                rebalanced: true,
                portfolioValue: capital,
                totalReturn: ((capital - STARTING_CAPITAL) / STARTING_CAPITAL) * 100,
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
    availableStocks: MOCK_STOCKS
  }
}

// Helper functions
function generateQuarterEvents(quarter: number, portfolio: PortfolioHolding[]): GameEvent[] {
  const events: GameEvent[] = []
  
  // Always include earnings for top holdings
  const topHoldings = portfolio
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
  
  topHoldings.forEach(holding => {
    const isPositive = Math.random() > 0.4 // 60% chance of positive earnings
    events.push({
      id: `earnings-${holding.stock.id}-q${quarter}`,
      title: `${holding.stock.name} Q${quarter} Earnings ${isPositive ? 'Beat' : 'Miss'}`,
      type: 'earnings',
      description: `${holding.stock.name} reported ${isPositive ? 'better than expected' : 'disappointing'} quarterly results.`,
      affectedSectors: [holding.stock.sector],
      affectedStocks: [holding.stock.id],
      direction: isPositive ? 1 : -1,
      impactScore: Math.random() * 40 + 20, // 20-60 impact score
      confidence: 'high',
      isUnverifiedTip: false,
      shockProfile: 'impulse',
      decayHalfLife: 4
    })
  })

  // Add macro events
  if (Math.random() > 0.6) {
    const macroEvents = [
      {
        title: 'RBI Policy Rate Change',
        description: 'Reserve Bank of India announces policy rate decision affecting banking sector.',
        affectedSectors: ['Banking', 'Financial Services'],
        type: 'policy' as const
      },
      {
        title: 'Global Trade Tensions',
        description: 'International trade disputes impact export-oriented sectors.',
        affectedSectors: ['Technology', 'Pharmaceuticals', 'Textiles'],
        type: 'geopolitical' as const
      },
      {
        title: 'Crude Oil Price Volatility',
        description: 'Significant movement in global crude oil prices.',
        affectedSectors: ['Oil & Gas', 'Automobiles', 'Airlines'],
        type: 'commodity' as const
      }
    ]

    const selectedEvent = macroEvents[Math.floor(Math.random() * macroEvents.length)]
    const isPositive = Math.random() > 0.5

    events.push({
      id: `macro-${quarter}-${Date.now()}`,
      title: selectedEvent.title,
      type: selectedEvent.type,
      description: selectedEvent.description,
      affectedSectors: selectedEvent.affectedSectors,
      affectedStocks: [],
      direction: isPositive ? 1 : -1,
      impactScore: Math.random() * 30 + 15, // 15-45 impact score
      confidence: 'medium',
      isUnverifiedTip: false,
      shockProfile: 'step',
      decayHalfLife: 8
    })
  }

  // Occasionally add unverified tips
  if (Math.random() > 0.8) {
    const randomStock = MOCK_STOCKS[Math.floor(Math.random() * MOCK_STOCKS.length)]
    events.push({
      id: `tip-${quarter}-${Date.now()}`,
      title: `Hot Tip: ${randomStock.name} Set to Soar`,
      type: 'sentiment',
      description: 'Unverified market rumor suggests significant upside potential.',
      affectedSectors: [randomStock.sector],
      affectedStocks: [randomStock.id],
      direction: 1,
      impactScore: Math.random() * 25 + 10, // 10-35 impact score
      confidence: 'low',
      isUnverifiedTip: true,
      shockProfile: 'ramp',
      decayHalfLife: 2
    })
  }

  return events
}

function applyEventImpacts(portfolio: PortfolioHolding[], events: GameEvent[]): PortfolioHolding[] {
  return portfolio.map(holding => {
    let totalImpact = 0

    events.forEach(event => {
      if (event.affectedStocks.includes(holding.stock.id) || 
          event.affectedSectors.includes(holding.stock.sector)) {
        
        const sectorSensitivity = event.affectedStocks.includes(holding.stock.id) ? 1.0 : 0.4
        const confidenceMultiplier = event.confidence === 'high' ? 1.0 : 
                                   event.confidence === 'medium' ? 0.75 : 0.5
        
        const impact = (event.impactScore / 100) * event.direction * sectorSensitivity * confidenceMultiplier
        totalImpact += impact
      }
    })

    // Cap total impact at ±6%
    totalImpact = Math.max(-0.06, Math.min(0.06, totalImpact))

    const newPrice = holding.stock.price * (1 + totalImpact)
    const newValue = holding.quantity * newPrice

    return {
      ...holding,
      stock: {
        ...holding.stock,
        price: newPrice,
        change: newPrice - holding.stock.price,
        changePercent: totalImpact * 100
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
    'Banking': 0.8,
    'Oil & Gas': 1.1,
    'Pharmaceuticals': 0.9,
    'Automobiles': 1.0,
    'Consumer Goods': 0.7,
    'Metals': 1.3,
  }

  const weightedRisk = portfolio.reduce((sum, holding) => {
    const sectorRisk = sectorRiskWeights[holding.stock.sector] || 1.0
    return sum + (holding.weight / 100) * sectorRisk
  }, 0)

  return Math.min(100, weightedRisk * 50) // Normalize to 0-100 scale
}
