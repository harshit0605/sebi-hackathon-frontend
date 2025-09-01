"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Target, TrendingUp, Calendar, Lightbulb, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GameHeaderProps {
  currentQuarter: number
  portfolioValue: number
  totalReturn: number
  hintsRemaining: number
}

export function GameHeader({
  currentQuarter,
  portfolioValue,
  totalReturn,
  hintsRemaining
}: GameHeaderProps) {
  const router = useRouter()
  const progressPercentage = (currentQuarter / 12) * 100

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-brand-200 p-6 mb-6 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 animate-pulse"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-gray-700 hover:text-gray-900 hover:bg-brand-50 border border-brand-200 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Game
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">DiversifyQuest</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-400/30 backdrop-blur-sm">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-yellow-800 font-semibold">{hintsRemaining} hints left</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-white to-gray-50 border-brand-200 backdrop-blur-sm hover:border-brand-300 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-700 mb-1 font-medium">Quarter</p>
                    <p className="text-2xl font-bold text-gray-900">{currentQuarter}/12</p>
                    <p className="text-xs text-gray-600">Year {Math.ceil(currentQuarter / 4)} of 3</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 font-medium">Progress</span>
                    <span className="text-xs text-emerald-700 font-semibold">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3 bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Portfolio Value</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{(portfolioValue / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Starting: ₹10.0L
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={`bg-gradient-to-r ${totalReturn >= 0
                ? 'from-success-50 to-success-100 border-success-200'
                : 'from-danger-50 to-danger-100 border-danger-200'
              }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${totalReturn >= 0 ? 'text-success-700' : 'text-danger-700'
                      }`}>
                      Total Return
                    </p>
                    <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-success-900' : 'text-danger-900'
                      }`}>
                      {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
                    </p>
                  </div>
                  <TrendingUp className={`w-8 h-8 ${totalReturn >= 0 ? 'text-success-500' : 'text-danger-500'
                    } ${totalReturn < 0 ? 'rotate-180' : ''}`} />
                </div>
                <p className={`text-xs mt-1 ${totalReturn >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                  {totalReturn >= 0 ? 'Profit' : 'Loss'}: ₹{Math.abs(portfolioValue - 1000000).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-warning-700">AI Hints</p>
                    <p className="text-2xl font-bold text-warning-900">
                      {hintsRemaining}/6
                    </p>
                  </div>
                  <Lightbulb className="w-8 h-8 text-warning-500" />
                </div>
                <p className="text-xs text-warning-600 mt-1">
                  Use wisely for guidance
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
