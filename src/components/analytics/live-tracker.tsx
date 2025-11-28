"use client"

import { useEffect } from "react"
import { registerHeartbeat } from "@/actions/analytics"
import { v4 as uuidv4 } from "uuid"

interface LiveTrackerProps {
    slug: string
}

export function LiveTracker({ slug }: LiveTrackerProps) {
    useEffect(() => {
        // Obter ou criar ID do visitante
        let visitorId = localStorage.getItem("visitor_id")
        if (!visitorId) {
            visitorId = uuidv4()
            localStorage.setItem("visitor_id", visitorId)
        }

        // Heartbeat inicial
        if (visitorId) {
            registerHeartbeat(slug, visitorId)
        }

        // Heartbeat periódico a cada 30 segundos
        const interval = setInterval(() => {
            if (visitorId) {
                registerHeartbeat(slug, visitorId)
            }
        }, 30000)

        return () => clearInterval(interval)
    }, [slug])

    return null
}
