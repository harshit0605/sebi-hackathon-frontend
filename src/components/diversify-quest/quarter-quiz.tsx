"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useGameState, type GameEvent } from '@/hooks/use-game-state'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle } from 'lucide-react'

export type QuizQuestion = {
  id: string
  prompt: string
  options: { id: string; label: string; correct: boolean }[]
}

type QuarterQuizProps = {
  currentQuarter: number
  onRegisterActions?: (actions: { submit: () => void; reset: () => void }) => void
}

export function QuarterQuiz({ currentQuarter, onRegisterActions }: QuarterQuizProps) {
  const { gameState, submitQuizResult, saveQuizAnswer, resetQuiz } = useGameState()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const quarterData = gameState.quarterHistory.find(q => q.quarter === currentQuarter)
  const events = quarterData?.events ?? []
  const persistedAnswers = quarterData?.quizAnswers || {}
  const persistedSubmitted = !!quarterData?.quizSubmitted
  const persistedScore = quarterData?.quizScore ?? 0

  const questions: QuizQuestion[] = useMemo(() => buildQuestionsFromEvents(events), [events])

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
            <span className="text-lg font-semibold">Step 2: Quarter Quiz</span>
            {submitted && (
              <Badge variant="outline" className={passed ? 'border-emerald-300 text-emerald-700' : 'border-amber-300 text-amber-700'}>
                {passed ? 'Passed' : 'Try Again'}
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="text-xs">Q{currentQuarter}</Badge>
        </CardTitle>
        <CardDescription>
          Answer a few questions based on this quarter's events to unlock rebalancing.
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function buildQuestionsFromEvents(events: GameEvent[]): QuizQuestion[] {
  const qs: QuizQuestion[] = []
  const e1 = events[0]
  const e2 = events[1]
  const eTip = events.find(e => e.isUnverifiedTip)

  if (e1) {
    qs.push({
      id: `q-dir-${e1.id}`,
      prompt: `What is the likely price impact direction for: "${e1.title}"?`,
      options: [
        { id: 'pos', label: 'Positive', correct: e1.direction === 1 },
        { id: 'neg', label: 'Negative', correct: e1.direction === -1 },
        { id: 'neu', label: 'Neutral', correct: e1.direction === 0 },
      ],
    })
  }

  if (e2) {
    qs.push({
      id: `q-type-${e2.id}`,
      prompt: `What type of event is: "${e2.title}"?`,
      options: [
        { id: 'earnings', label: 'Earnings', correct: e2.type === 'earnings' },
        { id: 'macro', label: 'Macro', correct: e2.type === 'macro' },
        { id: 'geopolitical', label: 'Geopolitical', correct: e2.type === 'geopolitical' },
        { id: 'policy', label: 'Policy', correct: e2.type === 'policy' },
        { id: 'commodity', label: 'Commodity', correct: e2.type === 'commodity' },
        { id: 'sentiment', label: 'Sentiment', correct: e2.type === 'sentiment' },
      ],
    })
  }

  qs.push({
    id: 'q-sebi-tip',
    prompt: eTip
      ? 'SEBI-compliant behavior regarding unverified tips is:'
      : 'Which is a SEBI-compliant investing behavior?',
    options: eTip
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

  return qs.slice(0, 3)
}
