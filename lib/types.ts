export type HabitCategory = 'health' | 'work' | 'personal' | 'finance' | 'other' | (string & {})

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  category: HabitCategory
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom'
  customDays?: number[]
  reminderTime?: string
  reminderEnabled: boolean
  createdAt: string
}

export interface Completion {
  habitId: string
  date: string // YYYY-MM-DD format
}

export type PlantStage = 'seed' | 'sprout' | 'small-plant' | 'flowering' | 'tree'

export interface PlantData {
  xp: number
  stage: PlantStage
  lastWatered: string // date of last completion
  isWilted: boolean
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

export interface HabitData {
  habits: Habit[]
  completions: Completion[]
  plant: PlantData
  badges: Badge[]
}

export const HABIT_CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'health', label: 'Health' },
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Others' },
]

export const CATEGORY_COLORS: Record<string, string> = {
  health: 'bg-chart-1/15 text-chart-1',
  work: 'bg-chart-3/15 text-chart-3',
  personal: 'bg-chart-2/15 text-chart-2',
  finance: 'bg-chart-5/15 text-chart-5',
  other: 'bg-muted text-muted-foreground',
}

export const HABIT_ICONS = [
  'book',
  'dumbbell',
  'droplets',
  'apple',
  'moon',
  'sun',
  'heart',
  'brain',
  'music',
  'pen-line',
  'walk',
  'bike',
  'coffee',
  'salad',
  'pill',
  'clock',
  'code',
  'wallet',
] as const

export const HABIT_COLORS = [
  '#2d8a5e',
  '#c4813a',
  '#3b82f6',
  '#ef4444',
  '#a855f7',
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
] as const

export const PLANT_STAGES: PlantStage[] = ['seed', 'sprout', 'small-plant', 'flowering', 'tree']

export function getPlantStage(xp: number): PlantStage {
  if (xp >= 100) return 'tree'
  if (xp >= 60) return 'flowering'
  if (xp >= 30) return 'small-plant'
  if (xp >= 10) return 'sprout'
  return 'seed'
}

export const DEFAULT_PLANT: PlantData = {
  xp: 0,
  stage: 'seed',
  lastWatered: '',
  isWilted: false,
}

export const ALL_BADGES: Badge[] = [
  { id: 'first-step', name: 'First Step', description: 'Complete your first habit', icon: 'footprints' },
  { id: 'consistent-3', name: 'Getting Started', description: 'Maintain a 3-day streak', icon: 'flame' },
  { id: 'consistent-7', name: 'Consistent', description: 'Maintain a 7-day streak', icon: 'zap' },
  { id: 'consistent-30', name: 'Unstoppable', description: 'Maintain a 30-day streak', icon: 'trophy' },
  { id: 'five-habits', name: 'Multitasker', description: 'Track 5 habits at once', icon: 'layout-grid' },
  { id: 'perfect-day', name: 'Perfect Day', description: 'Complete all habits in one day', icon: 'star' },
  { id: 'century', name: 'Century', description: 'Reach 100 total completions', icon: 'award' },
  { id: 'gardener', name: 'Green Thumb', description: 'Grow your plant to a tree', icon: 'tree-pine' },
]
