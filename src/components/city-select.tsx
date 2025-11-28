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

interface City {
    id: string
    name: string
    state: string
    slug: string
}

export function CitySelect({ onSelect }: { onSelect?: (city: City) => void }) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")
    const [selectedCityId, setSelectedCityId] = React.useState("")
    const [cities, setCities] = React.useState<City[]>([])
    const [loading, setLoading] = React.useState(false)

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

    return (
        <>
            <input type="hidden" name="cityId" value={selectedCityId} />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
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
                                        key={city.id}
                                        value={city.name}
                                        onSelect={() => {
                                            setValue(`${city.name} - ${city.state}`)
                                            setSelectedCityId(city.id)
                                            setOpen(false)
                                            onSelect?.(city)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedCityId === city.id ? "opacity-100" : "opacity-0"
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
        </>
    )
}
