"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Trophy } from "lucide-react"
import { ConfettiBurst } from "@/components/diversify-quest/confetti-burst"

export type VerticalQuarterHUDProps = {
  currentQuarter: number
  totalQuarters?: number
  className?: string
}

export function VerticalQuarterHUD({ currentQuarter, totalQuarters = 12, className = "" }: VerticalQuarterHUDProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const prev = useRef(currentQuarter)
  const pct = Math.min(100, Math.max(0, (currentQuarter / totalQuarters) * 100))
  const year = Math.max(1, Math.min(3, Math.ceil(currentQuarter / 4)))

  useEffect(() => {
    if (currentQuarter > prev.current) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 1100)
      prev.current = currentQuarter
      return () => clearTimeout(t)
    }
    prev.current = currentQuarter
  }, [currentQuarter])

  return (
    <div className={`relative h-[360px] md:h-[440px] bg-transparent ${className}`}>
      {/* Confetti on quarter progress */}
      {showConfetti && <ConfettiBurst />}

      <div className="absolute inset-0 p-1 md:p-2 flex flex-col">
        {/* Header: makes the section self-explanatory */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-md">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[12px] text-emerald-700 font-medium">Quarter Journey</p>
            <p className="text-sm font-semibold text-gray-900">Q{currentQuarter} of {totalQuarters} • Year {year} of 3</p>
          </div>
        </div>
        {/* Completion badge */}
        <div className=" mt-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50/70 px-3 py-1 text-[11px] font-semibold text-purple-700 shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span className="text-xs">Complete all quarters to finish your quest</span>
          </div>
        </div>

        {/* Middle: vertical rail + big Q + vertical progress */}
        <div className="relative flex-1 flex items-center">
          {/* Vertical rail */}
          <div className="relative w-8 flex justify-center">
            <div className="h-full w-1 rounded-full bg-gradient-to-b from-emerald-400 via-blue-400 to-purple-400" />
            <motion.span
              key={currentQuarter}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="absolute left-1/2 -translate-x-1/2 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-white border-2 border-emerald-400 shadow"
              style={{ top: "50%" }}
            />
          </div>
          {/* Big Q label with subtle ticker animation */}
          <div className="ml-2 md:ml-3 overflow-visible">
            <div className="relative h-auto min-h-[84px] md:min-h-[110px] flex items-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={currentQuarter}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="font-extrabold tracking-tight text-gray-700 select-none"
                  style={{ fontSize: "clamp(36px, 7vw, 72px)" }}
                >
                  Q{currentQuarter}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="text-xs md:text-sm text-gray-500">Quarter {currentQuarter} of {totalQuarters}</div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
              Current quarter
            </div>
          </div>
          {/* Vertical overall progress on the right of big Q */}
          <div className="ml-6 flex flex-col items-center">
            <span className="text-[11px] text-gray-600 font-medium mb-1">Overall</span>
            <div className="relative h-28 md:h-32 w-2 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
              <motion.div
                key={Math.round(pct)}
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.4 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-emerald-400 to-blue-500"
              />
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1">{Math.round(pct)}%</span>
          </div>
        </div>

      </div>
    </div>
  )
}
