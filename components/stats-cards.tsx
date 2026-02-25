'use client'

import { Calendar, Flame, CheckCircle2, TrendingUp, Sprout, Award } from 'lucide-react'
import type { PlantStage } from '@/lib/types'

interface StatsCardsProps {
  totalCompletions: number
  bestStreak: number
  habitsCount: number
  completionRate: number
  plantStage: PlantStage
  badgesUnlocked: number
}

export function StatsCards({
  totalCompletions,
  bestStreak,
  habitsCount,
  completionRate,
  plantStage,
  badgesUnlocked,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Done',
      value: totalCompletions,
      icon: CheckCircle2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Best Streak',
      value: `${bestStreak}d`,
      icon: Flame,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'This Week',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      label: 'Active',
      value: habitsCount,
      icon: Calendar,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
    {
      label: 'Plant',
      value: plantStage.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      icon: Sprout,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Badges',
      value: badgesUnlocked,
      icon: Award,
      color: 'text-chart-5',
      bgColor: 'bg-chart-5/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-xl border bg-card p-3"
        >
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.bgColor}`}
          >
            <stat.icon className={`size-4 ${stat.color}`} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-foreground font-mono leading-tight truncate">
              {stat.value}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {stat.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
