'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { HabitIcon } from '@/components/habit-icon'
import type { Habit, HabitCategory } from '@/lib/types'
import { HABIT_ICONS, HABIT_COLORS, HABIT_CATEGORIES } from '@/lib/types'

interface HabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: Habit | null
  habits?: Habit[]
  onSave: (habit: Habit) => void
}

export function HabitDialog({
  open,
  onOpenChange,
  habit,
  habits = [],
  onSave,
}: HabitDialogProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('book')
  const [color, setColor] = useState(HABIT_COLORS[0])
  const [category, setCategory] = useState<HabitCategory>('personal')
  const [customCategory, setCustomCategory] = useState('')
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const existingCustomCategories = useMemo(() => {
    const predefinedKeys = new Set(HABIT_CATEGORIES.map((cat) => cat.value))
    const custom = new Set<string>()
    for (const h of habits || []) {
      if (h.category && h.category !== 'other' && !predefinedKeys.has(h.category)) {
        custom.add(h.category)
      }
    }
    if (habit && habit.category && habit.category !== 'other' && !predefinedKeys.has(habit.category)) {
      custom.add(habit.category)
    }
    return Array.from(custom)
  }, [habits, habit])

  const allCategories = useMemo(() => {
    const defaultCats = HABIT_CATEGORIES.filter((c) => c.value !== 'other')
    const userCats = existingCustomCategories.map((cat) => ({ value: cat, label: cat }))
    return [{ value: 'other', label: 'Others (Type new...)' }, ...defaultCats, ...userCats]
  }, [existingCustomCategories])
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily')
  const [customDays, setCustomDays] = useState<number[]>([])
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setIcon(habit.icon)
      setColor(habit.color)
      const isPredefined = HABIT_CATEGORIES.some(c => c.value === habit.category)
      const isCustom = !isPredefined && habit.category && habit.category !== 'other'

      if (isPredefined || isCustom) {
        setCategory(habit.category || 'personal')
        setCustomCategory('')
      } else {
        setCategory('other')
        setCustomCategory(habit.category || '')
      }
      setFrequency(habit.frequency)
      setCustomDays(habit.customDays || [])
      setReminderEnabled(habit.reminderEnabled)
      setReminderTime(habit.reminderTime || '09:00')
    } else {
      setName('')
      setIcon('book')
      setColor(HABIT_COLORS[0])
      setCategory('personal')
      setCustomCategory('')
      setFrequency('daily')
      setCustomDays([])
      setReminderEnabled(false)
      setReminderTime('09:00')
    }
  }, [habit, open])

  const handleSave = () => {
    if (!name.trim()) return

    const finalCategory = category === 'other' && customCategory.trim()
      ? customCategory.trim()
      : category

    onSave({
      id: habit?.id || Math.random().toString(36).substring(2, 11),
      name: name.trim(),
      icon,
      color,
      category: finalCategory,
      frequency,
      customDays: frequency === 'custom' ? customDays : undefined,
      reminderEnabled,
      reminderTime: reminderEnabled ? reminderTime : undefined,
      createdAt: habit?.createdAt || new Date().toISOString(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{habit ? 'Edit Habit' : 'New Habit'}</DialogTitle>
          <DialogDescription>
            {habit
              ? 'Update your habit details below.'
              : 'Create a new habit to start tracking.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Read for 30 minutes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between font-normal"
                >
                  {category
                    ? allCategories.find((cat) => cat.value === category)?.label || category
                    : 'Select category...'}
                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search categories..." />
                  <CommandList
                    className="max-h-[200px] overflow-y-auto overflow-x-hidden"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <CommandEmpty>No category found.</CommandEmpty>
                    <CommandGroup>
                      {allCategories.map((cat) => (
                        <CommandItem
                          key={cat.value}
                          value={cat.value}
                          onSelect={(currentValue) => {
                            setCategory(currentValue as HabitCategory)
                            if (currentValue !== 'other') setCustomCategory('')
                            setComboboxOpen(false)
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 size-4',
                              category === cat.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {cat.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {category === 'other' && (
              <Input
                placeholder="Enter custom category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2"
                autoFocus
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-9 gap-2">
              {HABIT_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg border transition-all',
                    icon === iconName
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-secondary',
                  )}
                  aria-label={`Select ${iconName} icon`}
                >
                  <HabitIcon
                    icon={iconName}
                    size="sm"
                    color={icon === iconName ? color : undefined}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'size-8 rounded-full transition-all',
                    color === c
                      ? 'ring-2 ring-offset-2 ring-offset-background'
                      : 'hover:scale-110',
                  )}
                  style={{
                    backgroundColor: c,
                    ...(color === c ? { ringColor: c } : {}),
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => {
                setFrequency(v as Habit['frequency'])
                if (v !== 'custom') setCustomDays([])
              }}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Every day</SelectItem>
                <SelectItem value="weekdays">Weekdays only</SelectItem>
                <SelectItem value="weekends">Weekends only</SelectItem>
                <SelectItem value="custom">Specific days of the week</SelectItem>
              </SelectContent>
            </Select>

            {frequency === 'custom' && (
              <div className="mt-2 flex justify-between gap-1">
                {[
                  { value: 1, label: 'Mon' },
                  { value: 2, label: 'Tue' },
                  { value: 3, label: 'Wed' },
                  { value: 4, label: 'Thu' },
                  { value: 5, label: 'Fri' },
                  { value: 6, label: 'Sat' },
                  { value: 0, label: 'Sun' },
                ].map((day) => (
                  <button
                    key={'day-' + day.value}
                    type="button"
                    onClick={() => {
                      if (customDays.includes(day.value)) {
                        setCustomDays(customDays.filter((d) => d !== day.value))
                      } else {
                        setCustomDays([...customDays, day.value])
                      }
                    }}
                    className={cn(
                      'flex h-9 px-3 items-center justify-center rounded-md border text-sm font-medium transition-all',
                      customDays.includes(day.value)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:bg-secondary',
                    )}
                    aria-label={`Toggle day ${day.label}`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border bg-secondary/50 p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="reminder-switch" className="text-sm font-medium">
                Reminder
              </Label>
              <span className="text-xs text-muted-foreground">
                Get notified to complete this habit
              </span>
            </div>
            <Switch
              id="reminder-switch"
              checked={reminderEnabled}
              onCheckedChange={setReminderEnabled}
            />
          </div>

          {reminderEnabled && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="reminder-time">Reminder Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {habit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
