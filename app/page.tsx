'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useHabits, formatDate } from '@/lib/use-habits'
import { AppHeader } from '@/components/app-header'
import { DailyProgress } from '@/components/daily-progress'
import { HabitCard } from '@/components/habit-card'
import { HabitDialog } from '@/components/habit-dialog'
import { HabitCalendar } from '@/components/habit-calendar'
import { StatsCards } from '@/components/stats-cards'
import { EmptyState } from '@/components/empty-state'
import { DeleteDialog } from '@/components/delete-dialog'
import { PlantGarden } from '@/components/plant-garden'
import { Achievements } from '@/components/achievements'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import type { Habit } from '@/lib/types'

export default function HabitTrackerPage() {
  const {
    habits,
    completions,
    plant,
    badges,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    loadDemo,
    clearDemo,
    isCompleted,
    getStreak,
    getBestStreak,
    getSuccessRate,
  } = useHabits()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null)
  const [calendarHabitId, setCalendarHabitId] = useState<string | null>(null)

  const todayStr = formatDate(new Date())

  const todayCompleted = useMemo(
    () => habits.filter((h) => isCompleted(h.id, todayStr)).length,
    [habits, isCompleted, todayStr],
  )

  const bestStreak = useMemo(
    () => Math.max(0, ...habits.map((h) => getBestStreak(h.id))),
    [habits, getBestStreak],
  )

  const totalCompletions = completions.length

  const weekCompletionRate = useMemo(() => {
    if (habits.length === 0) return 0
    const today = new Date()
    let total = 0
    let completed = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = formatDate(d)
      for (const h of habits) {
        total++
        if (isCompleted(h.id, dateStr)) completed++
      }
    }
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [habits, isCompleted])

  const badgesUnlocked = useMemo(
    () => badges.filter((b) => b.unlockedAt).length,
    [badges],
  )

  const getWeekCompletions = useCallback(
    (habitId: string): boolean[] => {
      const today = new Date()
      const dayOfWeek = (today.getDay() + 6) % 7
      const monday = new Date(today)
      monday.setDate(today.getDate() - dayOfWeek)

      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return isCompleted(habitId, formatDate(d))
      })
    },
    [isCompleted],
  )

  const handleSaveHabit = async (habit: Habit) => {
    if (editingHabit) {
      await updateHabit(habit)
      toast.success(`"${habit.name}" updated`)
    } else {
      await addHabit(habit)
      toast.success(`"${habit.name}" added`)
    }
    setEditingHabit(null)
  }

  const handleDeleteHabit = async () => {
    if (!deleteTarget) return
    await deleteHabit(deleteTarget.id)
    toast.success(`"${deleteTarget.name}" deleted`)
    setDeleteTarget(null)
  }

  const handleToggle = async (habitId: string) => {
    const wasCompleted = isCompleted(habitId, todayStr)
    await toggleCompletion(habitId, todayStr)
    if (!wasCompleted) {
      toast.success('Habit completed! +2 XP')
    }
  }

  const handleLoadDemo = async () => {
    await loadDemo()
    toast.success('Demo data loaded with 30 days of history')
  }

  const handleClearDemo = async () => {
    await clearDemo()
    toast.success('All data cleared')
  }

  const openAddDialog = () => {
    setEditingHabit(null)
    setDialogOpen(true)
  }

  const openEditDialog = (habit: Habit) => {
    setEditingHabit(habit)
    setDialogOpen(true)
  }
  const lastNotifiedMinuteRef = useRef<string | null>(null)

  // Notification reminder check
  useEffect(() => {
    if (!('Notification' in window) || habits.length === 0) return

    const checkReminders = () => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      if (lastNotifiedMinuteRef.current === currentTime) return

      let notified = false
      for (const habit of habits) {
        if (
          habit.reminderEnabled &&
          habit.reminderTime === currentTime &&
          !isCompleted(habit.id, todayStr)
        ) {
          if (Notification.permission === 'granted') {
            new Notification('Stride Reminder', {
              body: `Time to complete: ${habit.name}`,
              icon: '/icon.svg',
            })
            notified = true
          }
        }
      }

      if (notified) {
        lastNotifiedMinuteRef.current = currentTime
      }
    }

    const interval = setInterval(checkReminders, 1000)
    return () => clearInterval(interval)
  }, [habits, isCompleted, todayStr])

  // Request notification permission
  useEffect(() => {
    const hasReminder = habits.some((h) => h.reminderEnabled)
    if (hasReminder && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [habits])

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 pb-20">
      <div className="flex flex-col gap-6">
        <AppHeader
          totalStreak={bestStreak}
          onAddHabit={openAddDialog}
          onLoadDemo={handleLoadDemo}
          onClearDemo={handleClearDemo}
          hasHabits={habits.length > 0}
        />

        {habits.length === 0 ? (
          <EmptyState onAddHabit={openAddDialog} />
        ) : (
          <>
            <DailyProgress
              completed={todayCompleted}
              total={habits.length}
            />

            <StatsCards
              totalCompletions={totalCompletions}
              bestStreak={bestStreak}
              habitsCount={habits.length}
              completionRate={weekCompletionRate}
              plantStage={plant.stage}
              badgesUnlocked={badgesUnlocked}
            />

            <Tabs defaultValue="today" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="today" className="flex-1">
                  Today
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex-1">
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="garden" className="flex-1">
                  Garden
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1">
                  Badges
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="mt-4">
                <div className="flex flex-col gap-3">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={isCompleted(habit.id, todayStr)}
                      streak={getStreak(habit.id)}
                      bestStreak={getBestStreak(habit.id)}
                      successRate={getSuccessRate(habit.id)}
                      onToggle={() => handleToggle(habit.id)}
                      onEdit={() => openEditDialog(habit)}
                      onDelete={() => setDeleteTarget(habit)}
                      weekCompletions={getWeekCompletions(habit.id)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="mt-4">
                <HabitCalendar
                  habits={habits}
                  completions={completions}
                  selectedHabitId={calendarHabitId}
                  onSelectHabit={setCalendarHabitId}
                />
              </TabsContent>

              <TabsContent value="garden" className="mt-4">
                <PlantGarden plant={plant} />
              </TabsContent>

              <TabsContent value="achievements" className="mt-4">
                <Achievements badges={badges} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <HabitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={editingHabit}
        habits={habits}
        onSave={handleSaveHabit}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        habitName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteHabit}
      />
    </main>
  )
}
