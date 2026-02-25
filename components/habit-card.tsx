'use client'

import { Check, Flame, MoreHorizontal, Pencil, Trash2, Trophy, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HabitIcon } from '@/components/habit-icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { Habit } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/types'

interface HabitCardProps {
  habit: Habit
  isCompleted: boolean
  streak: number
  bestStreak: number
  successRate: number
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  weekCompletions: boolean[]
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function HabitCard({
  habit,
  isCompleted,
  streak,
  bestStreak,
  successRate,
  onToggle,
  onEdit,
  onDelete,
  weekCompletions,
}: HabitCardProps) {
  const categoryStyle = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.personal

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-card transition-all duration-200 overflow-hidden',
        isCompleted && 'border-primary/30 bg-primary/[0.03]',
      )}
    >
      {/* Colored top border accent */}
      <div className="h-1 w-full" style={{ backgroundColor: habit.color }} />

      <div className="p-4">
        {/* Top row: icon, name, category, menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-10 items-center justify-center rounded-xl transition-all duration-200',
                isCompleted
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground',
              )}
              style={
                isCompleted
                  ? { backgroundColor: habit.color }
                  : undefined
              }
            >
              {isCompleted ? (
                <Check className="size-5 text-card" />
              ) : (
                <HabitIcon icon={habit.icon} size="md" color={habit.color} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm font-semibold text-foreground transition-all',
                    isCompleted && 'line-through opacity-60',
                  )}
                >
                  {habit.name}
                </span>
                <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', categoryStyle)}>
                  {habit.category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {streak > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="size-3 text-accent" />
                    <span className="text-xs text-muted-foreground font-mono">
                      {streak}d streak
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Trophy className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">
                    {bestStreak}d best
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="size-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-mono">
                    {successRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label={`Options for ${habit.name}`}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Week-at-a-glance + Mark Complete button */}
        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {WEEK_LABELS.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground">{label}</span>
                <div
                  className={cn(
                    'size-5 rounded-sm transition-colors',
                    weekCompletions[i]
                      ? 'bg-primary/80'
                      : 'bg-secondary',
                  )}
                  style={weekCompletions[i] ? { backgroundColor: `${habit.color}CC` } : undefined}
                />
              </div>
            ))}
          </div>

          <Button
            onClick={onToggle}
            variant={isCompleted ? 'outline' : 'default'}
            size="sm"
            className={cn(
              'shrink-0 gap-1.5 transition-all',
              isCompleted
                ? 'border-primary/30 text-primary hover:bg-primary/5'
                : '',
            )}
            style={
              !isCompleted
                ? { backgroundColor: habit.color }
                : undefined
            }
            aria-label={
              isCompleted
                ? `Mark ${habit.name} as incomplete`
                : `Mark ${habit.name} as complete`
            }
          >
            {isCompleted ? (
              <>
                <Check className="size-3.5" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                <span>Mark Complete</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
