'use client'

import useSWR from 'swr'
import type { Habit, HabitData } from '@/lib/types'
import { DEFAULT_PLANT } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useHabits() {
  const { data, error, isLoading, mutate } = useSWR<HabitData>(
    '/api/habits',
    fetcher,
  )

  const addHabit = async (habit: Habit) => {
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addHabit', habit }),
    })
    mutate()
  }

  const updateHabit = async (habit: Habit) => {
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateHabit', habit }),
    })
    mutate()
  }

  const deleteHabit = async (habitId: string) => {
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteHabit', habitId }),
    })
    mutate()
  }

  const toggleCompletion = async (habitId: string, date: string) => {
    const optimisticData = data
      ? { ...data, completions: [...data.completions], plant: { ...data.plant } }
      : { habits: [], completions: [], plant: { ...DEFAULT_PLANT }, badges: [] }
    const existing = optimisticData.completions.findIndex(
      (c) => c.habitId === habitId && c.date === date,
    )
    if (existing !== -1) {
      optimisticData.completions = optimisticData.completions.filter(
        (_, i) => i !== existing,
      )
    } else {
      optimisticData.completions = [
        ...optimisticData.completions,
        { habitId, date },
      ]
    }

    mutate(optimisticData, false)

    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggleCompletion', habitId, date }),
    })
    mutate()
  }

  const loadDemo = async () => {
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'loadDemo' }),
    })
    mutate()
  }

  const clearDemo = async () => {
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clearDemo' }),
    })
    mutate()
  }

  const isCompleted = (habitId: string, date: string): boolean => {
    return (
      data?.completions.some(
        (c) => c.habitId === habitId && c.date === date,
      ) ?? false
    )
  }

  const getStreak = (habitId: string): number => {
    if (!data) return 0
    const completions = data.completions
      .filter((c) => c.habitId === habitId)
      .map((c) => c.date)
      .sort()
      .reverse()

    if (completions.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i <= 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = formatDate(checkDate)

      if (completions.includes(dateStr)) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    return streak
  }

  const getBestStreak = (habitId: string): number => {
    if (!data) return 0
    const dates = data.completions
      .filter((c) => c.habitId === habitId)
      .map((c) => c.date)
      .sort()

    if (dates.length === 0) return 0

    let bestStreak = 1
    let currentStreak = 1

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diffDays = Math.round(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
      )

      if (diffDays === 1) {
        currentStreak++
        bestStreak = Math.max(bestStreak, currentStreak)
      } else if (diffDays > 1) {
        currentStreak = 1
      }
    }

    return bestStreak
  }

  const getSuccessRate = (habitId: string): number => {
    if (!data) return 0
    const habit = data.habits.find((h) => h.id === habitId)
    if (!habit) return 0

    const createdDate = new Date(habit.createdAt)
    createdDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalDays = Math.max(
      1,
      Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    )
    const completedDays = data.completions.filter(
      (c) => c.habitId === habitId,
    ).length

    return Math.round((completedDays / totalDays) * 100)
  }

  const getCompletionDates = (habitId: string): string[] => {
    return (
      data?.completions.filter((c) => c.habitId === habitId).map((c) => c.date) ?? []
    )
  }

  return {
    habits: data?.habits ?? [],
    completions: data?.completions ?? [],
    plant: data?.plant ?? { ...DEFAULT_PLANT },
    badges: data?.badges ?? [],
    isLoading,
    error,
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
    getCompletionDates,
    mutate,
  }
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
