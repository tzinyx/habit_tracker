'use client'

import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HabitIcon } from '@/components/habit-icon'
import type { Badge } from '@/lib/types'
import { ALL_BADGES } from '@/lib/types'

interface AchievementsProps {
  badges: Badge[]
}

export function Achievements({ badges }: AchievementsProps) {
  const badgeMap = new Map(badges.map((b) => [b.id, b]))
  const displayBadges = ALL_BADGES.map((ab) => ({
    ...ab,
    unlockedAt: badgeMap.get(ab.id)?.unlockedAt,
  }))

  const unlocked = displayBadges.filter((b) => b.unlockedAt)
  const locked = displayBadges.filter((b) => !b.unlockedAt)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Achievements</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {unlocked.length} of {displayBadges.length} unlocked
            </p>
          </div>
          <div className="flex items-center gap-1">
            {displayBadges.map((b) => (
              <div
                key={b.id}
                className={cn(
                  'size-2.5 rounded-full',
                  b.unlockedAt ? 'bg-primary' : 'bg-secondary',
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Unlocked badges */}
      {unlocked.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Unlocked
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {unlocked.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 ring-1 ring-primary/20"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <HabitIcon icon={badge.icon} size="md" className="text-primary" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {badge.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {badge.description}
                  </span>
                  {badge.unlockedAt && (
                    <span className="text-[10px] text-primary font-mono">
                      {new Date(badge.unlockedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked badges */}
      {locked.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            Locked
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {locked.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 rounded-xl border bg-card/50 p-3 opacity-60"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                  <Lock className="size-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium text-muted-foreground truncate">
                    {badge.name}
                  </span>
                  <span className="text-xs text-muted-foreground/70 truncate">
                    {badge.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
