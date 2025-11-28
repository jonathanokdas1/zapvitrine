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

    // Get time in Brazil
    const now = new Date()
    const brazilTimeStr = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    const brazilDate = new Date(brazilTimeStr)

    // Get current day of week (0-6, 0 is Sunday)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = days[brazilDate.getDay()] as keyof WeeklySchedule

    const todaySchedule = parsedSchedule[currentDay]

    if (!todaySchedule || !todaySchedule.isOpen) return false

    // Parse times
    const [startHour, startMinute] = todaySchedule.start.split(':').map(Number)
    const [endHour, endMinute] = todaySchedule.end.split(':').map(Number)

    const currentHour = brazilDate.getHours()
    const currentMinute = brazilDate.getMinutes()

    const currentTotalMinutes = currentHour * 60 + currentMinute
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = endHour * 60 + endMinute

    // Handle overnight schedules (e.g. 18:00 to 02:00) - though current logic assumes same day
    // For now keeping simple same-day logic as per original code
    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes
  } catch (error) {
    console.error("Error parsing schedule:", error)
    return false
  }
}

export function getStoreStatus(schedule: string | null): { isOpen: boolean, message: string } {
  if (!schedule) return { isOpen: false, message: "Horário não definido" }

  try {
    const parsedSchedule = JSON.parse(schedule) as WeeklySchedule

    // Get time in Brazil
    const now = new Date()
    const brazilTimeStr = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    const brazilDate = new Date(brazilTimeStr)

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDayIndex = brazilDate.getDay()
    const currentDay = days[currentDayIndex] as keyof WeeklySchedule

    const todaySchedule = parsedSchedule[currentDay]

    // Helper to parse time string "HH:MM" to minutes
    const toMinutes = (time: string) => {
      if (!time) return null
      const [h, m] = time.split(':').map(Number)
      return h * 60 + m
    }

    const currentMinutes = brazilDate.getHours() * 60 + brazilDate.getMinutes()

    // Check if open today
    if (todaySchedule && todaySchedule.isOpen) {
      const startMinutes = toMinutes(todaySchedule.start)
      // If end time is missing, assume end of day (23:59)
      const endMinutes = toMinutes(todaySchedule.end) ?? 1439

      if (startMinutes !== null && currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        const endTimeDisplay = todaySchedule.end || "23:59"
        return { isOpen: true, message: `Aberto até ${endTimeDisplay}` }
      }
    }

    // If closed, find next opening time
    // Check later today first
    if (todaySchedule && todaySchedule.isOpen) {
      const startMinutes = toMinutes(todaySchedule.start)
      if (startMinutes !== null && currentMinutes < startMinutes) {
        return { isOpen: false, message: `Abre hoje às ${todaySchedule.start}` }
      }
    }

    // Check next days
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7
      const nextDay = days[nextDayIndex] as keyof WeeklySchedule
      const nextSchedule = parsedSchedule[nextDay]

      if (nextSchedule && nextSchedule.isOpen && nextSchedule.start) {
        const dayName = i === 1 ? "amanhã" :
          nextDay === 'monday' ? "segunda" :
            nextDay === 'tuesday' ? "terça" :
              nextDay === 'wednesday' ? "quarta" :
                nextDay === 'thursday' ? "quinta" :
                  nextDay === 'friday' ? "sexta" :
                    nextDay === 'saturday' ? "sábado" : "domingo"

        return { isOpen: false, message: `Abre ${dayName} às ${nextSchedule.start}` }
      }
    }

    return { isOpen: false, message: "Fechado temporariamente" }

  } catch (error) {
    console.error("Error parsing schedule:", error)
    return { isOpen: false, message: "Horário indisponível" }
  }
}

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}
