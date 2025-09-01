"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useGameState } from '@/hooks/use-game-state'
import {
  Lightbulb,
  MessageCircle,
  Shield,
  TrendingUp,
  PieChart,
  AlertTriangle,
  BookOpen,
  Target,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface AIGuidanceProps {
  onUseHint: () => void
  hintsRemaining: number
  embedded?: boolean
  showSebiPrinciples?: boolean
}

type HintCategory = 'diversification' | 'risk' | 'rebalancing' | 'events' | 'general'

type Hint = {
  id: string
  category: HintCategory
  title: string
  content: string
  isSebiCompliant: boolean
  priority: 'high' | 'medium' | 'low'
}

export function AIGuidance({ onUseHint, hintsRemaining, embedded = false, showSebiPrinciples = true }: AIGuidanceProps) {
  const { gameState } = useGameState()
  const [selectedCategory, setSelectedCategory] = useState<HintCategory>('diversification')
  const [customQuestion, setCustomQuestion] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'ai'
    content: string
    timestamp: Date
  }>>([])

  const categories = [
    { id: 'diversification' as const, label: 'Diversification', icon: PieChart, color: 'blue' },
    { id: 'risk' as const, label: 'Risk Management', icon: Shield, color: 'red' },
    { id: 'rebalancing' as const, label: 'Rebalancing', icon: Target, color: 'green' },
    { id: 'events' as const, label: 'Market Events', icon: TrendingUp, color: 'purple' },
    { id: 'general' as const, label: 'General Tips', icon: BookOpen, color: 'gray' }
  ]

  // Generate contextual hints based on current portfolio state
  const generateContextualHints = (): Hint[] => {
    const hints: Hint[] = []
    const portfolio = gameState.portfolio

    // Calculate portfolio metrics
    const sectorAllocation = portfolio.reduce((acc, holding) => {
      acc[holding.stock.sector] = (acc[holding.stock.sector] || 0) + holding.weight
      return acc
    }, {} as Record<string, number>)

    const maxConcentration = Math.max(...portfolio.map(h => h.weight), 0)
    const maxSectorConcentration = Math.max(...Object.values(sectorAllocation), 0)

    // Diversification hints
    if (maxConcentration > 25) {
      hints.push({
        id: 'high-concentration',
        category: 'diversification',
        title: 'High Stock Concentration Detected',
        content: 'SEBI guidelines recommend avoiding concentration of more than 25% in a single stock. Consider reducing your largest holding and diversifying across more stocks to minimize company-specific risk.',
        isSebiCompliant: true,
        priority: 'high'
      })
    }

    if (maxSectorConcentration > 40) {
      hints.push({
        id: 'sector-concentration',
        category: 'diversification',
        title: 'Sector Over-Concentration',
        content: 'Your portfolio has significant exposure to one sector. Diversify across different sectors like Technology, Banking, Healthcare, and Consumer Goods to reduce sector-specific risks.',
        isSebiCompliant: true,
        priority: 'high'
      })
    }

    if (portfolio.length < 5) {
      hints.push({
        id: 'insufficient-diversification',
        category: 'diversification',
        title: 'Increase Portfolio Diversification',
        content: 'Consider holding 8-12 stocks across different sectors for optimal diversification. This helps reduce unsystematic risk while maintaining manageable portfolio complexity.',
        isSebiCompliant: true,
        priority: 'medium'
      })
    }

    // Risk management hints
    const volatileSectors = ['Technology', 'Metals', 'Oil & Gas']
    const volatileExposure = portfolio
      .filter(h => volatileSectors.includes(h.stock.sector))
      .reduce((sum, h) => sum + h.weight, 0)

    if (volatileExposure > 50) {
      hints.push({
        id: 'high-volatility-exposure',
        category: 'risk',
        title: 'High Volatility Sector Exposure',
        content: 'Your portfolio has significant exposure to volatile sectors. Consider balancing with stable sectors like Consumer Goods, Utilities, or Banking to reduce overall portfolio volatility.',
        isSebiCompliant: true,
        priority: 'medium'
      })
    }

    // Rebalancing hints
    const currentQuarterData = gameState.quarterHistory.find(q => q.quarter === gameState.currentQuarter)
    if (currentQuarterData && !currentQuarterData.rebalanced && gameState.currentQuarter > 1) {
      hints.push({
        id: 'rebalancing-reminder',
        category: 'rebalancing',
        title: 'Consider Quarterly Rebalancing',
        content: 'Regular rebalancing helps maintain your target asset allocation and can improve risk-adjusted returns. Review your portfolio weights and rebalance if they have drifted significantly.',
        isSebiCompliant: true,
        priority: 'medium'
      })
    }

    // Event-based hints
    if (currentQuarterData?.events.some(e => e.isUnverifiedTip)) {
      hints.push({
        id: 'unverified-tips-warning',
        category: 'events',
        title: 'Beware of Unverified Tips',
        content: 'SEBI strongly advises against acting on unverified market tips. Always verify information from official sources and focus on fundamental analysis rather than market rumors.',
        isSebiCompliant: true,
        priority: 'high'
      })
    }

    // General SEBI compliance hints
    hints.push({
      id: 'sebi-guidelines',
      category: 'general',
      title: 'SEBI Investment Guidelines',
      content: 'Follow SEBI guidelines: 1) Diversify across asset classes and sectors, 2) Invest based on research and fundamentals, 3) Avoid insider trading, 4) Maintain proper documentation, 5) Review and rebalance periodically.',
      isSebiCompliant: true,
      priority: 'low'
    })

    return hints
  }

  const contextualHints = generateContextualHints()
  const filteredHints = contextualHints.filter(hint => hint.category === selectedCategory)

  const handleAskQuestion = async () => {
    if (!customQuestion.trim() || hintsRemaining <= 0) return

    setIsAsking(true)

    // Add user question to chat
    const userMessage = {
      type: 'user' as const,
      content: customQuestion,
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, userMessage])

    // Simulate AI response (in real implementation, this would call an AI service)
    setTimeout(() => {
      const aiResponse = generateAIResponse(customQuestion, gameState)
      const aiMessage = {
        type: 'ai' as const,
        content: aiResponse,
        timestamp: new Date()
      }

      setChatHistory(prev => [...prev, aiMessage])
      setIsAsking(false)
      setCustomQuestion('')
      onUseHint()
    }, 1500)
  }

  // Embedded mode: render without Card wrappers to blend within parent container
  if (embedded) {
    return (
      <div className="space-y-6">
        {/* Guidance header with meta row inline */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning-500" />
              <h3 className="text-lg md:text-xl font-bold text-gray-900">AI Investment Guidance</h3>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
              <Badge variant="outline" className="flex items-center gap-1 py-0.5">
                <Lightbulb className="w-3.5 h-3.5" />
                {hintsRemaining} hints remaining
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 py-0.5">
                <Shield className="h-3.5 w-3.5" />
                SEBI compliant
              </Badge>
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-5 gap-2">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex flex-col items-center gap-1 h-auto py-3 md:py-4"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{category.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Contextual Hints */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base capitalize">{selectedCategory} Guidance</h3>
            {filteredHints.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success-500" />
                <p className="text-sm">No specific guidance needed in this category</p>
                <p className="text-xs">Your portfolio looks good!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHints.map((hint) => (
                  <HintCard key={hint.id} hint={hint} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ask AI Mentor (inline, no Card) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-semibold text-gray-900">Ask AI Mentor</h3>
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about diversification, risk management, or specific stocks..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!customQuestion.trim() || hintsRemaining <= 0 || isAsking}
              className="self-end"
            >
              {isAsking ? 'Thinking...' : 'Ask'}
            </Button>
          </div>

          {hintsRemaining <= 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You've used all your hints for this game. Hints reset when you start a new game.
              </AlertDescription>
            </Alert>
          )}

          {chatHistory.length > 0 && (
            <div className="border border-gray-200 rounded-xl bg-white/60 backdrop-blur-sm">
              <ScrollArea className="h-64 p-4">
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg shadow-sm ${message.type === 'user'
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* SEBI Principles intentionally omitted in embedded mode. Use SebiPrinciplesCard separately if needed. */}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-xl border-brand-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning-500" />
            AI Investment Guidance
          </CardTitle>
          <CardDescription>
            Get SEBI-compliant investment advice and portfolio optimization tips
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3" />
                {hintsRemaining} hints remaining
              </Badge>
            </div>
            <Alert className="max-w-md">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                All guidance follows SEBI investment guidelines and educational principles
              </AlertDescription>
            </Alert>
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{category.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Contextual Hints */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm capitalize">{selectedCategory} Guidance</h3>
            {filteredHints.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success-500" />
                <p className="text-sm">No specific guidance needed in this category</p>
                <p className="text-xs">Your portfolio looks good!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHints.map((hint) => (
                  <HintCard key={hint.id} hint={hint} />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Question Section */}
      <Card className="bg-white/80 backdrop-blur-xl border-blue-200 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Ask AI Mentor
          </CardTitle>
          <CardDescription>
            Ask specific questions about your portfolio or investment strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask about diversification, risk management, or specific stocks..."
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!customQuestion.trim() || hintsRemaining <= 0 || isAsking}
              className="self-end"
            >
              {isAsking ? 'Thinking...' : 'Ask'}
            </Button>
          </div>

          {hintsRemaining <= 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You've used all your hints for this game. Hints reset when you start a new game.
              </AlertDescription>
            </Alert>
          )}

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="border border-gray-200 rounded-xl bg-white/60 backdrop-blur-sm">
              <ScrollArea className="h-64 p-4">
                <div className="space-y-4">
                  {chatHistory.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg shadow-sm ${message.type === 'user'
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                          }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEBI Educational Content */}
      {showSebiPrinciples && <SebiPrinciplesCard />}
    </div>
  )
}

export function SebiPrinciplesCard() {
  return (
    <Card className="bg-white/80 backdrop-blur-xl border-success-200 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-500" />
          SEBI Investment Principles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Diversification Guidelines</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Spread investments across 8-12 stocks</li>
              <li>• Diversify across different sectors</li>
              <li>• Avoid concentration above 25% in single stock</li>
              <li>• Consider market cap diversification</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Risk Management</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Regular portfolio review and rebalancing</li>
              <li>• Understand risk tolerance</li>
              <li>• Avoid emotional decision making</li>
              <li>• Focus on long-term fundamentals</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function HintCard({ hint }: { hint: Hint }) {
  const [open, setOpen] = useState(false)
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-danger-200 bg-danger-50'
      case 'medium': return 'border-warning-200 bg-warning-50'
      case 'low': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-danger-500" />
      case 'medium': return <Info className="w-4 h-4 text-warning-500" />
      case 'low': return <Lightbulb className="w-4 h-4 text-blue-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-3 sm:p-4 ${getPriorityColor(hint.priority)} hover:bg-white/70 transition-colors`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-start gap-3"
        aria-expanded={open}
      >
        <div className="mt-0.5">
          {getPriorityIcon(hint.priority)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-sm sm:text-[0.95rem] text-gray-900">{hint.title}</h4>
              {hint.isSebiCompliant && (
                <Badge variant="outline" className="text-[10px] bg-green-100 text-green-700 border-green-300">
                  <Shield className="w-3 h-3 mr-1" />
                  SEBI Compliant
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] capitalize">
                {hint.priority}
              </Badge>
            </div>
            <div className="shrink-0 text-gray-500">
              {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pl-7 text-sm text-gray-700">
              {hint.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function generateAIResponse(question: string, gameState: any): string {
  const lowerQuestion = question.toLowerCase()

  if (lowerQuestion.includes('diversif')) {
    return "Diversification is key to reducing portfolio risk. SEBI recommends spreading investments across different sectors and stocks. Aim for 8-12 stocks across at least 4-5 sectors. Avoid putting more than 25% in any single stock or 40% in any single sector."
  }

  if (lowerQuestion.includes('risk')) {
    return "Risk management involves understanding your risk tolerance and maintaining appropriate diversification. Monitor your portfolio's volatility by balancing high-risk sectors (like Technology, Metals) with stable sectors (like Consumer Goods, Banking). Regular rebalancing helps maintain your target risk profile."
  }

  if (lowerQuestion.includes('rebalanc')) {
    return "Rebalancing should be done quarterly or when your portfolio weights drift significantly from targets. This helps maintain your desired risk-return profile and can improve long-term returns through systematic profit-taking and loss-cutting."
  }

  if (lowerQuestion.includes('sector')) {
    return "Sector allocation is crucial for diversification. Consider exposure to: Technology (growth), Banking (stability), Healthcare (defensive), Consumer Goods (stable demand), and Infrastructure (long-term growth). Avoid over-concentration in any single sector."
  }

  return "Based on SEBI guidelines, focus on: 1) Proper diversification across stocks and sectors, 2) Regular portfolio review, 3) Avoiding unverified tips, 4) Long-term investment approach, and 5) Understanding your risk tolerance. Always verify information from official sources before making investment decisions."
}
