
const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

type DaySchedule = {
    start: string
    end: string
    isOpen: boolean
}

type WeeklySchedule = {
    monday: DaySchedule
    tuesday: DaySchedule
    wednesday: DaySchedule
    thursday: DaySchedule
    friday: DaySchedule
    saturday: DaySchedule
    sunday: DaySchedule
}

function getStoreStatus(schedule: string | null, mockDate?: Date): { isOpen: boolean, message: string } {
    if (!schedule) return { isOpen: false, message: "Horário não definido" }

    try {
        const parsedSchedule = JSON.parse(schedule) as WeeklySchedule
        const now = mockDate || new Date()
        const currentDayIndex = now.getDay()
        const currentDay = days[currentDayIndex] as keyof WeeklySchedule

        const todaySchedule = parsedSchedule[currentDay]

        // Helper to parse time string "HH:MM" to minutes
        const toMinutes = (time: string) => {
            if (!time) return 0
            const [h, m] = time.split(':').map(Number)
            return h * 60 + m
        }

        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        console.log(`Checking status for ${currentDay} at ${now.getHours()}:${now.getMinutes()} (${currentMinutes} mins)`)
        console.log(`Schedule: Start=${todaySchedule?.start} (${toMinutes(todaySchedule?.start)}), End=${todaySchedule?.end} (${toMinutes(todaySchedule?.end)}), Open=${todaySchedule?.isOpen}`)

        // Check if open today
        if (todaySchedule && todaySchedule.isOpen) {
            const startMinutes = toMinutes(todaySchedule.start)
            const endMinutes = toMinutes(todaySchedule.end)

            if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                return { isOpen: true, message: `Aberto até ${todaySchedule.end}` }
            }
        }

        // If closed, find next opening time
        // Check later today first
        if (todaySchedule && todaySchedule.isOpen) {
            const startMinutes = toMinutes(todaySchedule.start)
            if (currentMinutes < startMinutes) {
                return { isOpen: false, message: `Abre hoje às ${todaySchedule.start}` }
            }
        }

        // Check next days
        for (let i = 1; i <= 7; i++) {
            const nextDayIndex = (currentDayIndex + i) % 7
            const nextDay = days[nextDayIndex] as keyof WeeklySchedule
            const nextSchedule = parsedSchedule[nextDay]

            if (nextSchedule && nextSchedule.isOpen) {
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

// Mock Data
const schedule = JSON.stringify({
    monday: { start: "09:00", end: "18:00", isOpen: true },
    tuesday: { start: "09:00", end: "18:00", isOpen: true },
    wednesday: { start: "09:03", end: "18:00", isOpen: true },
    thursday: { start: "09:00", end: "18:00", isOpen: true },
    friday: { start: "09:00", end: "18:00", isOpen: true },
    saturday: { start: "09:00", end: "12:00", isOpen: true },
    sunday: { start: "", end: "", isOpen: false },
})

// Test Case 1: Wednesday 09:58 (Should be Open)
const date1 = new Date("2025-11-26T09:58:00") // Wednesday
console.log("Test 1:", getStoreStatus(schedule, date1))

// Test Case 2: Wednesday 09:00 (Should be Closed, opens at 09:03)
const date2 = new Date("2025-11-26T09:00:00")
console.log("Test 2:", getStoreStatus(schedule, date2))

// Test Case 3: Wednesday 18:01 (Should be Closed, opens tomorrow)
const date3 = new Date("2025-11-26T18:01:00")
console.log("Test 3:", getStoreStatus(schedule, date3))

// Test Case 4: Empty End Time
const scheduleEmptyEnd = JSON.stringify({
    ...JSON.parse(schedule),
    wednesday: { start: "09:03", end: "", isOpen: true }
})
console.log("Test 4 (Empty End):", getStoreStatus(scheduleEmptyEnd, date1))
