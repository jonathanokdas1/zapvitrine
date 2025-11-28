"use client"

import * as React from "react"
import { Check, ChevronsUpDown, MapPin, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"

interface City {
    name: string
    slug: string
    state: string
}

interface CitySwitcherProps {
    currentCityName?: string
}

export function CitySwitcher({ currentCityName }: CitySwitcherProps) {
    const [open, setOpen] = React.useState(false)
    const [cities, setCities] = React.useState<City[]>([])
    const [loading, setLoading] = React.useState(false)
    const [recentCities, setRecentCities] = React.useState<City[]>([])
    const [inputValue, setInputValue] = React.useState("")
    const router = useRouter()

    React.useEffect(() => {
        // Load recent cities
        const savedRecent = localStorage.getItem("zap_recent_cities")
        if (savedRecent) {
            try {
                setRecentCities(JSON.parse(savedRecent))
            } catch (e) {
                console.error("Failed to parse recent cities", e)
            }
        }
    }, [])

    const handleSearch = async (query: string) => {
        if (query.length < 2) return
        setLoading(true)
        try {
            const res = await fetch(`/api/cities?q=${query}`)
            const data = await res.json()
            setCities(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (city: City) => {
        setOpen(false)
        localStorage.setItem("zap_city_slug", city.slug)
        localStorage.setItem("zap_city_name", city.name)

        // Update recent cities
        const newRecent = [city, ...recentCities.filter(c => c.slug !== city.slug)].slice(0, 3)
        setRecentCities(newRecent)
        localStorage.setItem("zap_recent_cities", JSON.stringify(newRecent))

        router.push(`/${city.slug}`)
        toast.success(`Trocando para ${city.name}...`)
    }

    return (
        <>
            <Button
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                className="justify-between text-sm font-medium hover:bg-gray-100 text-gray-900"
                onClick={() => setOpen(true)}
            >
                <MapPin className="mr-2 h-4 w-4" />
                {currentCityName || "Selecionar cidade"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
                <CommandInput
                    placeholder="Digite sua cidade (ex: São Paulo)..."
                    onValueChange={(val) => {
                        setInputValue(val)
                        handleSearch(val)
                    }}
                />
                <CommandList>
                    {loading && <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Buscando cidades...</div>}

                    {!loading && cities.length === 0 && inputValue.length > 0 && (
                        <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                    )}

                    {!loading && inputValue.length === 0 && recentCities.length > 0 && (
                        <CommandGroup heading="Recentes">
                            {recentCities.map((city) => (
                                <CommandItem
                                    key={city.slug}
                                    value={city.slug}
                                    onSelect={() => handleSelect(city)}
                                >
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    {city.name} - {city.state}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    <CommandGroup heading={cities.length > 0 ? "Resultados" : undefined}>
                        {cities.map((city) => (
                            <CommandItem
                                key={city.slug}
                                value={city.slug}
                                onSelect={() => handleSelect(city)}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        currentCityName === city.name ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {city.name} - {city.state}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
