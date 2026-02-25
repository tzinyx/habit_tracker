'use client'

import { Flame, Plus, Moon, Sun, FlaskConical, Trash2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AppHeaderProps {
  totalStreak: number
  onAddHabit: () => void
  onLoadDemo: () => void
  onClearDemo: () => void
  hasHabits: boolean
}

export function AppHeader({
  totalStreak,
  onAddHabit,
  onLoadDemo,
  onClearDemo,
  hasHabits,
}: AppHeaderProps) {
  const { theme, setTheme } = useTheme()

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl text-balance">
            Stride
          </h1>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {totalStreak > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-accent/20 px-3 py-1.5">
              <Flame className="size-4 text-accent" />
              <span className="text-sm font-semibold text-accent-foreground font-mono">
                {totalStreak}
              </span>
              <span className="text-xs text-muted-foreground">best</span>
            </div>
          )}

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle dark mode</TooltipContent>
            </Tooltip>

            {!hasHabits ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={onLoadDemo}
                  >
                    <FlaskConical className="size-4" />
                    <span className="hidden sm:inline">Demo Mode</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Load 30 days of demo data</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-muted-foreground"
                    onClick={onClearDemo}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all data</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>

          <Button onClick={onAddHabit} size="sm" className="gap-1.5">
            <Plus className="size-4" />
            <span>Add Habit</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
