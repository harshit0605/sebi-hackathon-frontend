"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGameState } from '@/hooks/use-game-state'
import { Trophy, Medal, Award, TrendingUp, Target, Crown, Star, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type LeaderboardEntry = {
  id: string
  username: string
  score: number
  totalReturn: number
  diversificationScore: number
  riskAdjustedReturn: number
  completedQuarters: number
  achievements: string[]
  rank: number
  isCurrentUser?: boolean
}

type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
}

export function Leaderboard() {
  const { gameState } = useGameState()
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])

  // Mock leaderboard data - in real implementation, this would come from API
  useEffect(() => {
    const mockData: LeaderboardEntry[] = [
      {
        id: '1',
        username: 'InvestorPro',
        score: 8750,
        totalReturn: 24.5,
        diversificationScore: 85,
        riskAdjustedReturn: 18.2,
        completedQuarters: 12,
        achievements: ['diversification_master', 'risk_manager', 'consistent_performer'],
        rank: 1
      },
      {
        id: '2',
        username: 'PortfolioGuru',
        score: 8420,
        totalReturn: 22.1,
        diversificationScore: 82,
        riskAdjustedReturn: 17.8,
        completedQuarters: 12,
        achievements: ['balanced_builder', 'quarter_champion'],
        rank: 2
      },
      {
        id: '3',
        username: 'SmartTrader',
        score: 8150,
        totalReturn: 19.8,
        diversificationScore: 88,
        riskAdjustedReturn: 16.5,
        completedQuarters: 12,
        achievements: ['diversification_master', 'steady_eddie'],
        rank: 3
      },
      {
        id: 'current',
        username: 'You',
        score: calculateCurrentScore(gameState),
        totalReturn: gameState.quarterHistory.length > 0
          ? gameState.quarterHistory[gameState.quarterHistory.length - 1].totalReturn
          : 0,
        diversificationScore: gameState.quarterHistory.length > 0
          ? gameState.quarterHistory[gameState.quarterHistory.length - 1].diversificationScore
          : 0,
        riskAdjustedReturn: 0,
        completedQuarters: gameState.currentQuarter,
        achievements: gameState.achievements,
        rank: 7,
        isCurrentUser: true
      },
      {
        id: '4',
        username: 'RiskMaster',
        score: 7890,
        totalReturn: 18.5,
        diversificationScore: 79,
        riskAdjustedReturn: 15.2,
        completedQuarters: 12,
        achievements: ['risk_manager'],
        rank: 4
      },
      {
        id: '5',
        username: 'DiversifyKing',
        score: 7650,
        totalReturn: 16.2,
        diversificationScore: 92,
        riskAdjustedReturn: 14.8,
        completedQuarters: 12,
        achievements: ['diversification_master', 'sector_spreader'],
        rank: 5
      }
    ].sort((a, b) => b.score - a.score).map((entry, index) => ({ ...entry, rank: index + 1 }))

    setLeaderboardData(mockData)
  }, [gameState])

  const achievements: Achievement[] = [
    {
      id: 'diversification_master',
      name: 'Diversification Master',
      description: 'Maintain 80+ diversification score for 6 quarters',
      icon: '🎯',
      rarity: 'epic'
    },
    {
      id: 'risk_manager',
      name: 'Risk Manager',
      description: 'Keep risk score below 60 throughout the game',
      icon: '🛡️',
      rarity: 'rare'
    },
    {
      id: 'balanced_builder',
      name: 'Balanced Builder',
      description: 'No single stock above 15% allocation',
      icon: '⚖️',
      rarity: 'common'
    },
    {
      id: 'consistent_performer',
      name: 'Consistent Performer',
      description: 'Positive returns in 10+ quarters',
      icon: '📈',
      rarity: 'legendary'
    },
    {
      id: 'quarter_champion',
      name: 'Quarter Champion',
      description: 'Best quarterly return in leaderboard',
      icon: '👑',
      rarity: 'rare'
    }
  ]



  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300'
      case 'legendary': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Global Leaderboard
          </CardTitle>
          <CardDescription>
            Compete with players worldwide and climb the rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">This Week</TabsTrigger>
              <TabsTrigger value="monthly">This Month</TabsTrigger>
              <TabsTrigger value="allTime">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedPeriod} className="mt-4">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {leaderboardData.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <LeaderboardEntry entry={entry} achievements={achievements} />
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Your Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            Your Achievements
          </CardTitle>
          <CardDescription>
            Unlock badges by mastering different aspects of portfolio management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const isUnlocked = gameState.achievements.includes(achievement.id)
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    isUnlocked
                      ? getRarityColor(achievement.rarity)
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className={cn(
                        "font-semibold text-sm",
                        isUnlocked ? "text-current" : "text-gray-400"
                      )}>
                        {achievement.name}
                      </h4>
                      <p className={cn(
                        "text-xs mt-1",
                        isUnlocked ? "text-current opacity-80" : "text-gray-400"
                      )}>
                        {achievement.description}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-2 text-xs capitalize",
                          isUnlocked ? getRarityColor(achievement.rarity) : "bg-gray-100 text-gray-400"
                        )}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                    {isUnlocked && (
                      <div className="text-green-500">
                        <Trophy className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Community Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-sm text-blue-700">Active Players</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">15.2%</div>
              <div className="text-sm text-green-700">Avg. Return</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">73</div>
              <div className="text-sm text-purple-700">Avg. Diversification</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">892</div>
              <div className="text-sm text-yellow-700">Games Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-yellow-500" />
    case 2: return <Medal className="w-5 h-5 text-gray-400" />
    case 3: return <Award className="w-5 h-5 text-amber-600" />
    default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
  }
}

