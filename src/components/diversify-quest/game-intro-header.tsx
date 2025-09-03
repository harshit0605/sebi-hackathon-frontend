"use client"

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Target, PieChart, Calendar, Lightbulb, BookOpen, Activity, ArrowRight } from 'lucide-react'

export type GameIntroHeaderProps = {}

export function GameIntroHeader({ }: GameIntroHeaderProps) {
  const router = useRouter()

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-200 bg-white/80 backdrop-blur-xl shadow-2xl p-6">
      {/* soft gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-400/15 to-blue-400/15 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-gradient-to-tr from-purple-400/15 to-pink-400/15 blur-2xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">DiversifyQuest</h1>
            <div className="ml-6 pt-2 hidden md:block">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-800 font-medium">1. Review Events</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span className="text-gray-800 font-medium">2. Take Quiz</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-800 font-medium">3. Rebalance</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-800 font-medium">4. AI Review</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-800 font-medium">5. Performance</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="text-gray-700 hover:text-gray-900 hover:bg-brand-50 border border-brand-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Game
          </Button>
        </div>

        {/* Flow timeline */}
        {/* <div className="mb-4 hidden md:block">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-gray-800 font-medium">1. Review Events</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="text-gray-800 font-medium">2. Take Quiz</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-800 font-medium">3. Rebalance</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-gray-800 font-medium">4. AI Review</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white/70">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-gray-800 font-medium">5. Performance</span>
            </div>
          </div>
        </div> */}

        <div className="grid gap-4 md:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="md:col-span-3"
          >
            <h2 className="text-xl font-semibold text-gray-900">Master diversification across 12 quarters</h2>
            <p className="mt-2 text-gray-700">
              Build a balanced portfolio with <b className="font-bold text-brand-600">₹10L starting capital</b> , navigate realistic market events each
              quarter, and optimize your holdings. <br /><br />
              <b className="font-bold text-brand-600">Your goal:</b> finish 12 quarters with strong returns and healthy diversification.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Review market events to understand the quarter</li>
              <li className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-amber-600" /> Pass a short dynamic quiz to unlock rebalancing</li>
              <li className="flex items-center gap-2"><PieChart className="h-4 w-4 text-emerald-600" /> Build and rebalance using whole-share buys/sells</li>
              <li className="flex items-center gap-2"><Target className="h-4 w-4 text-purple-600" /> Get AI critique on your decisions and risk posture</li>
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-blue-600" /> Review performance charts and insights, then proceed</li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2"
          >
            {/* Illustration tiles */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <Calendar className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-emerald-800">Events</p>
                <p className="text-xs text-emerald-700">Quarterly context</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-blue-800">Quiz</p>
                <p className="text-xs text-blue-700">Unlock step 3</p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500 text-white">
                  <PieChart className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-purple-800">Rebalance</p>
                <p className="text-xs text-purple-700">Buy / sell shares</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-amber-800">AI Review</p>
                <p className="text-xs text-amber-700">Critique & tips</p>
              </div>
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 md:col-span-1">
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white">
                  <Activity className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-sky-800">Performance</p>
                <p className="text-xs text-sky-700">Charts & insights</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
