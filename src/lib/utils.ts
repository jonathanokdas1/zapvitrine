import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(valueInCents: number | bigint) {
  const value = typeof valueInCents === 'bigint' ? Number(valueInCents) : valueInCents
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100)
}

export type DaySchedule = {
  start: string
  end: string
  isOpen: boolean
}

export type WeeklySchedule = {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export function checkStoreOpen(schedule: string | null): boolean {
  if (!schedule) return false

  try {
    const parsedSchedule = JSON.parse(schedule) as WeeklySchedule
    const now = new Date()

    // Get current day of week (0-6, 0 is Sunday)
    // Adjust to match our keys
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[now.getDay()] as keyof WeeklySchedule

    const todaySchedule = parsedSchedule[currentDay]

    if (!todaySchedule || !todaySchedule.isOpen) return false

    // Parse times
    const [startHour, startMinute] = todaySchedule.start.split(':').map(Number)
    const [endHour, endMinute] = todaySchedule.end.split(':').map(Number)

    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const currentTotalMinutes = currentHour * 60 + currentMinute
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes
  } catch (error) {
    console.error("Error parsing schedule:", error)
    return false
  }
}
