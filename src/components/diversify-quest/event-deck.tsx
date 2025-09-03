"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGameState, type GameEvent } from '@/hooks/use-game-state'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Globe,
  Building2,

  DollarSign,
  Calendar,
  Target,
  Info,
  Shield,
  Flame
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

interface EventDeckProps {
  currentQuarter: number
}

function getConfidenceColor(confidence: GameEvent['confidence']) {
  switch (confidence) {
    case 'high': return 'text-success-600 bg-success-50'
    case 'medium': return 'text-warning-600 bg-warning-50'
    case 'low': return 'text-danger-600 bg-danger-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function EventDeck({ currentQuarter }: EventDeckProps) {
  const { gameState, markEventsReviewed } = useGameState()
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null)

  // Get current quarter events
  const currentQuarterData = gameState.quarterHistory.find(q => q.quarter === currentQuarter)
  const events = currentQuarterData?.events || []
  const reviewed = currentQuarterData?.eventsReviewed === true


  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white to-emerald-50/40 backdrop-blur-xl border border-emerald-200 shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Calendar className="w-5 h-5 text-brand-500" />
                Q{currentQuarter} Market Events
              </CardTitle>
              {/* <CardDescription className="text-gray-600">
                Key events and market developments affecting this quarter's performance
              </CardDescription> */}
            </div>

            <div className="ml-2">
              <Button
                variant="secondary"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white gap-1"
                disabled={reviewed}
                onClick={() => markEventsReviewed(currentQuarter)}
              >
                {reviewed ? 'Already Reviewed' : 'Mark Reviewed'}
              </Button>
            </div>
          </div>
          <CardDescription className="text-gray-600">
            Key events and market developments affecting this quarter's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-700" />
            <AlertDescription className="text-blue-900 text-sm">
              Simulated, educational events. Deterministic per quarter and your portfolio. Not investment advice.
            </AlertDescription>
          </Alert>

          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No major events this quarter</p>
              <p className="text-sm">Market conditions remain stable</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSelected={selectedEvent?.id === event.id}
                  onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => { if (!open) setSelectedEvent(null) }}>
        <DialogContent className="sm:max-w-2xl p-0 bg-transparent shadow-none border-0" showCloseButton>
          <DialogTitle className="sr-only">{selectedEvent?.title || 'Event details'}</DialogTitle>
          {selectedEvent && (
            <EventDetailsCard event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EventCard({
  event,
  isSelected,
  onClick
}: {
  event: GameEvent
  isSelected: boolean
  onClick: () => void
}) {
  const Icon = getEventIcon(event.type)
  const colorClass = getEventColor(event)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          "bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-lg hover:translate-y-0.5",
          isSelected && "ring-2 ring-brand-500",
          event.isUnverifiedTip && "border-amber-300 ring-1 ring-amber-300"
        )}
        onClick={onClick}
      >
        <CardContent className="">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              colorClass === 'success' && "bg-success-100 text-success-600",
              colorClass === 'danger' && "bg-danger-100 text-danger-600",
              colorClass === 'warning' && "bg-warning-100 text-warning-600",
              colorClass === 'gray' && "bg-gray-100 text-gray-600"
            )}>
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-base md:text-lg leading-snug text-gray-900 break-words">{event.title}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {event.isUnverifiedTip && (
                    <Badge variant="outline" className="text-xs uppercase tracking-wide bg-amber-100 text-amber-800 border-amber-300 font-semibold shadow-sm">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={cn("text-xs md:text-sm font-semibold capitalize px-2.5 py-1", getConfidenceColor(event.confidence))}
                      >
                        Confidence: {event.confidence}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>
                      {event.confidence === 'high'
                        ? 'Based on verified reports and strong data'
                        : event.confidence === 'medium'
                          ? 'Based on mixed signals; moderate certainty'
                          : 'Low reliability; treat cautiously'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <p className="text-sm md:text-base text-gray-700 mt-1 line-clamp-2 break-words">{event.description}</p>

              <div className="flex flex-wrap items-center gap-x-6 mt-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 cursor-help">
                      {event.direction === 1 ? (
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-success-600" />
                      ) : event.direction === -1 ? (
                        <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-danger-600" />
                      ) : (
                        <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gray-400" />
                      )}
                      <span className="text-xs md:text-sm font-medium text-gray-700">
                        Direction: {event.direction === 1 ? 'Positive' : event.direction === -1 ? 'Negative' : 'Neutral'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Expected near-term price impact direction. Not a guarantee; combine with confidence and impact score.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <span className="text-xs text-gray-600">Impact score</span>
                      <span className="text-sm md:text-base font-semibold text-gray-900">{event.impactScore.toFixed(0)}/100</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    Higher score means larger estimated market impact for this event.
                  </TooltipContent>
                </Tooltip>

                {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn("text-xs md:text-sm font-semibold capitalize px-2.5 py-1", getConfidenceColor(event.confidence))}
                    >
                      Confidence: {event.confidence}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    {event.confidence === 'high'
                      ? 'Based on verified reports and strong data'
                      : event.confidence === 'medium'
                        ? 'Based on mixed signals; moderate certainty'
                        : 'Low reliability; treat cautiously'}
                  </TooltipContent>
                </Tooltip> */}

                <div className="text-xs md:text-sm text-gray-600">
                  {event.affectedSectors.length > 0 && (
                    <span>Likely affected sectors: {event.affectedSectors.slice(0, 2).join(', ')}{event.affectedSectors.length > 2 ? '…' : ''}</span>
                  )}
                </div>

              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function EventDetailsCard({ event, onClose }: { event: GameEvent; onClose: () => void }) {
  const Icon = getEventIcon(event.type)

  return (
    <Card className="bg-white/90 backdrop-blur-xl border-2 border-brand-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 text-brand-600 rounded-lg">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {event.type}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(getConfidenceColor(event.confidence))}
                >
                  {event.confidence} confidence
                </Badge>
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">Event Description</h4>
          <p className="text-sm text-gray-700">{event.description}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Impact Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Direction:</span>
                <span className="flex items-center gap-1">
                  {event.direction === 1 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-success-500" />
                      Positive
                    </>
                  ) : event.direction === -1 ? (
                    <>
                      <TrendingDown className="w-3 h-3 text-danger-500" />
                      Negative
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      Neutral
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Impact Score:</span>
                <span className="font-medium">{event.impactScore.toFixed(2)}/100</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="capitalize">{event.shockProfile}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">Affected Areas</h4>
            <div className="space-y-2">
              {event.affectedSectors.length > 0 && (
                <div>
                  <span className="text-xs text-gray-600">Sectors:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.affectedSectors.map(sector => (
                      <Badge key={sector} variant="secondary" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {event.affectedStocks.length > 0 && (
                <div>
                  <span className="text-xs text-gray-600">Stocks:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {event.affectedStocks.map(stock => (
                      <Badge key={stock} variant="outline" className="text-xs">
                        {stock}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {event.isUnverifiedTip && (
          <Alert className="border-warning-300 bg-warning-50">
            <AlertTriangle className="h-4 w-4 text-warning-600" />
            <AlertDescription className="text-warning-800">
              <strong>Caution:</strong> This is an unverified market tip. SEBI guidelines recommend
              verifying all information from official sources before making investment decisions.
              Unverified tips can be misleading and may not reflect actual market conditions.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-semibold text-sm text-blue-900 mb-1">Educational Note</h4>
          <p className="text-xs text-blue-800">
            This event demonstrates how external factors can impact stock prices.
            Diversified portfolios are generally better positioned to weather such events.
            Consider how this event might affect your portfolio allocation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function getEventIcon(type: GameEvent['type']) {
  switch (type) {
    case 'earnings': return Building2
    case 'macro': return Globe
    case 'geopolitical': return Shield
    case 'policy': return Target
    case 'commodity': return DollarSign
    case 'sentiment': return Flame
    default: return Info
  }
}

function getEventColor(event: GameEvent) {
  if (event.isUnverifiedTip) return 'warning'
  if (event.direction === 1) return 'success'
  if (event.direction === -1) return 'danger'
  return 'gray'
}

// Exportable: Understanding card to show in Step 1 (not rendered inside EventDeck)
export function UnderstandingMarketEventsCard() {
  return (
    <Card className="bg-gradient-to-br from-white to-blue-50/40 backdrop-blur-xl border-2 border-brand-200 shadow-xl rounded-2xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-lg md:text-xl font-semibold text-gray-900">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
            <Info className="w-5 h-5" />
          </div>
          <span>Understanding Market Events</span>
        </CardTitle>
        <CardDescription className="text-gray-600">Learn what each signal means and how to interpret it.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-8">
          <div className="space-y-4 break-words">
            <h4 className="font-semibold text-sm md:text-base text-gray-900">Event Types</h4>
            <div className="space-y-2.5 text-sm md:text-[15px]">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-blue-500" />
                <span><strong>Earnings:</strong> Company quarterly results</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-green-500" />
                <span><strong>Macro:</strong> Economic indicators & policies</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-purple-500" />
                <span><strong>Geopolitical:</strong> International relations</span>
              </div>
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-yellow-500" />
                <span><strong>Commodity:</strong> Raw material prices</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 break-words">
            <h4 className="font-semibold text-sm md:text-base text-gray-900">How to read an event</h4>
            <div className="space-y-2.5 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-success-600" />
                <span><strong>Direction:</strong> Positive, Negative, or Neutral expected effect.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs bg-success-50 text-success-700 border border-success-200">Confidence: High</span>
                <span className="text-gray-600">How reliable the information is.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium">Impact score:</span>
                <span className="text-gray-700">0–100 estimate of potential market impact.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm md:text-base text-gray-900">SEBI Guidelines</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Diversify across sectors to reduce event impact</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Verify information from official sources</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Avoid making decisions based on unverified tips</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Consider long-term fundamentals over short-term events</span>
            </li>
          </ul>
        </div>

        <Alert className="border-amber-300 bg-amber-50/80">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <AlertDescription className="text-amber-900">
            <strong>Important:</strong> Market events are simulated for educational purposes. Always consult
            official sources and financial advisors for real investment decisions.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
