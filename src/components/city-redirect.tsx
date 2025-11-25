"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function CityRedirect() {
    const router = useRouter()

    useEffect(() => {
        const savedCitySlug = localStorage.getItem("zap_city_slug")
        if (savedCitySlug) {
            router.push(`/cidade/${savedCitySlug}`)
        }
    }, [router])

    return null
}
