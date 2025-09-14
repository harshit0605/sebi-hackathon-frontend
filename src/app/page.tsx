'use client'

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/hooks/use-game-state';
import { Gamepad2, BookOpen, Mic, PlusCircle, ArrowRight, Sparkles } from 'lucide-react';
import { GameIntroHeader } from '@/components/diversify-quest/game-intro-header';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
// Landing page: no portfolio/watchlist mock data needed
import { ArrowLeft, Target, PieChart, Calendar, Lightbulb, Activity } from 'lucide-react'
export default function Home() {
  const router = useRouter();
  const isStarted = useGameStore((s) => s.isStarted);
  const currentQuarter = useGameStore((s) => s.currentQuarter);
  const totalScore = useGameStore((s) => s.totalScore);
  const initializeGame = useGameStore((s) => s.initializeGame);

  const handleStart = () => {
    if (!isStarted) {
      initializeGame();
    }
    router.push('/diversify-quest');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600/90 to-brand-700 text-white p-8 md:p-12 shadow-xl">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" />
              Learn by Playing • English / हिंदी
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
              Master Markets with AI <br />
              Learn.
              Play.
              Diversify.
            </h1>
            <p className="mt-3 md:mt-4 max-w-2xl text-sm md:text-base text-brand-50/90">
              A bilingual investing academy blended with a hands-on, story-driven simulation. Make
              decisions, rebalance, and get instant AI feedback.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={handleStart} size="lg" className="rounded-full shadow-lg hover:shadow-brand-900/30">
                {isStarted ? 'Resume Diversify Quest' : 'Start Diversify Quest'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-full bg-white/15 text-white hover:bg-white/20">
                <Link href="/learn">
                  <BookOpen className="h-4 w-4 mr-2" /> Explore Academy
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-8">
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
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/')}
                  className="text-gray-700 hover:text-gray-900 hover:bg-brand-50 border border-brand-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Exit Game
                </Button> */}
              </div>

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
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-cyan-50/70 backdrop-blur-md p-6 md:p-6 shadow-sm mt-8">
          <div className="relative z-10 space-y-4">
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 backdrop-blur px-3 py-1 text-xs text-emerald-700">
                      <Sparkles className="h-3.5 w-3.5" /> New: Official SEBI/NISM Guides now in multiple languages
                    </div> */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Learn Trading the Right Way</h1>
              <div className="flex flex-wrap items-center gap-2 text-xs md:mt-0">
                <Badge variant="secondary" className="rounded-full border border-emerald-200/70 bg-emerald-50 text-emerald-700">SEBI-aligned</Badge>
                <Badge variant="secondary" className="rounded-full border border-sky-200/70 bg-sky-50 text-sky-700">Beginner friendly</Badge>
                <Badge variant="secondary" className="rounded-full">Outcome-focused</Badge>
              </div>

            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 backdrop-blur px-3 py-1 text-xs text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> <span className='text-sm'>New: Official SEBI/NISM Guides now in multiple languages</span>
            </div>
            <p className="text-muted-foreground text-base md:text-lg">
              A modern learning experience with structured modules, hands‑on lessons, and official SEBI/NISM guides
              transformed into interactive content. <span className='text-brand-700 font-semibold'>Available in English and Hindi for broader inclusion.</span>
            </p>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/learn/modules">Explore Modules</Link>
                </Button>
                <Button asChild size="lg">
                  <Link href="/learn/guides">Browse Guides</Link>
                </Button>
              </div>

            </div>
          </div>
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
        </section>

        {/* Summary Cards */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="group rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-brand-600/20 p-2 text-brand-50">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Diversify Quest</div>
                <p className="text-sm text-muted-foreground">
                  {isStarted ? (
                    <>Quarter {currentQuarter} • Score {Math.round(totalScore)} pts</>
                  ) : (
                    <>An immersive simulation to learn portfolio building and risk.</>
                  )}
                </p>
                <div className="mt-3">
                  <Button size="sm" className="rounded-full" onClick={handleStart}>
                    {isStarted ? 'Resume Journey' : 'Start Playing'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-purple-600/20 p-2 text-purple-100">
                <Mic className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">AI Voice Coach</div>
                <p className="text-sm text-muted-foreground">Ask questions, get guidance, and practice decisions hands-free.</p>
                <div className="mt-3">
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="/voice">Talk to Mentor</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-rose-600/20 p-2 text-rose-100">
                <PlusCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Create & Share Courses</div>
                <p className="text-sm text-muted-foreground">Design bite-sized lessons. Teach in English or हिंदी.</p>
                <div className="mt-3">
                  <Button asChild size="sm" variant="ghost" className="rounded-full">
                    <Link href="/learn/create-course">Start Creating</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              title: 'Learn the basics',
              desc: 'Short, visual lessons in your language.',
              icon: <BookOpen className="h-5 w-5" />,
            },
            {
              title: 'Play the journey',
              desc: 'Face quarterly events, rebalance, and manage risk.',
              icon: <Gamepad2 className="h-5 w-5" />,
            },
            {
              title: 'Get AI feedback',
              desc: 'A mentor reviews your moves and helps you improve.',
              icon: <Mic className="h-5 w-5" />,
            },
          ].map((item, idx) => (
            <div key={idx} className="rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-white/10 dark:to-white/5 backdrop-blur-md p-6 border border-white/20">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-black/5 dark:bg-white/10 p-2">{item.icon}</div>
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </MainLayout>
  );
}
