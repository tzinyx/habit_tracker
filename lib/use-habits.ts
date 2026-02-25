'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Habit, HabitData, Completion, PlantData } from '@/lib/types'
import { DEFAULT_PLANT, getPlantStage, ALL_BADGES } from '@/lib/types'

const STORAGE_KEY = 'habit-tracker-data'

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function calculateStreak(completions: Completion[], habitId: string): number {
  const dates = completions
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date)
    .sort()
    .reverse()

  if (dates.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i <= 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDate(d)
    if (dates.includes(dateStr)) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

function checkAndUnlockBadges(data: HabitData) {
  const now = new Date().toISOString()
  const unlockedIds = new Set(data.badges.filter((b) => b.unlockedAt).map((b) => b.id))
  const allBadges = data.badges.length > 0 ? data.badges : [...ALL_BADGES]

  // first-step
  if (!unlockedIds.has('first-step') && data.completions.length >= 1) {
    const badge = allBadges.find((b) => b.id === 'first-step')
    if (badge) badge.unlockedAt = now
  }

  // streaks
  for (const habit of data.habits) {
    const streak = calculateStreak(data.completions, habit.id)
    if (!unlockedIds.has('consistent-3') && streak >= 3) {
      const badge = allBadges.find((b) => b.id === 'consistent-3')
      if (badge) badge.unlockedAt = badge.unlockedAt || now
    }
    if (!unlockedIds.has('consistent-7') && streak >= 7) {
      const badge = allBadges.find((b) => b.id === 'consistent-7')
      if (badge) badge.unlockedAt = badge.unlockedAt || now
    }
    if (!unlockedIds.has('consistent-30') && streak >= 30) {
      const badge = allBadges.find((b) => b.id === 'consistent-30')
      if (badge) badge.unlockedAt = badge.unlockedAt || now
    }
  }

  // five-habits
  if (!unlockedIds.has('five-habits') && data.habits.length >= 5) {
    const badge = allBadges.find((b) => b.id === 'five-habits')
    if (badge) badge.unlockedAt = now
  }

  // perfect-day
  if (!unlockedIds.has('perfect-day') && data.habits.length > 0) {
    const todayStr = formatDate(new Date())
    const todayCompletions = data.completions.filter((c) => c.date === todayStr)
    const uniqueHabits = new Set(todayCompletions.map((c) => c.habitId))
    if (uniqueHabits.size >= data.habits.length) {
      const badge = allBadges.find((b) => b.id === 'perfect-day')
      if (badge) badge.unlockedAt = now
    }
  }

  // century
  if (!unlockedIds.has('century') && data.completions.length >= 100) {
    const badge = allBadges.find((b) => b.id === 'century')
    if (badge) badge.unlockedAt = now
  }

  // gardener
  if (!unlockedIds.has('gardener') && data.plant.stage === 'tree') {
    const badge = allBadges.find((b) => b.id === 'gardener')
    if (badge) badge.unlockedAt = now
  }

  data.badges = allBadges
}

function generateDemoData(): HabitData {
  const today = new Date()
  const habits: Habit[] = [
    {
      id: 'demo-reading',
      name: 'Read for 30 min',
      icon: 'book',
      color: '#2d8a5e',
      category: 'personal',
      frequency: 'daily',
      reminderEnabled: true,
      reminderTime: '08:00',
      createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 35).toISOString(),
    },
    {
      id: 'demo-gym',
      name: 'Gym Workout',
      icon: 'dumbbell',
      color: '#ef4444',
      category: 'health',
      frequency: 'weekdays',
      reminderEnabled: true,
      reminderTime: '07:00',
      createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 35).toISOString(),
    },
    {
      id: 'demo-water',
      name: 'Drink 8 glasses',
      icon: 'droplets',
      color: '#3b82f6',
      category: 'health',
      frequency: 'daily',
      reminderEnabled: false,
      createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 35).toISOString(),
    },
    {
      id: 'demo-coding',
      name: 'Code 1 hour',
      icon: 'code',
      color: '#a855f7',
      category: 'work',
      frequency: 'daily',
      reminderEnabled: true,
      reminderTime: '10:00',
      createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 35).toISOString(),
    },
  ]

  const completions: Completion[] = []

  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDate(d)

    // Reading: 85% completion rate, strong recent streak
    if (i <= 12 || Math.random() < 0.75) {
      completions.push({ habitId: 'demo-reading', date: dateStr })
    }

    // Gym: weekdays only, ~80%
    const dayOfWeek = d.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      if (i <= 8 || Math.random() < 0.7) {
        completions.push({ habitId: 'demo-gym', date: dateStr })
      }
    }

    // Water: very consistent, 90%
    if (i <= 15 || Math.random() < 0.85) {
      completions.push({ habitId: 'demo-water', date: dateStr })
    }

    // Coding: moderate consistency, 70%
    if (i <= 5 || Math.random() < 0.6) {
      completions.push({ habitId: 'demo-coding', date: dateStr })
    }
  }

  const totalXp = completions.length * 2
  const plant: PlantData = {
    xp: Math.min(totalXp, 120),
    stage: getPlantStage(Math.min(totalXp, 120)),
    lastWatered: formatDate(today),
    isWilted: false,
  }

  const badges = [
    { id: 'first-step', name: 'First Step', description: 'Complete your first habit', icon: 'footprints', unlockedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29).toISOString() },
    { id: 'consistent-3', name: 'Getting Started', description: 'Maintain a 3-day streak', icon: 'flame', unlockedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 27).toISOString() },
    { id: 'consistent-7', name: 'Consistent', description: 'Maintain a 7-day streak', icon: 'zap', unlockedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20).toISOString() },
    { id: 'five-habits', name: 'Multitasker', description: 'Track 5 habits at once', icon: 'layout-grid' },
    { id: 'perfect-day', name: 'Perfect Day', description: 'Complete all habits in one day', icon: 'star', unlockedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString() },
    { id: 'century', name: 'Century', description: 'Reach 100 total completions', icon: 'award', unlockedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2).toISOString() },
    { id: 'gardener', name: 'Green Thumb', description: 'Grow your plant to a tree', icon: 'tree-pine', unlockedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString() },
    { id: 'consistent-30', name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: 'trophy' },
  ]

  return { habits, completions, plant, badges }
}

