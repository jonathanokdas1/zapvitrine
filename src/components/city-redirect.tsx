"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function CityRedirect() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const isManualMode = searchParams.get('manual') === 'true'
        if (isManualMode) return

        const savedCitySlug = localStorage.getItem("zap_city_slug")
        if (savedCitySlug) {
            router.push(`/${savedCitySlug}`)
        }
    }, [router, searchParams])

    return null
}
