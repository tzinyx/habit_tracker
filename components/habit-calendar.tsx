'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Habit } from '@/lib/types'
import { HabitIcon } from '@/components/habit-icon'

interface HabitCalendarProps {
  habits: Habit[]
  completions: { habitId: string; date: string }[]
  selectedHabitId?: string | null
  onSelectHabit: (habitId: string | null) => void
}

export function HabitCalendar({
  habits,
  completions,
  selectedHabitId,
  onSelectHabit,
}: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const filteredCompletions = useMemo(() => {
    if (selectedHabitId) {
      return completions.filter((c) => c.habitId === selectedHabitId)
    }
    return completions
  }, [completions, selectedHabitId])

  const completionMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const c of filteredCompletions) {
      map[c.date] = (map[c.date] || 0) + 1
    }
    return map
  }, [filteredCompletions])

  const maxCompletions = selectedHabitId ? 1 : habits.length

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-secondary'
    const ratio = count / maxCompletions
    if (ratio <= 0.25) return 'bg-primary/25'
    if (ratio <= 0.5) return 'bg-primary/50'
    if (ratio <= 0.75) return 'bg-primary/75'
    return 'bg-primary'
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {monthLabel}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={goToToday}
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {habits.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => onSelectHabit(null)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              !selectedHabitId
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80',
            )}
          >
            All
          </button>
          {habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => onSelectHabit(habit.id)}
              className={cn(
                'flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                selectedHabitId === habit.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80',
              )}
            >
              <HabitIcon icon={habit.icon} size="sm" />
              {habit.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-7 gap-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
          <div
            key={day}
            className="flex items-center justify-center py-1 text-[10px] font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dateStr = getDateStr(day)
          const count = completionMap[dateStr] || 0
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()

          return (
            <div
              key={day}
              className={cn(
                'flex aspect-square items-center justify-center rounded-md text-xs transition-colors',
                getIntensity(count),
                isToday && 'ring-1 ring-primary ring-offset-1 ring-offset-card',
                count > 0 && count === maxCompletions && 'text-primary-foreground',
              )}
              title={`${dateStr}: ${count}/${maxCompletions} habits`}
            >
              {day}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="size-3 rounded-sm bg-secondary" />
        <div className="size-3 rounded-sm bg-primary/25" />
        <div className="size-3 rounded-sm bg-primary/50" />
        <div className="size-3 rounded-sm bg-primary/75" />
        <div className="size-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  )
}
