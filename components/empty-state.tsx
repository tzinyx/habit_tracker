'use client'

import { Target, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onAddHabit: () => void
}

export function EmptyState({ onAddHabit }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <Target className="size-8 text-primary" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        No habits yet
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground leading-relaxed">
        Start building better routines by adding your first habit. Track your
        progress daily and build lasting streaks.
      </p>
      <Button onClick={onAddHabit} className="mt-6 gap-1.5">
        <Plus className="size-4" />
        Add your first habit
      </Button>
    </div>
  )
}