export function useHabits() {
  const [data, setData] = useState<HabitData>({
    habits: [],
    completions: [],
    plant: { ...DEFAULT_PLANT },
    badges: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setData(JSON.parse(stored))
      } else {
        setData({
          habits: [],
          completions: [],
          plant: { ...DEFAULT_PLANT },
          badges: [...ALL_BADGES],
        })
      }
    } catch (e) {
      console.error('Failed to load habits from localStorage', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Helper to update state and save to localStorage
  const updateData = useCallback((newData: HabitData) => {
    setData(newData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
  }, [])

  const addHabit = async (habit: Habit) => {
    const newData = { ...data, habits: [...data.habits, habit] }
    updateData(newData)
  }

  const updateHabit = async (habit: Habit) => {
    const newData = {
      ...data,
      habits: data.habits.map((h) => (h.id === habit.id ? habit : h)),
    }
    updateData(newData)
  }

  const deleteHabit = async (habitId: string) => {
    const newData = {
      ...data,
      habits: data.habits.filter((h) => h.id !== habitId),
      completions: data.completions.filter((c) => c.habitId !== habitId),
    }
    updateData(newData)
  }

  const toggleCompletion = async (habitId: string, date: string) => {
    const newData = {
      ...data,
      completions: [...data.completions],
      plant: { ...data.plant },
      badges: [...data.badges],
    }

    const existingIndex = newData.completions.findIndex(
      (c) => c.habitId === habitId && c.date === date,
    )

    if (existingIndex !== -1) {
      newData.completions.splice(existingIndex, 1)
      newData.plant.xp = Math.max(0, newData.plant.xp - 2)
    } else {
      newData.completions.push({ habitId, date })
      newData.plant.xp += 2
      newData.plant.lastWatered = date
      newData.plant.isWilted = false
    }

    newData.plant.stage = getPlantStage(newData.plant.xp)
    checkAndUnlockBadges(newData)

    updateData(newData)
  }

  const loadDemo = async () => {
    const demoData = generateDemoData()
    updateData(demoData)
  }

  const clearDemo = async () => {
    updateData({
      habits: [],
      completions: [],
      plant: { ...DEFAULT_PLANT },
      badges: [...ALL_BADGES],
    })
  }

  const isCompleted = useCallback(
    (habitId: string, date: string): boolean => {
      return data.completions.some((c) => c.habitId === habitId && c.date === date)
    },
    [data.completions],
  )

  const getStreak = useCallback(
    (habitId: string): number => {
      return calculateStreak(data.completions, habitId)
    },
    [data.completions],
  )

  const getBestStreak = useCallback(
    (habitId: string): number => {
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
    },
    [data.completions],
  )

  const getSuccessRate = useCallback(
    (habitId: string): number => {
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
      const completedDays = data.completions.filter((c) => c.habitId === habitId).length

      return Math.round((completedDays / totalDays) * 100)
    },
    [data.habits, data.completions],
  )

  const getCompletionDates = useCallback(
    (habitId: string): string[] => {
      return data.completions.filter((c) => c.habitId === habitId).map((c) => c.date)
    },
    [data.completions],
  )

  return {
    habits: data.habits,
    completions: data.completions,
    plant: data.plant,
    badges: data.badges,
    isLoading,
    error: null,
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
    mutate: () => { }, // Kept for compatibility if used elsewhere, though it's not needed anymore
  }
}
