"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import { useRouter } from "next/navigation"

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
    const router = useRouter()

    React.useEffect(() => {
        setMounted(true)
        const savedCitySlug = localStorage.getItem("zap_city_slug")
        const savedCityName = localStorage.getItem("zap_city_name")
        if (savedCitySlug && savedCityName) {
            setValue(savedCityName)
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
        setValue(city.name)
        setOpen(false)
        localStorage.setItem("zap_city_slug", city.slug)
        localStorage.setItem("zap_city_name", city.name)
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
                        placeholder="Buscar cidade..."
                        onValueChange={handleSearch}
                    />
                    <CommandList>
                        {loading && <div className="p-2 text-sm text-muted-foreground">Buscando...</div>}
                        <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                        <CommandGroup>
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
