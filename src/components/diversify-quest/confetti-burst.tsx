"use client"

import { motion } from 'framer-motion'

const COLORS = [
  '#22c55e', // emerald-500
  '#3b82f6', // blue-500
  '#f59e0b', // amber-500
  '#a855f7', // purple-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
]

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function ConfettiBurst() {
  const pieces = Array.from({ length: 28 }).map((_, i) => {
    const size = rand(6, 10)
    const startLeft = rand(10, 90)
    const dx = rand(-120, 120)
    const dy = rand(-220, -380)
    const rot = rand(90, 540)
    const delay = i * 0.008
    const color = COLORS[i % COLORS.length]

    return (
      <motion.span
        key={i}
        initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
        animate={{ x: dx, y: dy, rotate: rot, opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut', delay }}
        style={{
          left: `${startLeft}%`,
          width: size,
          height: size,
          backgroundColor: color,
        }}
        className="absolute top-1/2 rounded-sm shadow-sm"
      />
    )
  })

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      {pieces}
    </div>
  )
}