function LeaderboardEntry({
  entry,
  achievements
}: {
  entry: LeaderboardEntry
  achievements: Achievement[]
}) {
  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg border transition-all hover:shadow-md",
      entry.isCurrentUser
        ? "bg-brand-50 border-brand-200 ring-2 ring-brand-500 ring-opacity-20"
        : "bg-white border-gray-200 hover:border-gray-300"
    )}>
      <div className="flex items-center gap-3">
        {getRankIcon(entry.rank)}
        <Avatar className="w-10 h-10">
          <AvatarFallback className={cn(
            entry.isCurrentUser ? "bg-brand-500 text-white" : "bg-gray-200 text-gray-600"
          )}>
            {entry.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-semibold",
            entry.isCurrentUser ? "text-brand-900" : "text-gray-900"
          )}>
            {entry.username}
          </h4>
          {entry.isCurrentUser && (
            <Badge variant="outline" className="text-xs bg-brand-100 text-brand-700 border-brand-300">
              You
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {entry.totalReturn.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {entry.diversificationScore.toFixed(0)}
          </span>
          <span>Q{entry.completedQuarters}/12</span>
        </div>

        <div className="flex items-center gap-1 mt-2">
          {entry.achievements.slice(0, 3).map((achievementId) => {
            const achievement = achievements.find(a => a.id === achievementId)
            return achievement ? (
              <div
                key={achievementId}
                className="text-xs px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded"
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ) : null
          })}
          {entry.achievements.length > 3 && (
            <span className="text-xs text-gray-500">
              +{entry.achievements.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold text-gray-900">
          {entry.score.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">Score</div>
      </div>
    </div>
  )
}

function calculateCurrentScore(gameState: any): number {
  if (gameState.quarterHistory.length === 0) return 0

  const latestQuarter = gameState.quarterHistory[gameState.quarterHistory.length - 1]

  // Score calculation based on multiple factors
  const returnScore = Math.max(0, latestQuarter.totalReturn * 100) // 100 points per 1% return
  const diversificationScore = latestQuarter.diversificationScore * 50 // Up to 5000 points
  const riskPenalty = Math.max(0, (latestQuarter.riskScore - 50) * 10) // Penalty for high risk
  const consistencyBonus = gameState.quarterHistory.filter((q: any) => q.quarterReturn > 0).length * 100
  const rebalancingBonus = gameState.quarterHistory.filter((q: any) => q.rebalanced).length * 50

  return Math.round(returnScore + diversificationScore - riskPenalty + consistencyBonus + rebalancingBonus)
}
