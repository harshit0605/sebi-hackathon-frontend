"use client"

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GameIntroHeader } from '@/components/diversify-quest/game-intro-header'
import { PortfolioBuilder } from '@/components/diversify-quest/portfolio-builder'
import { EventDeck, UnderstandingMarketEventsCard } from '@/components/diversify-quest/event-deck'
import { QuarterQuiz } from '@/components/diversify-quest/quarter-quiz'
import { PerformanceReview } from '@/components/diversify-quest/performance-review'
import { AIReview } from '@/components/diversify-quest/ai-review'
import { GameReport } from '@/components/diversify-quest/game-report'
import { useGameState } from '@/hooks/use-game-state'
import { TrendingUp, Target, Calendar, BookOpen, Zap, PieChart, AlertTriangle, ArrowLeft, ArrowRight, Activity, CheckCircle, Clock, Lock, Lightbulb, Percent, Coins, ShieldCheck } from 'lucide-react'
import { VerticalQuarterHUD } from '@/components/diversify-quest/vertical-quarter-hud'
import { SebiPrinciplesCard } from '@/components/diversify-quest/ai-guidance'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export default function DiversifyQuestPage() {
  const {
    gameState,
    isGameComplete,
    startNewGame,
    proceedToNextQuarter,
    rebalancePortfolio,
    markAIReviewed,
    markPerformanceReviewed
  } = useGameState()


  // Portfolio overview metrics (store-level)
  const invested = gameState.portfolio.reduce((sum, h) => sum + h.value, 0)
  const availableCash = gameState.cash
  const concentrationRisk = gameState.portfolio.length > 0 ? Math.max(...gameState.portfolio.map(h => h.weight)) : 0
  const sectorWeights = gameState.portfolio.reduce<Record<string, number>>((acc, h) => {
    acc[h.stock.sector] = (acc[h.stock.sector] || 0) + h.weight
    return acc
  }, {})
  const stockHHI = gameState.portfolio.reduce((sum, h) => {
    const w = h.weight / 100
    return sum + w * w
  }, 0)
  const sectorHHI = Object.values(sectorWeights).reduce((sum, weight) => {
    const w = (weight as number) / 100
    return sum + w * w
  }, 0)
  const diversificationScore = (Math.max(0, (1 - stockHHI) * 100) + Math.max(0, (1 - sectorHHI) * 100)) / 2
  // const totalHints = gameState.hintsRemaining + gameState.hintsUsed

  // Additional metrics for overview tiles
  // Use total portfolio value (invested + cash) to compute returns so it's 0% at start
  const totalPortfolioValue = invested + availableCash
  const totalReturn = gameState.startingCapital > 0
    ? ((totalPortfolioValue - gameState.startingCapital) / gameState.startingCapital) * 100
    : 0
  const currentRiskScore = gameState.quarterHistory.length > 0
    ? gameState.quarterHistory[gameState.quarterHistory.length - 1].riskScore
    : 0

  // Guided journey flags for current quarter
  const currentQuarterData = gameState.quarterHistory.find(q => q.quarter === gameState.currentQuarter)
  const eventsReviewed = !!currentQuarterData?.eventsReviewed
  const quizPassed = !!currentQuarterData?.quizPassed
  const rebalanced = !!currentQuarterData?.rebalanced
  const aiReviewed = !!currentQuarterData?.aiReviewed
  const performanceReviewed = !!currentQuarterData?.performanceReviewed
  const isFinalQuarter = gameState.currentQuarter >= 12

  // Manual step override to allow navigating back
  const derivedStep = !eventsReviewed
    ? 1
    : !quizPassed
    ? 2
    : !rebalanced
    ? 3
    : !aiReviewed
    ? 4
    : 5
  const [manualStep, setManualStep] = useState<number | null>(null)
  const stepToShow = manualStep ?? derivedStep

  // Header action registrations from child components
  const [quizActions, setQuizActions] = useState<{ submit: () => void; reset: () => void } | null>(null)
  const [rebalanceActions, setRebalanceActions] = useState<{ submit: () => void; skip: () => void } | null>(null)

  // Keep manual back navigation stable; only clear if user tries to jump ahead of actual progress
  useEffect(() => {
    if (manualStep !== null && derivedStep < manualStep) {
      setManualStep(null)
    }
  }, [derivedStep, manualStep])

  if (!gameState.isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 p-4 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25"
              >
                <Target className="w-12 h-12 text-white" />
              </motion.div>
              <h1 className="text-6xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                Diversify<span className="text-emerald-400">Quest</span>
              </h1>
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-300 text-sm font-medium tracking-wider uppercase">AI at every step • Dynamic quizzes • Actionable critiques</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
                A beautiful, AI-powered trading simulator. Learn to navigate quarterly market events, pass quick
                comprehension checks, rebalance your portfolio, get AI review, and track performance across 12 quarters.
              </p>
            </div>

            {/* Flow: Events → Quiz → Rebalance → AI Review → Performance */}
            <section className="mb-10 text-left">
              <div className="mb-3">
                <p className="text-xs uppercase tracking-wider text-gray-500">Step-by-step</p>
                <h2 className="text-xl font-semibold text-gray-900">How the game flows</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="rounded-xl border border-blue-100 p-4 bg-blue-50/50">
                  <div className="flex items-center gap-2 mb-1"><Calendar className="w-4 h-4 text-blue-600" /><span className="font-medium">Review Events</span></div>
                  <p className="text-sm text-gray-700">Understand macro, earnings, policy and more.</p>
                </div>
                <div className="rounded-xl border border-amber-100 p-4 bg-amber-50/50">
                  <div className="flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4 text-amber-600" /><span className="font-medium">Pass Quiz</span></div>
                  <p className="text-sm text-gray-700">Instant, dynamic questions to unlock Step 3.</p>
                </div>
                <div className="rounded-xl border border-emerald-100 p-4 bg-emerald-50/50">
                  <div className="flex items-center gap-2 mb-1"><PieChart className="w-4 h-4 text-emerald-600" /><span className="font-medium">Rebalance</span></div>
                  <p className="text-sm text-gray-700">Buy/sell whole shares; manage risk & weights.</p>
                </div>
                <div className="rounded-xl border border-purple-100 p-4 bg-purple-50/50">
                  <div className="flex items-center gap-2 mb-1"><Lightbulb className="w-4 h-4 text-purple-600" /><span className="font-medium">AI Review</span></div>
                  <p className="text-sm text-gray-700">Critique diversification, exposure and intent.</p>
                </div>
                <div className="rounded-xl border border-sky-100 p-4 bg-sky-50/50">
                  <div className="flex items-center gap-2 mb-1"><Activity className="w-4 h-4 text-sky-600" /><span className="font-medium">Performance</span></div>
                  <p className="text-sm text-gray-700">See quarter returns and proceed to the next Q.</p>
                </div>
              </div>
            </section>

            {/* AI Highlights */}
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              <Card className="border-2 border-emerald-200">
                <CardHeader>
                  <Lightbulb className="w-7 h-7 text-emerald-600" />
                  <CardTitle>AI help in every step</CardTitle>
                  <CardDescription className="text-gray-700">Hints, tooltips and contextual guidance without giving stock tips.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-amber-200">
                <CardHeader>
                  <BookOpen className="w-7 h-7 text-amber-600" />
                  <CardTitle>Instant, dynamic quizzes</CardTitle>
                  <CardDescription className="text-gray-700">Generated from current quarter events to test understanding.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <Target className="w-7 h-7 text-purple-600" />
                  <CardTitle>AI quarter review</CardTitle>
                  <CardDescription className="text-gray-700">Critiques rebalancing decisions and highlights risks.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <Zap className="w-7 h-7 text-blue-600" />
                  <CardTitle>SEBI-aligned guidance</CardTitle>
                  <CardDescription className="text-gray-700">Education-focused, compliant insights—not recommendations.</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Mechanics & Objectives */}
            <section className="mb-10 text-left">
              <div className="mb-3">
                <p className="text-xs uppercase tracking-wider text-gray-500">Core mechanics</p>
                <h2 className="text-xl font-semibold text-gray-900">Game mechanics at a glance</h2>
                <p className="text-sm text-gray-600">Understand how returns are computed, how events move markets, and what unlocks each step.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-white/60">
                  <div className="mt-0.5"><Percent className="w-5 h-5 text-emerald-600" /></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Returns</h3>
                    <p className="text-sm text-gray-700">Quarter Return = ((Vq − Vq-1) / Vq-1) × 100. Total return tracks growth from starting capital.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-white/60">
                  <div className="mt-0.5"><Activity className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Event impact</h3>
                    <p className="text-sm text-gray-700">Events have direction and impact scores with a shock/decay profile that flows into sectors and stocks.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-white/60">
                  <div className="mt-0.5"><BookOpen className="w-5 h-5 text-amber-600" /></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Quiz gating</h3>
                    <p className="text-sm text-gray-700">Pass a short, dynamic quiz based on events to unlock rebalancing each quarter.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-white/60">
                  <div className="mt-0.5"><Coins className="w-5 h-5 text-purple-600" /></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Trading constraints</h3>
                    <p className="text-sm text-gray-700">Trade whole shares; cash must remain non‑negative. No leverage. AI flags risky actions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-white/60">
                  <div className="mt-0.5"><ShieldCheck className="w-5 h-5 text-indigo-600" /></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Diversification</h3>
                    <p className="text-sm text-gray-700">Watch concentration and sector exposure. AI highlights imbalance and suggests safer mixes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-white/60">
                  <div className="mt-0.5"><Calendar className="w-5 h-5 text-sky-600" /></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Progression</h3>
                    <p className="text-sm text-gray-700">Play through 12 quarters, compounding decisions and performance along the way.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="lg"
                onClick={startNewGame}
                className="px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Your Quest
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (isGameComplete) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <GameReport />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 overflow-auto">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-r from-emerald-500/8 to-blue-500/8 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-500/8 to-purple-500/8 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        <GameIntroHeader />

        {/* Removed top-level QuarterHUD (redundant with Vertical HUD) */}

        {/* Portfolio Overview - full width on top; sticky for constant visibility */}
        <div className="mt-4 sticky top-2 z-30">
          <Card className="bg-white/80 backdrop-blur-xl border-brand-200 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Portfolio Overview</span>
                <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-emerald-500/15 rounded-full border border-emerald-400/30">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-emerald-700 font-semibold">AI ACTIVE</span>
                </div>
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                {gameState.currentQuarter === 0
                  ? 'Build your initial portfolio with AI-powered market insights'
                  : 'Optimize your portfolio based on current market conditions'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-5">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-xl border border-emerald-400/20">
                  <div className="text-2xl font-bold text-emerald-500">₹{(invested / 100000).toFixed(1)}L</div>
                  <div className="text-sm text-gray-600 font-medium">Invested</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl border border-blue-400/20">
                  <div className="text-2xl font-bold text-blue-500">₹{(availableCash / 100000).toFixed(1)}L</div>
                  <div className="text-sm text-gray-600 font-medium">Available Cash</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl border border-purple-400/20">
                  <div className="text-2xl font-bold text-purple-500">{diversificationScore.toFixed(0)}</div>
                  <div className="text-sm text-gray-600 font-medium">Diversification Score</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl border border-orange-400/20">
                  <div className="text-2xl font-bold text-orange-500">{concentrationRisk.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600 font-medium">Max Concentration</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200">
                  <div className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%</div>
                  <div className="text-sm text-gray-600 font-medium">Total Return</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl border border-amber-400/20">
                  <div className="text-2xl font-bold text-amber-600">{currentRiskScore.toFixed(0)}</div>
                  <div className="text-sm text-gray-600 font-medium">Risk Score</div>
                </div>
              </div>

              {/* Attention-grabbing risk alerts */}
              <div className="space-y-2">
                {concentrationRisk > 25 && (
                  <Alert className="border-l-4 border-red-400 bg-red-50/90">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      High concentration risk: One holding exceeds 25% of portfolio
                    </AlertDescription>
                  </Alert>
                )}
                {Object.values(sectorWeights).some(w => (w as number) > 40) && (
                  <Alert className="border-l-4 border-amber-400 bg-amber-50/90">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      Sector concentration: Over 40% allocated to a single sector
                    </AlertDescription>
                  </Alert>
                )}
                {gameState.portfolio.length > 0 && gameState.portfolio.length < 5 && (
                  <Alert className="border-l-4 border-blue-400 bg-blue-50/90">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Consider adding more stocks for better diversification
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance section moved below Portfolio Builder (Step 3) */}

        {/* Guided Steps: Horizontal stepper */}
        <div className="mt-4 mb-6">
          <div className="bg-white/80 backdrop-blur-xl border border-brand-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center justify-center gap-0 overflow-x-auto whitespace-nowrap">
                {/* Step 1: Review Events */}
                <div className="flex items-center gap-0 min-w-[220px] shrink-0">
                  <button type="button" onClick={() => setManualStep(1)} className={`relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 bg-white/80 shadow-sm hover:shadow-md transition-all ${eventsReviewed ? 'border-emerald-200' : stepToShow === 1 ? 'border-amber-200' : 'border-gray-200'}`}>
                    <div className="absolute top-1.5 right-1.5">
                      {eventsReviewed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : stepToShow === 1 ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <Calendar className={`w-4 h-4 ${eventsReviewed ? 'text-emerald-600' : stepToShow === 1 ? 'text-amber-600' : 'text-gray-400'}`} />
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">Review Events</div>
                      <div className="text-xs text-gray-600">See Q{gameState.currentQuarter} market events</div>
                    </div>
                  </button>
                  <div aria-hidden className="relative -ml-1 sm:-ml-1 md:-ml-1.5 lg:-ml-2 flex items-center shrink-0 z-0 select-none">
                    <div className="h-1 md:h-1.5 w-12 sm:w-14 md:w-16 lg:w-20 bg-gray-200 rounded-full" />
                    <ArrowRight className="w-4 h-4 text-gray-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Step 2: Pass Quiz */}
                <div className="flex items-center gap-0 min-w-[200px] shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => { if (2 <= derivedStep) setManualStep(2) }}
                        aria-disabled={2 > derivedStep}
                        className={`relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 bg-white/80 shadow-sm hover:shadow-md transition-all ${quizPassed ? 'border-emerald-200' : stepToShow === 2 ? 'border-amber-200' : 'border-gray-200'} ${2 > derivedStep ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                    <div className="absolute top-1.5 right-1.5">
                      {quizPassed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : stepToShow === 2 ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : eventsReviewed ? (
                        <Clock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <BookOpen className={`w-4 h-4 ${quizPassed ? 'text-emerald-600' : stepToShow === 2 ? 'text-amber-600' : 'text-gray-400'}`} />
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">Pass Quiz</div>
                      <div className="text-xs text-gray-600">Unlock rebalancing</div>
                    </div>
                      </button>
                    </TooltipTrigger>
                    {2 > derivedStep && (
                      <TooltipContent sideOffset={6}>Complete Step 1 first</TooltipContent>
                    )}
                  </Tooltip>
                  <div aria-hidden className="relative -ml-1 sm:-ml-1 md:-ml-1.5 lg:-ml-2 flex items-center shrink-0 z-0 select-none">
                    <div className="h-1 md:h-1.5 w-12 sm:w-14 md:w-16 lg:w-20 bg-gray-200 rounded-full" />
                    <ArrowRight className="w-4 h-4 text-gray-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Step 3: Rebalance */}
                <div className="flex items-center gap-0 min-w-[200px] shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => { if (3 <= derivedStep) setManualStep(3) }}
                        aria-disabled={3 > derivedStep}
                        className={`relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 bg-white/80 shadow-sm hover:shadow-md transition-all ${rebalanced ? 'border-emerald-200' : stepToShow === 3 ? 'border-amber-200' : 'border-gray-200'} ${3 > derivedStep ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                    <div className="absolute top-1.5 right-1.5">
                      {rebalanced ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : stepToShow === 3 ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : quizPassed ? (
                        <Clock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <TrendingUp className={`w-4 h-4 ${rebalanced ? 'text-emerald-600' : stepToShow === 3 ? 'text-amber-600' : 'text-gray-400'}`} />
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">Rebalance</div>
                      <div className="text-xs text-gray-600">Adjust holdings</div>
                    </div>
                      </button>
                    </TooltipTrigger>
                    {3 > derivedStep && (
                      <TooltipContent sideOffset={6}>Pass the quiz first</TooltipContent>
                    )}
                  </Tooltip>
                  <div aria-hidden className="relative -ml-1 sm:-ml-1 md:-ml-1.5 lg:-ml-2 flex items-center shrink-0 z-0 select-none">
                    <div className="h-1 md:h-1.5 w-12 sm:w-14 md:w-16 lg:w-20 bg-gray-200 rounded-full" />
                    <ArrowRight className="w-4 h-4 text-gray-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Step 4: AI Review */}
                <div className="flex items-center min-w-[200px] shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => { if (4 <= derivedStep) setManualStep(4) }}
                        aria-disabled={4 > derivedStep}
                        className={`relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 bg-white/80 shadow-sm hover:shadow-md transition-all ${stepToShow === 4 ? 'border-amber-200' : aiReviewed ? 'border-emerald-200' : 'border-gray-200'} ${4 > derivedStep ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                    <div className="absolute top-1.5 right-1.5">
                      {aiReviewed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : stepToShow === 4 ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : rebalanced ? (
                        <Clock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <PieChart className={`w-4 h-4 ${stepToShow === 4 ? 'text-amber-600' : aiReviewed ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">AI Review</div>
                      <div className="text-xs text-gray-600">Summary insights</div>
                    </div>
                      </button>
                    </TooltipTrigger>
                    {4 > derivedStep && (
                      <TooltipContent sideOffset={6}>Submit or skip rebalancing first</TooltipContent>
                    )}
                  </Tooltip>
                  <div aria-hidden className="relative -ml-1 sm:-ml-1 md:-ml-1.5 lg:-ml-2 flex items-center shrink-0 z-0 select-none">
                    <div className="h-1 md:h-1.5 w-12 sm:w-14 md:w-16 lg:w-20 bg-gray-200 rounded-full" />
                    <ArrowRight className="w-4 h-4 text-gray-400 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Step 5: Performance Review */}
                <div className="flex items-center min-w-[220px] shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => { if (5 <= derivedStep) setManualStep(5) }}
                        aria-disabled={5 > derivedStep}
                        className={`relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 bg-white/80 shadow-sm hover:shadow-md transition-all ${stepToShow === 5 ? 'border-amber-200' : aiReviewed ? 'border-gray-200' : 'border-gray-200'} ${5 > derivedStep ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                    <div className="absolute top-1.5 right-1.5">
                      {performanceReviewed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : stepToShow === 5 ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : aiReviewed ? (
                        <Clock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <Activity className={`w-4 h-4 ${stepToShow === 5 ? 'text-amber-600' : performanceReviewed ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <div className="text-sm">
                      <div className="font-medium text-gray-800">Performance</div>
                      <div className="text-xs text-gray-600">Charts & AI tips</div>
                    </div>
                      </button>
                    </TooltipTrigger>
                    {5 > derivedStep && (
                      <TooltipContent sideOffset={6}>Complete AI Review first</TooltipContent>
                    )}
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Consolidated guided journey (removed AI Guidance tab) */}
          <div className="space-y-6" aria-label="DiversifyQuest sections">
              <div className="grid lg:grid-cols-12 gap-5 md:gap-6">
                <div className="lg:col-span-2">
                  <VerticalQuarterHUD currentQuarter={gameState.currentQuarter} />
                </div>
                <div className={`${stepToShow === 5 ? 'lg:col-span-10' : (stepToShow === 2 || stepToShow === 3) ? 'lg:col-span-6' : 'lg:col-span-7'} space-y-3`}>
                  {stepToShow === 1 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-success-600" />
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Step 1: Review Market Events</h2>
                          </div>
                          <p className="text-base text-gray-600 mt-1">Read through the quarter's events and click "Mark Reviewed" to continue.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {derivedStep >= 2 && (
                            <Button variant="secondary" size="sm" onClick={() => setManualStep(2)} className="gap-1">
                              Go to Step 2
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <EventDeck currentQuarter={gameState.currentQuarter} />
                    </div>
                  )}
                  {stepToShow === 2 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-warning-600" />
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Step 2: Quarter Quiz</h2>
                          </div>
                          <p className="text-base text-gray-600 mt-1">Answer correctly to unlock rebalancing. Tip: Use the Market Events panel on the right—questions reflect this quarter's events.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setManualStep(1)} className="gap-1">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Step 1
                          </Button>
                          {derivedStep >= 3 && (
                            <Button variant="secondary" size="sm" onClick={() => setManualStep(3)} className="gap-1">
                              Go to Step 3
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <QuarterQuiz currentQuarter={gameState.currentQuarter} onRegisterActions={setQuizActions} />
                    </div>
                  )}
                  {stepToShow === 3 && (
                    <>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-brand-600" />
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Step 3: Rebalance Portfolio</h2>
                          </div>
                          <p className="text-base text-gray-600 mt-1">Select stocks and weights to diversify. Consider current Market Events (right) as they can impact returns.</p>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setManualStep(2)} className="gap-1">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Step 2
                          </Button>
                          {derivedStep >= 4 && (
                            <Button variant="secondary" size="sm" onClick={() => setManualStep(4)} className="gap-1">
                              Go to Step 4
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <PortfolioBuilder
                        onRebalance={(h, cash) => rebalancePortfolio(h, cash)}
                        onProceed={() => {
                          // After submit/skip, show AI Review (Step 4)
                          setManualStep(null)
                        }}
                        onRegisterActions={setRebalanceActions}
                      />

                      {/* Removed in-column Performance; now rendered full-width below grid */}
                    </>
                  )}
                  {stepToShow === 4 && (
                    <>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <PieChart className="w-6 h-6 text-purple-600" />
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Step 4: AI Review</h2>
                          </div>
                          <p className="text-base text-gray-600 mt-1">AI summary of your quiz and rebalancing decisions.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setManualStep(3)} className="gap-1">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Step 3
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => { markAIReviewed(gameState.currentQuarter); setManualStep(5) }} className="gap-1">
                            Go to Step 5
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <AIReview onProceed={() => { setManualStep(null); markAIReviewed(gameState.currentQuarter) }} />

                      {/* Removed in-column Performance; now rendered full-width below grid */}
                    </>
                  )}
                  {stepToShow === 5 && (
                    <>
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Step 5: Performance Review</h2>
                          </div>
                          <p className="text-base text-gray-600 mt-1">Interpret charts and learn how to analyze your portfolio.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => setManualStep(4)} className="gap-1">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Step 4
                          </Button>
                        </div>
                      </div>
                      <PerformanceReview onProceed={() => { markPerformanceReviewed(gameState.currentQuarter); proceedToNextQuarter(); setManualStep(null) }} />
                    </>
                  )}
                </div>
                {stepToShow !== 5 && (
                <div className={`${(stepToShow === 2 || stepToShow === 3) ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-3`}>
                  {/* Understanding card appears only in Step 1 (right column) */}
                  {stepToShow === 1 && (
                    <UnderstandingMarketEventsCard />
                  )}

                  {/* Show current quarter events for Quiz (Step 2) and Rebalance (Step 3) */}
                  {(stepToShow === 2 || stepToShow === 3) && (
                    <EventDeck currentQuarter={gameState.currentQuarter} />
                  )}

                  {/* SEBI Principles for Step 4 (right column) */}
                  {stepToShow === 4 && (
                    <SebiPrinciplesCard />
                  )}
                </div>
                )}
              </div>
            </div>
        </div>

        {/* Performance is now a dedicated Step 5 above; removed the full-width section */}
      </div>
    </div>
  )
}
