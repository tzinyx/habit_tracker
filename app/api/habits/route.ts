import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import type { HabitData, Habit, Completion, PlantData } from '@/lib/types'
import { DEFAULT_PLANT, getPlantStage } from '@/lib/types'

const DATA_PATH = path.join(process.cwd(), 'data', 'habits.json')

async function ensureDataDir() {
  const dir = path.dirname(DATA_PATH)
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

async function readData(): Promise<HabitData> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8')
    const data = JSON.parse(raw)
    return {
      habits: data.habits ?? [],
      completions: data.completions ?? [],
      plant: data.plant ?? { ...DEFAULT_PLANT },
      badges: data.badges ?? [],
    }
  } catch {
    return { habits: [], completions: [], plant: { ...DEFAULT_PLANT }, badges: [] }
  }
}

async function writeData(data: HabitData) {
  await ensureDataDir()
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2))
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
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

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  let data = await readData()

  if (body.action === 'loadDemo') {
    data = generateDemoData()
  } else if (body.action === 'clearDemo') {
    data = { habits: [], completions: [], plant: { ...DEFAULT_PLANT }, badges: [] }
  } else if (body.action === 'addHabit') {
    data.habits.push(body.habit)
  } else if (body.action === 'updateHabit') {
    const idx = data.habits.findIndex((h) => h.id === body.habit.id)
    if (idx !== -1) data.habits[idx] = body.habit
  } else if (body.action === 'deleteHabit') {
    data.habits = data.habits.filter((h) => h.id !== body.habitId)
    data.completions = data.completions.filter(
      (c) => c.habitId !== body.habitId,
    )
  } else if (body.action === 'toggleCompletion') {
    const existing = data.completions.findIndex(
      (c) => c.habitId === body.habitId && c.date === body.date,
    )
    if (existing !== -1) {
      data.completions.splice(existing, 1)
      // Remove XP when uncompleting
      data.plant.xp = Math.max(0, data.plant.xp - 2)
    } else {
      data.completions.push({ habitId: body.habitId, date: body.date })
      // Add XP on completion
      data.plant.xp += 2
      data.plant.lastWatered = body.date
      data.plant.isWilted = false
    }
    data.plant.stage = getPlantStage(data.plant.xp)

    // Check badges
    checkAndUnlockBadges(data)
  }

  await writeData(data)
  return NextResponse.json(data)
}

function checkAndUnlockBadges(data: HabitData) {
  const now = new Date().toISOString()
  const unlockedIds = new Set(data.badges.filter(b => b.unlockedAt).map(b => b.id))
  const allBadges = data.badges.length > 0 ? data.badges : [
    { id: 'first-step', name: 'First Step', description: 'Complete your first habit', icon: 'footprints' },
    { id: 'consistent-3', name: 'Getting Started', description: 'Maintain a 3-day streak', icon: 'flame' },
    { id: 'consistent-7', name: 'Consistent', description: 'Maintain a 7-day streak', icon: 'zap' },
    { id: 'consistent-30', name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: 'trophy' },
    { id: 'five-habits', name: 'Multitasker', description: 'Track 5 habits at once', icon: 'layout-grid' },
    { id: 'perfect-day', name: 'Perfect Day', description: 'Complete all habits in one day', icon: 'star' },
    { id: 'century', name: 'Century', description: 'Reach 100 total completions', icon: 'award' },
    { id: 'gardener', name: 'Green Thumb', description: 'Grow your plant to a tree', icon: 'tree-pine' },
  ]

  // first-step
  if (!unlockedIds.has('first-step') && data.completions.length >= 1) {
    const badge = allBadges.find(b => b.id === 'first-step')
    if (badge) badge.unlockedAt = now
  }

  // streaks
  for (const habit of data.habits) {
    const streak = calculateStreak(data.completions, habit.id)
    if (!unlockedIds.has('consistent-3') && streak >= 3) {
      const badge = allBadges.find(b => b.id === 'consistent-3')
      if (badge) badge.unlockedAt = badge.unlockedAt || now
    }
    if (!unlockedIds.has('consistent-7') && streak >= 7) {
      const badge = allBadges.find(b => b.id === 'consistent-7')
      if (badge) badge.unlockedAt = badge.unlockedAt || now
    }
    if (!unlockedIds.has('consistent-30') && streak >= 30) {
      const badge = allBadges.find(b => b.id === 'consistent-30')
      if (badge) badge.unlockedAt = badge.unlockedAt || now
    }
  }

  // five-habits
  if (!unlockedIds.has('five-habits') && data.habits.length >= 5) {
    const badge = allBadges.find(b => b.id === 'five-habits')
    if (badge) badge.unlockedAt = now
  }

  // perfect-day
  if (!unlockedIds.has('perfect-day') && data.habits.length > 0) {
    const today = formatDate(new Date())
    const todayCompletions = data.completions.filter(c => c.date === today)
    const uniqueHabits = new Set(todayCompletions.map(c => c.habitId))
    if (uniqueHabits.size >= data.habits.length) {
      const badge = allBadges.find(b => b.id === 'perfect-day')
      if (badge) badge.unlockedAt = now
    }
  }

  // century
  if (!unlockedIds.has('century') && data.completions.length >= 100) {
    const badge = allBadges.find(b => b.id === 'century')
    if (badge) badge.unlockedAt = now
  }

  // gardener
  if (!unlockedIds.has('gardener') && data.plant.stage === 'tree') {
    const badge = allBadges.find(b => b.id === 'gardener')
    if (badge) badge.unlockedAt = now
  }

  data.badges = allBadges
}

function calculateStreak(completions: Completion[], habitId: string): number {
  const dates = completions
    .filter(c => c.habitId === habitId)
    .map(c => c.date)
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
