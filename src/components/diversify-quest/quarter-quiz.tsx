"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useGameState, type GameEvent, type PortfolioHolding } from '@/hooks/use-game-state'
import { cn } from '@/lib/utils'
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'

export type QuizQuestion = {
  id: string
  prompt: string
  options: { id: string; label: string; correct: boolean }[]
}

type QuarterQuizProps = {
  currentQuarter: number
  onRegisterActions?: (actions: { submit: () => void; reset: () => void }) => void
  setManualStep?: (step: number) => void
}

export function QuarterQuiz({ currentQuarter, onRegisterActions, setManualStep }: QuarterQuizProps) {
  const { gameState, submitQuizResult, saveQuizAnswer, resetQuiz } = useGameState()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const quarterData = gameState.quarterHistory.find(q => q.quarter === currentQuarter)
  const events = quarterData?.events ?? []
  const persistedAnswers = quarterData?.quizAnswers || {}
  const persistedSubmitted = !!quarterData?.quizSubmitted
  const persistedScore = quarterData?.quizScore ?? 0

  const questions: QuizQuestion[] = useMemo(() => buildQuestionsFromEvents(events, gameState.portfolio), [events, gameState.portfolio])

  const total = questions.length
  const answered = Object.keys(answers).length
  const canSubmit = total > 0 // Allow submitting even if some questions are unanswered
  const passThreshold = Math.ceil(total * 0.66)
  const passed = score >= passThreshold

  const onSubmit = useCallback(() => {
    let s = 0
    for (const q of questions) {
      const selected = answers[q.id]
      const correct = q.options.find(o => o.correct)?.id
      if (selected === correct) s += 1
    }
    setScore(s)
    setSubmitted(true)
    submitQuizResult(currentQuarter, s, s >= Math.ceil(total * 0.66))
  }, [answers, questions, currentQuarter, submitQuizResult, total])

  const reset = useCallback(() => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
    // Reset persisted quiz state so the user can retake when navigating away/back
    resetQuiz(currentQuarter)
  }, [currentQuarter, resetQuiz])

  // Keep local state in sync with persisted store when quarter or store updates
  useEffect(() => {
    setAnswers(persistedAnswers)
    setSubmitted(persistedSubmitted)
    setScore(persistedScore || 0)
  }, [currentQuarter, persistedAnswers, persistedSubmitted, persistedScore])

  // Register external actions for the parent header buttons
  useEffect(() => {
    if (!onRegisterActions) return
    onRegisterActions({ submit: onSubmit, reset })
  }, [onRegisterActions, onSubmit, reset])

  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/40 backdrop-blur-xl border border-blue-200/70 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* <span className="text-lg font-semibold">Step 2: Quarter Quiz</span> */}
            {submitted && (
              <Badge variant="outline" className={passed ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700'}>
                {passed ? 'Passed' : 'Try Again'}
              </Badge>
            )}
          </div>
          {/* <Badge variant="outline" className="text-xs">Q{currentQuarter}</Badge> */}
        </CardTitle>
        <CardDescription>
          <span className="font-base text-sm flex items-center gap-1">
            <span className="text-xl leading-none">🚨</span>
            <b>NOTE:</b> Use the <b>Market Events</b> panel on the right since questions reflect this quarter's events. <span className="text-xl leading-none">➡️</span>
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-sm text-gray-600">No quiz questions available for this quarter.</div>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="space-y-3 rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm transition hover:shadow-md">
              <div className="font-medium text-gray-900">Q{idx + 1}. {q.prompt}</div>
              <RadioGroup
                value={answers[q.id] || ''}
                onValueChange={(val) => {
                  setAnswers(prev => ({ ...prev, [q.id]: val }))
                  saveQuizAnswer(currentQuarter, q.id, val)
                }}
                className="space-y-2"
              >
                {q.options.map(opt => {
                  const selected = answers[q.id] === opt.id
                  const stateClass = submitted
                    ? (opt.correct ? 'border-emerald-300 bg-emerald-50' : selected ? 'border-red-300 bg-red-50' : 'border-gray-200')
                    : (selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50')
                  return (
                    <Label
                      key={opt.id}
                      htmlFor={`${q.id}-${opt.id}`}
                      className={cn('flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer', stateClass)}
                    >
                      <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} disabled={submitted} />
                      <span className="text-sm flex-1">{opt.label}</span>
                      {submitted && (
                        opt.correct ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : selected ? (
                          <XCircle className="w-4 h-4 text-red-600" />
                        ) : null
                      )}
                    </Label>
                  )
                })}
              </RadioGroup>
            </div>
          ))
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-48">
              <Progress value={total ? (answered / total) * 100 : 0} />
            </div>
            <span className="text-xs text-gray-600">{answered}/{total} answered</span>
            {!submitted && answered < total && (
              <Badge variant="outline" className="border-amber-300 text-amber-700">Unanswered will be marked incorrect</Badge>
            )}
            {submitted && (
              <Badge variant="outline" className={passed ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700'}>
                Score: {score}/{total}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {!submitted && (
              <Button onClick={onSubmit} disabled={!canSubmit} className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
                Submit Quiz
              </Button>
            )}
            {submitted && (
              <Button variant="outline" onClick={reset}>Retake</Button>

            )}
            {submitted && (
              <Button size="sm" onClick={() => setManualStep?.(3)} className="gap-1">
                Go to step 3 <ArrowRight className="w-4 h-4" />
              </Button>
            )}

          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function buildQuestionsFromEvents(events: GameEvent[], portfolio: PortfolioHolding[]): QuizQuestion[] {
  const qs: QuizQuestion[] = []
  const nonTips = events.filter(e => !e.isUnverifiedTip)
  const macro = nonTips.find(e => ['macro', 'policy', 'commodity', 'geopolitical'].includes(e.type)) || nonTips[0]
  const earnings = nonTips.find(e => e.type === 'earnings')
  const tip = events.find(e => e.isUnverifiedTip)

  const SECTOR_POOL = ['Technology', 'Banking', 'Oil & Gas', 'Pharmaceuticals', 'Automobiles', 'Consumer Goods', 'Metals']

  // Helper to get first affected sector or fallback
  const firstSector = (e?: GameEvent): string => {
    if (!e) return 'Banking'
    return e.affectedSectors[0] || 'Banking'
  }

  // Portfolio analytics
  const maxStockWeight = portfolio.length ? Math.max(...portfolio.map(h => h.weight)) : 0
  const sectorWeight: Record<string, number> = {}
  for (const h of portfolio) {
    sectorWeight[h.stock.sector] = (sectorWeight[h.stock.sector] || 0) + h.weight
  }
  const topSector = Object.keys(sectorWeight).sort((a, b) => (sectorWeight[b] || 0) - (sectorWeight[a] || 0))[0]
  const topSectorWeight = topSector ? sectorWeight[topSector] : 0

  // Q1: Direction comprehension for key macro/policy event
  if (macro) {
    if (macro.direction !== 0) {
      qs.push({
        id: `q-dir-${macro.id}`,
        prompt: `What is the likely price impact direction for: "${macro.title}" event?`,
        options: [
          { id: 'pos', label: 'Positive', correct: macro.direction === 1 },
          { id: 'neg', label: 'Negative', correct: macro.direction === -1 },
          { id: 'neu', label: 'Neutral', correct: false },
        ],
      })
    } else {
      // When direction is uncertain, test prudent behavior
      qs.push({
        id: `q-uncertain-${macro.id}`,
        prompt: `Direction for "${macro.title} event" is uncertain. Which approach is most prudent?`,
        options: [
          { id: 'concentrate', label: 'Make a concentrated bet to maximize potential upside', correct: false },
          { id: 'balanced', label: 'Wait for more confirmation; size positions conservatively and stay diversified', correct: true },
          { id: 'leverage', label: 'Use leverage to amplify returns this quarter', correct: false },
        ],
      })
    }
  }

  // Q2: Sector impact given the macro/policy event
  if (macro) {
    const sec = firstSector(macro)
    const distractors = SECTOR_POOL.filter(s => s !== sec).slice(0, 2)
    const prompt = macro.direction === -1
      ? `Which sector is MOST likely to face near-term pressure from: "${macro.title} event"?`
      : `Which sector is MOST likely to benefit from: "${macro.title}" event?`
    qs.push({
      id: `q-sector-${macro.id}`,
      prompt,
      options: [
        { id: 's1', label: sec, correct: true },
        { id: 's2', label: distractors[0] || 'Technology', correct: false },
        { id: 's3', label: distractors[1] || 'Automobiles', correct: false },
      ],
    })
  }

  // Q3: Shock/decay profile understanding
  if (macro) {
    const shockDesc = macro.shockProfile === 'impulse'
      ? 'Often sharp and fades relatively quickly'
      : macro.shockProfile === 'step'
        ? 'Immediate re-pricing that persists for a while'
        : 'Gradual build-up over time'
    qs.push({
      id: `q-shock-${macro.id}`,
      prompt: `Which description BEST fits the impact profile for "${macro.title}" event (shock: ${macro.shockProfile}, half-life: ${macro.decayHalfLife})?`,
      options: [
        { id: 'impulse', label: 'Sudden impact that fades relatively quickly', correct: macro.shockProfile === 'impulse' },
        { id: 'step', label: 'Immediate re-pricing that tends to persist', correct: macro.shockProfile === 'step' },
        { id: 'ramp', label: 'Gradual impact accumulating over time', correct: macro.shockProfile === 'ramp' },
      ],
    })
  }

  // Q4: Diversification and concentration gotcha (uses portfolio + event)
  if (macro) {
    const impactsTopSectorNeg = topSector && macro.direction === -1 && macro.affectedSectors.includes(topSector)
    const prompt = impactsTopSectorNeg
      ? `Your portfolio has ~${topSectorWeight.toFixed(0)}% in ${topSector}. "${macro.title}" event likely hurts this sector. What is the MOST prudent action?`
      : 'Which action aligns BEST with prudent diversification and risk management?'
    qs.push({
      id: `q-div-${macro.id}-${topSector || 'none'}`,
      prompt,
      options: [
        { id: 'trim', label: 'Gradually rebalance away from concentration and diversify across sectors', correct: true },
        { id: 'double', label: 'Double down to average down and recover faster', correct: false },
        { id: 'allin', label: 'Move 80%+ to a single sector to maximize potential returns', correct: false },
      ],
    })
  }

  // Q5: Earnings nuance (beat/miss vs guidance/valuation)
  if (earnings) {
    const isBeat = /Beat/i.test(earnings.title)
    qs.push({
      id: `q-earn-${earnings.id}`,
      prompt: `${earnings.title}. What is the MOST prudent reaction?`,
      options: [
        { id: 'chase', label: 'Enter/exit immediately based solely on the headline', correct: false },
        { id: 'context', label: 'Consider guidance quality, valuation, and position sizing before acting', correct: true },
        { id: 'rumor', label: 'Rely on social media buzz to decide', correct: false },
      ],
    })
  }

  // Q6: SEBI-aligned behavior for unverified tips or general compliance
  qs.push({
    id: 'q-sebi-tip',
    prompt: tip ? 'SEBI-compliant behavior regarding unverified tips is:' : 'Which is a SEBI-compliant investing behavior?',
    options: tip
      ? [
        { id: 'act', label: 'Act quickly on hot tips to maximize gains', correct: false },
        { id: 'verify', label: 'Verify information from official sources before acting', correct: true },
        { id: 'ignore', label: 'Ignore all official sources', correct: false },
      ]
      : [
        { id: 'div', label: 'Diversify across sectors to reduce event impact', correct: true },
        { id: 'all-in', label: 'Put 80%+ in a single stock for faster returns', correct: false },
        { id: 'rumors', label: 'Trade based on market rumors', correct: false },
      ],
  })

  // Q7: Confidence weighting (if available)
  if (macro) {
    qs.push({
      id: `q-conf-${macro.id}`,
      prompt: `This event has ${macro.confidence} confidence. How should that affect your decision-making?`,
      options: [
        { id: 'overweight', label: 'Overweight decisions based on this single event', correct: false },
        { id: 'size', label: 'Use as one input; size positions conservatively when confidence is lower', correct: true },
        { id: 'ignore', label: 'Ignore risk management because confidence is stated', correct: false },
      ],
    })
  }

  // Q8: Single-stock concentration risk
  if (maxStockWeight >= 30) {
    const maxPct = Math.round(maxStockWeight)
    qs.push({
      id: `q-concentration-${maxPct}`,
      prompt: `Your largest single-stock position is ~${maxPct}% of the portfolio. What aligns BEST with prudent risk management?`,
      options: [
        { id: 'rebalance', label: 'Rebalance to reduce single-name concentration and diversify', correct: true },
        { id: 'double', label: 'Increase the position to lower average cost', correct: false },
        { id: 'ignore', label: 'Ignore concentration as long as the stock is high quality', correct: false },
      ],
    })
  }

  // Cap to 6-7 questions for focus
  return qs.slice(0, 7)
}
