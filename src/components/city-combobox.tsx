"use client"

import * as React from "react"
import { Check, ChevronsUpDown, MapPin, Loader2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter, useSearchParams } from "next/navigation"

interface City {
    name: string
    slug: string
    state: string
}

export function CityCombobox() {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const [cities, setCities] = React.useState<City[]>([])
    const [loading, setLoading] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    const [recentCities, setRecentCities] = React.useState<City[]>([])
    const [inputValue, setInputValue] = React.useState("")
    const router = useRouter()
    const searchParams = useSearchParams()

    React.useEffect(() => {
        setMounted(true)
        const savedCitySlug = localStorage.getItem("zap_city_slug")
        const savedCityName = localStorage.getItem("zap_city_name")
        if (savedCitySlug && savedCityName) {
            setValue(savedCityName)
        }

        // Load recent cities
        const savedRecent = localStorage.getItem("zap_recent_cities")
        if (savedRecent) {
            try {
                setRecentCities(JSON.parse(savedRecent))
            } catch (e) {
                console.error("Failed to parse recent cities", e)
            }
        }

        // Smart Auto-Detection
        // Disable if ?manual=true is present
        const isManualMode = searchParams.get('manual') === 'true'

        if (!isManualMode && !savedCitySlug && navigator.permissions && navigator.geolocation) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                if (result.state === 'granted') {
                    handleGeolocation(true) // Auto-select mode
                }
            })
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

    const handleGeolocation = (autoSelect = false) => {
        if (!navigator.geolocation) {
            if (!autoSelect) toast.error("Geolocalização não suportada.")
            return
        }

        if (!autoSelect) setLoading(true)
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords
            try {
                // Reverse Geocoding via OpenStreetMap
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                const data = await res.json()
                const detectedCity = data.address?.city || data.address?.town || data.address?.village

                if (detectedCity) {
                    // Search in our DB
                    const apiRes = await fetch(`/api/cities?q=${detectedCity}`)
                    const apiData = await apiRes.json()

                    if (apiData && apiData.length > 0) {
                        // Try exact match first, else take first result
                        const match = apiData.find((c: City) =>
                            c.name.toLowerCase() === detectedCity.toLowerCase()
                        ) || apiData[0]

                        if (autoSelect) {
                            toast.success(`Entrando em ${match.name}...`)
                            handleSelect(match)
                        } else {
                            handleSelect(match)
                            toast.success(`Localização definida: ${match.name}`)
                        }
                    } else {
                        if (!autoSelect) toast.error(`Cidade "${detectedCity}" não encontrada no sistema.`)
                    }
                } else {
                    if (!autoSelect) toast.error("Não foi possível identificar a cidade.")
                }
            } catch (error) {
                console.error(error)
                if (!autoSelect) toast.error("Erro ao buscar endereço.")
            } finally {
                if (!autoSelect) setLoading(false)
            }
        }, (error) => {
            if (!autoSelect) setLoading(false)
            if (!autoSelect) {
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error("Permissão de localização negada.")
                } else {
                    toast.error("Erro ao obter localização.")
                }
            }
        })
    }

    const handleSelect = (city: City) => {
        setValue(city.name)
        setOpen(false)
        localStorage.setItem("zap_city_slug", city.slug)
        localStorage.setItem("zap_city_name", city.name)

        // Update recent cities
        const newRecent = [city, ...recentCities.filter(c => c.slug !== city.slug)].slice(0, 3)
        setRecentCities(newRecent)
        localStorage.setItem("zap_recent_cities", JSON.stringify(newRecent))

        router.push(`/${city.slug}`)
    }

    if (!mounted) {
        return (
            <Button
                variant="outline"
                role="combobox"
                className="w-[300px] justify-between text-lg h-12 opacity-50 cursor-not-allowed"
                disabled
            >
                Selecione sua cidade...
            </Button>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    id="city-search-trigger"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[300px] justify-between text-lg h-12"
                >
                    {value
                        ? value
                        : "Selecione sua cidade..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Digite sua cidade (ex: São Paulo)..."
                        onValueChange={(val) => {
                            setInputValue(val)
                            handleSearch(val)
                        }}
                    />
                    <CommandList>
                        <CommandGroup>
                            <CommandItem
                                value="current-location"
                                onSelect={() => handleGeolocation(false)}
                                className="text-blue-600 font-medium"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                {loading ? "Identificando..." : "Usar minha localização"}
                            </CommandItem>
                        </CommandGroup>

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
                                            value === city.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {city.name} - {city.state}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
