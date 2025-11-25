"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function ChangeCityButton() {
    const router = useRouter()

    const handleChangeCity = () => {
        localStorage.removeItem("zap_city_slug")
        localStorage.removeItem("zap_city_name")
        router.push("/")
    }

    return (
        <Button
            variant="link"
            className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
            onClick={handleChangeCity}
        >
            Trocar Cidade
        </Button>
    )
}
