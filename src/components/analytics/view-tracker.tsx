"use client"

import { useEffect } from "react"
import { trackStoreView } from "@/actions/analytics"

export function ViewTracker({ slug }: { slug: string }) {
    useEffect(() => {
        const key = `viewed_${slug}`
        if (!sessionStorage.getItem(key)) {
            trackStoreView(slug)
            sessionStorage.setItem(key, "true")
        }
    }, [slug])

    return null
}
