'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle2 } from 'lucide-react'

interface DailyProgressProps {
  completed: number
  total: number
}

export function DailyProgress({ completed, total }: DailyProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const allDone = completed === total && total > 0

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            {"Today's Progress"}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-foreground font-mono">
              {completed}
            </span>
            <span className="text-lg text-muted-foreground font-mono">
              / {total}
            </span>
          </div>
        </div>
        {allDone && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
            <CheckCircle2 className="size-5 text-primary" />
            <span className="text-sm font-medium text-primary">All done!</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Progress value={percentage} className="h-3" />
        <span className="text-sm font-semibold text-foreground font-mono min-w-12 text-right">
          {percentage}%
        </span>
      </div>
    </div>
  )
}
