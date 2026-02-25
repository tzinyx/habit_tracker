'use client'

import { useState, useEffect } from 'react'
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
import { cn } from '@/lib/utils'
import { HabitIcon } from '@/components/habit-icon'
import type { Habit, HabitCategory } from '@/lib/types'
import { HABIT_ICONS, HABIT_COLORS, HABIT_CATEGORIES } from '@/lib/types'

interface HabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit?: Habit | null
  onSave: (habit: Habit) => void
}

export function HabitDialog({
  open,
  onOpenChange,
  habit,
  onSave,
}: HabitDialogProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('book')
  const [color, setColor] = useState(HABIT_COLORS[0])
  const [category, setCategory] = useState<HabitCategory>('personal')
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily')
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setIcon(habit.icon)
      setColor(habit.color)
      setCategory(habit.category || 'personal')
      setFrequency(habit.frequency)
      setReminderEnabled(habit.reminderEnabled)
      setReminderTime(habit.reminderTime || '09:00')
    } else {
      setName('')
      setIcon('book')
      setColor(HABIT_COLORS[0])
      setCategory('personal')
      setFrequency('daily')
      setReminderEnabled(false)
      setReminderTime('09:00')
    }
  }, [habit, open])

  const handleSave = () => {
    if (!name.trim()) return

    onSave({
      id: habit?.id || crypto.randomUUID(),
      name: name.trim(),
      icon,
      color,
      category,
      frequency,
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
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as HabitCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HABIT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              onValueChange={(v) => setFrequency(v as Habit['frequency'])}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Every day</SelectItem>
                <SelectItem value="weekdays">Weekdays only</SelectItem>
                <SelectItem value="weekends">Weekends only</SelectItem>
              </SelectContent>
            </Select>
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
