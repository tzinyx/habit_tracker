'use client'

import { Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import type { PlantData, PlantStage } from '@/lib/types'
import { PLANT_STAGES } from '@/lib/types'

interface PlantGardenProps {
  plant: PlantData
}

const STAGE_CONFIG: Record<PlantStage, { label: string; xpNeeded: number; description: string }> = {
  seed: { label: 'Seed', xpNeeded: 10, description: 'Just planted! Keep completing habits to grow.' },
  sprout: { label: 'Sprout', xpNeeded: 30, description: 'Your plant is sprouting! Keep it up.' },
  'small-plant': { label: 'Small Plant', xpNeeded: 60, description: 'Growing strong with your consistency!' },
  flowering: { label: 'Flowering', xpNeeded: 100, description: 'Beautiful blooms from your dedication!' },
  tree: { label: 'Tree', xpNeeded: 100, description: 'Fully grown! You are truly consistent.' },
}

function PlantVisual({ stage, isWilted }: { stage: PlantStage; isWilted: boolean }) {
  const stageIndex = PLANT_STAGES.indexOf(stage)

  return (
    <div className="relative flex flex-col items-center justify-end h-48">
      {/* Ground */}
      <div className="absolute bottom-0 w-full h-8 rounded-b-xl bg-accent/20" />

      {/* Plant */}
      <div
        className={cn(
          'relative z-10 flex flex-col items-center transition-all duration-500',
          isWilted && 'opacity-60 [filter:grayscale(0.5)]',
        )}
      >
        {/* Tree */}
        {stageIndex >= 4 && (
          <div className="flex flex-col items-center mb-1">
            <div className="w-20 h-20 rounded-full bg-primary/80 relative">
              <div className="absolute -left-3 top-3 w-10 h-10 rounded-full bg-primary/60" />
              <div className="absolute -right-3 top-3 w-10 h-10 rounded-full bg-primary/60" />
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-8 h-8 rounded-full bg-primary/70" />
            </div>
            <div className="w-3 h-12 bg-accent/80 rounded-sm" />
          </div>
        )}

        {/* Flowering */}
        {stageIndex === 3 && (
          <div className="flex flex-col items-center mb-1">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-primary/60" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent" />
              <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-accent/70" />
              <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-accent/70" />
            </div>
            <div className="flex gap-4 -mt-1">
              <div className="w-8 h-5 rounded-full bg-primary/40 -rotate-12" />
              <div className="w-8 h-5 rounded-full bg-primary/40 rotate-12" />
            </div>
            <div className="w-2.5 h-10 bg-primary/60 rounded-sm" />
          </div>
        )}

        {/* Small Plant */}
        {stageIndex === 2 && (
          <div className="flex flex-col items-center mb-1">
            <div className="flex gap-3 mb-0.5">
              <div className="w-7 h-10 rounded-full bg-primary/50 -rotate-25" />
              <div className="w-7 h-10 rounded-full bg-primary/50 rotate-25" />
            </div>
            <div className="w-6 h-8 rounded-full bg-primary/60 -mt-3" />
            <div className="w-2 h-8 bg-primary/50 rounded-sm" />
          </div>
        )}

        {/* Sprout */}
        {stageIndex === 1 && (
          <div className="flex flex-col items-center mb-1">
            <div className="flex gap-1.5">
              <div className="w-4 h-7 rounded-full bg-primary/50 -rotate-20" />
              <div className="w-4 h-7 rounded-full bg-primary/50 rotate-20" />
            </div>
            <div className="w-1.5 h-6 bg-primary/40 rounded-sm -mt-1" />
          </div>
        )}

        {/* Seed */}
        {stageIndex === 0 && (
          <div className="flex flex-col items-center mb-1">
            <div className="w-6 h-5 rounded-full bg-accent/70" />
            <div className="w-1 h-2 bg-primary/30 rounded-sm" />
          </div>
        )}
      </div>
    </div>
  )
}

export function PlantGarden({ plant }: PlantGardenProps) {
  const config = STAGE_CONFIG[plant.stage]
  const currentIndex = PLANT_STAGES.indexOf(plant.stage)
  const nextStage = currentIndex < PLANT_STAGES.length - 1 ? PLANT_STAGES[currentIndex + 1] : null
  const nextConfig = nextStage ? STAGE_CONFIG[nextStage] : null

  const prevThreshold = currentIndex > 0 ? STAGE_CONFIG[PLANT_STAGES[currentIndex - 1]].xpNeeded : 0
  const currentThreshold = config.xpNeeded
  const progressInStage = nextConfig
    ? Math.min(100, Math.round(((plant.xp - prevThreshold) / (currentThreshold - prevThreshold)) * 100))
    : 100

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Sprout className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Your Garden</h3>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>

        <div className="rounded-xl bg-secondary/50 p-4">
          <PlantVisual stage={plant.stage} isWilted={plant.isWilted} />
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">{config.label}</span>
            <span className="text-muted-foreground font-mono">{plant.xp} XP</span>
          </div>
          <Progress value={progressInStage} className="h-2" />
          {nextConfig && (
            <p className="text-[11px] text-muted-foreground">
              {currentThreshold - plant.xp > 0
                ? `${currentThreshold - plant.xp} XP to ${STAGE_CONFIG[nextStage!].label}`
                : `Ready to evolve!`}
            </p>
          )}
          {plant.isWilted && (
            <p className="text-[11px] text-destructive font-medium">
              Your plant is wilting! Complete a habit to revive it.
            </p>
          )}
        </div>

        {/* Stage progression indicator */}
        <div className="mt-4 flex items-center justify-between gap-1">
          {PLANT_STAGES.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={cn(
                  'h-1.5 w-full rounded-full transition-colors',
                  i <= currentIndex ? 'bg-primary' : 'bg-secondary',
                )}
              />
              <span className={cn(
                'text-[9px]',
                i <= currentIndex ? 'text-primary font-medium' : 'text-muted-foreground',
              )}>
                {STAGE_CONFIG[s].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
