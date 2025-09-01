"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useGameState } from '@/hooks/use-game-state'
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Award,
  BookOpen,
  RotateCcw,
  Share2,
  Download
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { cn } from '@/lib/utils'

export function GameReport() {
  const { gameState } = useGameState()
  const [selectedSection, setSelectedSection] = useState<'overview' | 'performance' | 'learning' | 'achievements'>('overview')

  // Calculate final metrics
  const finalQuarter = gameState.quarterHistory[gameState.quarterHistory.length - 1]
  const totalReturn = finalQuarter?.totalReturn || 0
  const finalScore = calculateFinalScore(gameState)
  const grade = calculateGrade(totalReturn, finalQuarter?.diversificationScore || 0, finalQuarter?.riskScore || 0)

  // Performance data for charts
  const performanceData = gameState.quarterHistory.map((quarter, index) => ({
    quarter: `Q${quarter.quarter}`,
    portfolioValue: quarter.portfolioValue / 100000,
    totalReturn: quarter.totalReturn,
    diversificationScore: quarter.diversificationScore,
    riskScore: quarter.riskScore,
    benchmark: 1000000 * Math.pow(1.03, index) / 100000 // 3% quarterly benchmark
  }))

  // Learning gaps analysis
  const learningGaps = analyzeLearningGaps(gameState)
  const achievements = gameState.achievements || []

  const sections = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-brand-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quest Complete!</h1>
          <p className="text-xl text-gray-600">Your 3-year diversification journey is complete</p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="text-center">
              <div className={cn(
                "text-3xl font-bold",
                totalReturn >= 0 ? "text-success-600" : "text-danger-600"
              )}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">Total Return</div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-600">{finalScore.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div className="text-center">
              <div className={cn(
                "text-3xl font-bold",
                grade === 'A+' || grade === 'A' ? "text-success-600" :
                  grade === 'B+' || grade === 'B' ? "text-blue-600" :
                    grade === 'C+' || grade === 'C' ? "text-warning-600" : "text-danger-600"
              )}>
                {grade}
              </div>
              <div className="text-sm text-gray-600">Grade</div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-center">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <Button
                      key={section.id}
                      variant={selectedSection === section.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedSection(section.id as any)}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {section.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        {selectedSection === 'overview' && (
          <OverviewSection
            gameState={gameState}
            totalReturn={totalReturn}
            finalScore={finalScore}
            grade={grade}
            performanceData={performanceData}
          />
        )}

        {selectedSection === 'performance' && (
          <PerformanceSection
            gameState={gameState}
            performanceData={performanceData}
          />
        )}

        {selectedSection === 'learning' && (
          <LearningSection
            learningGaps={learningGaps}
            gameState={gameState}
          />
        )}

        {selectedSection === 'achievements' && (
          <AchievementsSection
            achievements={achievements}
            gameState={gameState}
          />
        )}

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Play Again
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Results
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function OverviewSection({
  gameState,
  totalReturn,
  finalScore,
  grade,
  performanceData
}: any) {
  const finalQuarter = gameState.quarterHistory[gameState.quarterHistory.length - 1]

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">₹{(finalQuarter?.portfolioValue / 100000 || 10).toFixed(1)}L</div>
                <div className="text-xs text-gray-600">Final Value</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">{finalQuarter?.diversificationScore.toFixed(0) || 0}</div>
                <div className="text-xs text-gray-600">Diversification</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">{gameState.quarterHistory.filter((q: any) => q.rebalanced).length}</div>
                <div className="text-xs text-gray-600">Rebalances</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">{gameState.hintsUsed}</div>
                <div className="text-xs text-gray-600">Hints Used</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Best Quarter:</span>
                <span className="font-medium text-success-600">
                  +{Math.max(...gameState.quarterHistory.map((q: any) => q.quarterReturn)).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Worst Quarter:</span>
                <span className="font-medium text-danger-600">
                  {Math.min(...gameState.quarterHistory.map((q: any) => q.quarterReturn)).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Volatility:</span>
                <span className="font-medium">
                  {calculateVolatility(gameState.quarterHistory).toFixed(2)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Journey */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`₹${value.toFixed(1)}L`, 'Portfolio Value']} />
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.3}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#6b7280"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Grade Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Breakdown</CardTitle>
          <CardDescription>How your final grade was calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {getReturnGrade(totalReturn)}
              </div>
              <div className="text-sm text-blue-700">Returns</div>
              <div className="text-xs text-blue-600 mt-1">{totalReturn.toFixed(1)}%</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {getDiversificationGrade(finalQuarter?.diversificationScore || 0)}
              </div>
              <div className="text-sm text-green-700">Diversification</div>
              <div className="text-xs text-green-600 mt-1">{finalQuarter?.diversificationScore.toFixed(0) || 0}/100</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {getRiskGrade(finalQuarter?.riskScore || 0)}
              </div>
              <div className="text-sm text-purple-700">Risk Management</div>
              <div className="text-xs text-purple-600 mt-1">{finalQuarter?.riskScore.toFixed(0) || 0}/100</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {getConsistencyGrade(gameState.quarterHistory)}
              </div>
              <div className="text-sm text-yellow-700">Consistency</div>
              <div className="text-xs text-yellow-600 mt-1">
                {gameState.quarterHistory.filter((q: any) => q.quarterReturn > 0).length}/12 positive
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PerformanceSection({ gameState, performanceData }: any) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Returns Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Return']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalReturn"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Total Return"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk & Diversification</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="diversificationScore"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Diversification"
                />
                <Line
                  type="monotone"
                  dataKey="riskScore"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Risk Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quarterly Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`${value.toFixed(2)}%`, 'Quarterly Return']} />
              <Bar
                dataKey="quarterReturn"
                fill="#0ea5e9"
                name="Quarterly Return"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function LearningSection({ learningGaps, gameState }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-500" />
            Learning Gaps Analysis
          </CardTitle>
          <CardDescription>
            Areas for improvement based on your gameplay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {learningGaps.map((gap: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-lg border-l-4",
                  gap.severity === 'high' ? "border-danger-500 bg-danger-50" :
                    gap.severity === 'medium' ? "border-warning-500 bg-warning-50" :
                      "border-blue-500 bg-blue-50"
                )}
              >
                <div className="flex items-start gap-3">
                  {gap.severity === 'high' ? (
                    <AlertTriangle className="w-5 h-5 text-danger-500 mt-0.5" />
                  ) : gap.severity === 'medium' ? (
                    <Target className="w-5 h-5 text-warning-500 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{gap.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{gap.description}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {gap.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEBI Learning Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Key Takeaways</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  Diversification reduces portfolio risk significantly
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  Regular rebalancing maintains target allocation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  Market events impact different sectors differently
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                  Unverified tips can be misleading and risky
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Next Steps</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Study SEBI investor education materials</li>
                <li>• Practice with different market scenarios</li>
                <li>• Learn about fundamental analysis</li>
                <li>• Understand risk tolerance assessment</li>
                <li>• Explore different asset classes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function AchievementsSection({ achievements, gameState }: any) {
  const allAchievements = [
    { id: 'diversification_master', name: 'Diversification Master', icon: '🎯', description: 'Maintained high diversification' },
    { id: 'risk_manager', name: 'Risk Manager', icon: '🛡️', description: 'Kept risk under control' },
    { id: 'consistent_performer', name: 'Consistent Performer', icon: '📈', description: 'Steady positive returns' },
    { id: 'balanced_builder', name: 'Balanced Builder', icon: '⚖️', description: 'Well-balanced portfolio' },
    { id: 'quarter_champion', name: 'Quarter Champion', icon: '👑', description: 'Exceptional quarterly performance' }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Your Achievements
          </CardTitle>
          <CardDescription>
            Badges earned during your diversification journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {allAchievements.map((achievement) => {
              const isUnlocked = achievements.includes(achievement.id)
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    isUnlocked
                      ? "bg-yellow-50 border-yellow-200 text-yellow-900"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-sm opacity-80">{achievement.description}</p>
                    </div>
                    {isUnlocked && (
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function calculateFinalScore(gameState: any): number {
  if (gameState.quarterHistory.length === 0) return 0
  const latestQuarter = gameState.quarterHistory[gameState.quarterHistory.length - 1]
  const returnScore = Math.max(0, latestQuarter.totalReturn * 100)
  const diversificationScore = latestQuarter.diversificationScore * 50
  const consistencyBonus = gameState.quarterHistory.filter((q: any) => q.quarterReturn > 0).length * 100
  return Math.round(returnScore + diversificationScore + consistencyBonus)
}

function calculateGrade(totalReturn: number, diversificationScore: number, riskScore: number): string {
  const returnGrade = getReturnGradeValue(totalReturn)
  const diversificationGrade = getDiversificationGradeValue(diversificationScore)
  const riskGrade = getRiskGradeValue(riskScore)

  const avgGrade = (returnGrade + diversificationGrade + riskGrade) / 3

  if (avgGrade >= 9) return 'A+'
  if (avgGrade >= 8) return 'A'
  if (avgGrade >= 7) return 'B+'
  if (avgGrade >= 6) return 'B'
  if (avgGrade >= 5) return 'C+'
  if (avgGrade >= 4) return 'C'
  return 'D'
}

function getReturnGrade(totalReturn: number): string {
  if (totalReturn >= 25) return 'A+'
  if (totalReturn >= 20) return 'A'
  if (totalReturn >= 15) return 'B+'
  if (totalReturn >= 10) return 'B'
  if (totalReturn >= 5) return 'C+'
  if (totalReturn >= 0) return 'C'
  return 'D'
}

function getReturnGradeValue(totalReturn: number): number {
  if (totalReturn >= 25) return 10
  if (totalReturn >= 20) return 9
  if (totalReturn >= 15) return 8
  if (totalReturn >= 10) return 7
  if (totalReturn >= 5) return 6
  if (totalReturn >= 0) return 5
  return 3
}

function getDiversificationGrade(score: number): string {
  if (score >= 85) return 'A+'
  if (score >= 75) return 'A'
  if (score >= 65) return 'B+'
  if (score >= 55) return 'B'
  if (score >= 45) return 'C+'
  if (score >= 35) return 'C'
  return 'D'
}

function getDiversificationGradeValue(score: number): number {
  if (score >= 85) return 10
  if (score >= 75) return 9
  if (score >= 65) return 8
  if (score >= 55) return 7
  if (score >= 45) return 6
  if (score >= 35) return 5
  return 3
}

function getRiskGrade(score: number): string {
  if (score <= 40) return 'A+'
  if (score <= 50) return 'A'
  if (score <= 60) return 'B+'
  if (score <= 70) return 'B'
  if (score <= 80) return 'C+'
  if (score <= 90) return 'C'
  return 'D'
}

function getRiskGradeValue(score: number): number {
  if (score <= 40) return 10
  if (score <= 50) return 9
  if (score <= 60) return 8
  if (score <= 70) return 7
  if (score <= 80) return 6
  if (score <= 90) return 5
  return 3
}

function getConsistencyGrade(quarterHistory: any[]): string {
  const positiveQuarters = quarterHistory.filter(q => q.quarterReturn > 0).length
  const ratio = positiveQuarters / quarterHistory.length

  if (ratio >= 0.9) return 'A+'
  if (ratio >= 0.8) return 'A'
  if (ratio >= 0.7) return 'B+'
  if (ratio >= 0.6) return 'B'
  if (ratio >= 0.5) return 'C+'
  if (ratio >= 0.4) return 'C'
  return 'D'
}

function calculateVolatility(quarterHistory: any[]): number {
  const returns = quarterHistory.map(q => q.quarterReturn)
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
  return Math.sqrt(variance)
}

function analyzeLearningGaps(gameState: any): any[] {
  const gaps = []
  const finalQuarter = gameState.quarterHistory[gameState.quarterHistory.length - 1]

  if (finalQuarter?.diversificationScore < 60) {
    gaps.push({
      title: 'Diversification Improvement Needed',
      description: 'Your portfolio showed low diversification. Consider spreading investments across more sectors and stocks.',
      category: 'diversification',
      severity: 'high'
    })
  }

  if (finalQuarter?.riskScore > 80) {
    gaps.push({
      title: 'Risk Management',
      description: 'High risk exposure detected. Balance volatile sectors with stable ones.',
      category: 'risk',
      severity: 'medium'
    })
  }

  const rebalanceRate = gameState.quarterHistory.filter((q: any) => q.rebalanced).length / gameState.quarterHistory.length
  if (rebalanceRate < 0.3) {
    gaps.push({
      title: 'Rebalancing Frequency',
      description: 'Consider more frequent rebalancing to maintain target allocation.',
      category: 'strategy',
      severity: 'low'
    })
  }

  return gaps
}
