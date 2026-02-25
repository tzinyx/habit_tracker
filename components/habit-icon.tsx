import {
  BookOpen,
  Dumbbell,
  Droplets,
  Apple,
  Moon,
  Sun,
  Heart,
  Brain,
  Music,
  PenLine,
  PersonStanding,
  Bike,
  Coffee,
  Salad,
  Pill,
  Clock,
  Code,
  Wallet,
  Footprints,
  Flame,
  Zap,
  Trophy,
  LayoutGrid,
  Star,
  Award,
  TreePine,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  book: BookOpen,
  dumbbell: Dumbbell,
  droplets: Droplets,
  apple: Apple,
  moon: Moon,
  sun: Sun,
  heart: Heart,
  brain: Brain,
  music: Music,
  'pen-line': PenLine,
  walk: PersonStanding,
  bike: Bike,
  coffee: Coffee,
  salad: Salad,
  pill: Pill,
  clock: Clock,
  code: Code,
  wallet: Wallet,
  footprints: Footprints,
  flame: Flame,
  zap: Zap,
  trophy: Trophy,
  'layout-grid': LayoutGrid,
  star: Star,
  award: Award,
  'tree-pine': TreePine,
}

interface HabitIconProps {
  icon: string
  color?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function HabitIcon({
  icon,
  color,
  className,
  size = 'md',
}: HabitIconProps) {
  const IconComponent = iconMap[icon] ?? BookOpen

  const sizeClasses = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
  }

  return (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      style={color ? { color } : undefined}
    />
  )
}

export { iconMap }
