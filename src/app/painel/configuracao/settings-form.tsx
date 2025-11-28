"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { STORE_CATEGORIES } from "@/config/categories"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select"
import { updateStoreSettings } from "@/actions/settings"
import { checkSlugAvailability } from "@/actions/check-slug"
import { Upload, AlertTriangle, Check, X, Lock, Unlock, BadgeCheck, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"

interface DaySchedule {
    start: string
    end: string
    isOpen: boolean
}

interface WeeklySchedule {
    [key: string]: DaySchedule
}

export function SettingsForm({ user }: { user: any }) {
    const [loading, setLoading] = React.useState(false)
    const [logoUrl, setLogoUrl] = React.useState(user.logo_url || "")
    const [uploading, setUploading] = React.useState(false)
    const [selectedCategory, setSelectedCategory] = React.useState(user.category_slug || "")

    // Slug State
    const [slug, setSlug] = React.useState(user.slug || "")
    const [slugError, setSlugError] = React.useState("")
    const [isCheckingSlug, setIsCheckingSlug] = React.useState(false)
    const [slugAvailable, setSlugAvailable] = React.useState(true)

    // Address State
    const [cep, setCep] = React.useState(user.location?.address_text?.match(/CEP: (\d{5}-\d{3})/) ? user.location.address_text.match(/CEP: (\d{5}-\d{3})/)[1] : "")
    const [addressNumber, setAddressNumber] = React.useState("")
    const [addressComplement, setAddressComplement] = React.useState("")
    const [street, setStreet] = React.useState("")
    const [neighborhood, setNeighborhood] = React.useState("")
    const [city, setCity] = React.useState(user.location?.city?.name || "")
    const [loadingCep, setLoadingCep] = React.useState(false)

    // City Search State
    const [cityOpen, setCityOpen] = React.useState(false)
    const [citySearchQuery, setCitySearchQuery] = React.useState("")
    const [cityResults, setCityResults] = React.useState<any[]>([])
    const [loadingCity, setLoadingCity] = React.useState(false)

    const handleCitySearch = async (query: string) => {
        setCitySearchQuery(query)
        if (query.length < 2) return
        setLoadingCity(true)
        try {
            const res = await fetch(`/api/cities?q=${query}`)
            const data = await res.json()
            setCityResults(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingCity(false)
        }
    }

    const handleCitySelect = (selectedCity: any) => {
        setCity(selectedCity.name)
        setCep(selectedCity.slug) // We might need to store slug or something else if we want to link it correctly, but for now name is display.
        // Actually, the backend expects 'city_name' or 'address_text'.
        // If we select a city, we should probably clear the CEP field if it was manually entered, or set a dummy one?
        // The backend logic for "CITY" visibility uses 'city' state.
        setCityOpen(false)
    }

    // Parse existing address if full
    React.useEffect(() => {
        if (user.location?.address_text && user.location.address_text.includes(",")) {
            // Format: Street, Number [- Complement] - Neighborhood, City - CEP: ...
            // Example: "Rua A, 123 - Apto 1 - Centro, Cidade - CEP: 00000-000"
            // or: "Rua A, 123 - Centro, Cidade - CEP: 00000-000"

            try {
                const text = user.location.address_text

                // Extract CEP first
                const cepMatch = text.match(/CEP: (\d{5}-\d{3})/)
                if (cepMatch) {
                    setCep(cepMatch[1])
                }

                // Remove CEP part
                const addressPart = text.split(" - CEP:")[0] // "Rua A, 123 - Apto 1 - Centro, Cidade"

                // Split by comma to get Street and the rest
                const firstCommaIndex = addressPart.indexOf(",")
                if (firstCommaIndex !== -1) {
                    const streetVal = addressPart.substring(0, firstCommaIndex).trim()
                    setStreet(streetVal)

                    // "123 - Apto 1 - Centro, Cidade"
                    const rest = addressPart.substring(firstCommaIndex + 1).trim()

                    // The last part after the last comma is the City
                    const lastCommaIndex = rest.lastIndexOf(",")
                    if (lastCommaIndex !== -1) {
                        // const cityVal = rest.substring(lastCommaIndex + 1).trim()
                        // setCity(cityVal) // City is already set from user.location.city.name usually, but we can ensure it matches? 
                        // Actually city comes from the relation, so we might not need to parse it from text if we trust the relation.

                        // "123 - Apto 1 - Centro"
                        const numberAndNeighborhood = rest.substring(0, lastCommaIndex).trim()

                        // Split by " - "
                        const parts = numberAndNeighborhood.split(" - ")
                        // parts[0] is Number
                        // parts[last] is Neighborhood
                        // Middle parts are Complement

                        if (parts.length >= 2) {
                            setAddressNumber(parts[0])
                            setNeighborhood(parts[parts.length - 1])

                            if (parts.length > 2) {
                                setAddressComplement(parts.slice(1, parts.length - 1).join(" - "))
                            }
                        } else if (parts.length === 1) {
                            setAddressNumber(parts[0])
                        }
                    }
                }
            } catch (e) {
                console.error("Error parsing address", e)
            }
        }
    }, [user.location?.address_text])

    // Schedule State
    const defaultSchedule = {
        monday: { start: "", end: "", isOpen: false },
        tuesday: { start: "", end: "", isOpen: false },
        wednesday: { start: "", end: "", isOpen: false },
        thursday: { start: "", end: "", isOpen: false },
        friday: { start: "", end: "", isOpen: false },
        saturday: { start: "", end: "", isOpen: false },
        sunday: { start: "", end: "", isOpen: false },
    }

    const [schedule, setSchedule] = React.useState<WeeklySchedule>(() => {
        if (user.business?.schedule) {
            try {
                return JSON.parse(user.business.schedule)
            } catch (e) {
                return defaultSchedule
            }
        }
        return defaultSchedule
    })

    const handleScheduleChange = (day: string, field: string, value: any) => {
        setSchedule((prev: any) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }))
    }

    const applyMondayToAll = () => {
        const monday = schedule.monday
        setSchedule({
            monday: { ...monday },
            tuesday: { ...monday },
            wednesday: { ...monday },
            thursday: { ...monday },
            friday: { ...monday },
            saturday: { ...monday }, // Optional: maybe user wants Saturday different? But "all days" implies all.
            sunday: { ...monday },
        })
        toast.success("Horário de segunda aplicado para todos os dias!")
    }

    // Determine Store Type
    const storeType = React.useMemo(() => {
        for (const group of STORE_CATEGORIES) {
            if (group.items.some(i => i.value === selectedCategory)) {
                return group.type
            }
        }
        return null
    }, [selectedCategory])

    const isFoodOrRetail = storeType === "FOOD" || storeType === "RETAIL"
    const isService = storeType === "SERVICE"

    // Consumption Mode State
    // Legacy/Food/Retail: DELIVERY, PICKUP, BOTH
    // Service: JSON array ["ONLINE", "IN_PERSON", "HOME"]

    // Initialize Food/Retail state
    const [deliveryChecked, setDeliveryChecked] = React.useState(
        user.business?.consumption_mode === "DELIVERY" || user.business?.consumption_mode === "BOTH"
    )
    const [pickupChecked, setPickupChecked] = React.useState(
        user.business?.consumption_mode === "PICKUP" || user.business?.consumption_mode === "BOTH"
    )

    // Initialize Service state
    const [onlineChecked, setOnlineChecked] = React.useState(false)
    const [inPersonChecked, setInPersonChecked] = React.useState(false)
    const [homeChecked, setHomeChecked] = React.useState(false)

    React.useEffect(() => {
        if (user.business?.consumption_mode && user.business.consumption_mode.startsWith("[")) {
            try {
                const modes = JSON.parse(user.business.consumption_mode)
                setOnlineChecked(modes.includes("ONLINE"))
                setInPersonChecked(modes.includes("IN_PERSON"))
                setHomeChecked(modes.includes("HOME"))
            } catch (e) {
                console.error("Failed to parse service consumption modes", e)
            }
        }
    }, [user.business?.consumption_mode])

    // Validation for Opening Store
    const canOpenStore = React.useMemo(() => {
        // Check if at least one day is open
        const hasOpenDay = Object.values(schedule).some((day: any) => day.isOpen)
        return !!(logoUrl && selectedCategory && user.description && hasOpenDay && user.location?.address_text)
    }, [logoUrl, selectedCategory, user.description, schedule, user.location?.address_text])

    const handleCepBlur = async () => {
        const cleanCep = cep.replace(/\D/g, "")
        if (cleanCep.length === 8) {
            setLoadingCep(true)
            try {
                const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
                const data = await res.json()
                if (!data.erro) {
                    setStreet(data.logradouro)
                    setNeighborhood(data.bairro)
                    setCity(data.localidade)
                    toast.success("Endereço encontrado!")
                } else {
                    toast.error("CEP não encontrado.")
                }
            } catch (error) {
                console.error("Erro ao buscar CEP", error)
                toast.error("Erro ao buscar CEP.")
            } finally {
                setLoadingCep(false)
            }
        }
    }

    const formatCep = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .substr(0, 9)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", "logo")

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                setLogoUrl(data.url)
                toast.success("Logo enviada com sucesso!")
            }
        } catch (error) {
            console.error("Upload failed", error)
            toast.error("Erro ao fazer upload da logo")
        } finally {
            setUploading(false)
        }
    }

    const [isEditingSensitive, setIsEditingSensitive] = React.useState(false)
    const [addressVisibility, setAddressVisibility] = React.useState<"FULL" | "CITY">("FULL")

    // Initialize address visibility based on existing data
    React.useEffect(() => {
        if (user.location?.address_text && !user.location.address_text.includes(",")) {
            setAddressVisibility("CITY")
        }
    }, [user.location?.address_text])

    const formatPhone = (value: string) => {
        // (99) 9 9999-9999
        return value
            .replace(/\D/g, "")
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{1})(\d{4})(\d)/, "$1 $2-$3")
            .substr(0, 16)
    }

    // Confirmation Dialog
    const [showConfirmation, setShowConfirmation] = React.useState(false)
    const [pendingFormData, setPendingFormData] = React.useState<FormData | null>(null)

    const handleSlugChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
        setSlug(newSlug)
        setSlugError("")
        setSlugAvailable(true)

        if (newSlug.length > 2) {
            setIsCheckingSlug(true)
            const result = await checkSlugAvailability(newSlug)
            setIsCheckingSlug(false)
            if (!result.available) {
                setSlugError("Este link já está em uso.")
                setSlugAvailable(false)
            }
        }
    }

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (slugError || !slugAvailable) {
            toast.error("Por favor, corrija o link da loja.")
            return
        }

        const formData = new FormData(e.currentTarget)
        setPendingFormData(formData)
        setShowConfirmation(true)
    }

    const confirmSubmit = async () => {
        if (!pendingFormData) return
        setShowConfirmation(false)
        setLoading(true)

        const formData = pendingFormData
        if (!formData.get("logo_url")) {
            formData.append("logo_url", logoUrl)
        }

        // Handle Consumption Mode
        let mode = null

        if (isFoodOrRetail) {
            if (deliveryChecked && pickupChecked) mode = "BOTH"
            else if (deliveryChecked) mode = "DELIVERY"
            else if (pickupChecked) mode = "PICKUP"
        } else if (isService) {
            const modes = []
            if (onlineChecked) modes.push("ONLINE")
            if (inPersonChecked) modes.push("IN_PERSON")
            if (homeChecked) modes.push("HOME")
            if (modes.length > 0) mode = JSON.stringify(modes)
        }

        if (mode) formData.set("consumption_mode", mode)

        // Construct full address based on visibility setting
        if (addressVisibility === "CITY") {
            if (city) {
                const simpleAddress = `${city} - CEP: ${cep}`
                formData.set("address_text", simpleAddress)
            }
        } else {
            if (street && addressNumber) {
                const fullAddress = `${street}, ${addressNumber} ${addressComplement ? `- ${addressComplement}` : ""} - ${neighborhood}, ${city} - CEP: ${cep}`
                formData.set("address_text", fullAddress)
            }
        }

        try {
            await updateStoreSettings(formData)
            toast.success("Configurações atualizadas com sucesso!")
            setIsEditingSensitive(false)
        } catch (error) {
            console.error(error)
            toast.error("Erro ao salvar configurações")
        } finally {
            setLoading(false)
            setPendingFormData(null)
        }
    }

    return (
        <>
            <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Card 1: Dados da Conta */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da Conta</CardTitle>
                        <CardDescription>Informações de login e acesso.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="owner_name">Nome Completo</Label>
                            <Input id="owner_name" name="owner_name" defaultValue={user.owner_name || ""} placeholder="Seu nome" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user.email} disabled className="bg-gray-50" />
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Dados da Loja */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Dados da Loja
                            {user.verified && (
                                <div className="flex items-center gap-1 text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-100">
                                    <BadgeCheck className="w-3 h-3" />
                                    Verificada
                                </div>
                            )}
                        </CardTitle>
                        <CardDescription>Essas informações aparecem na sua vitrine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label>Logo da Loja <span className="text-red-500">*</span></Label>
                            <div className="flex items-center gap-6">
                                <div className="relative w-24 h-24 border rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-xs">Sem Logo</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="logo-upload" className="cursor-pointer">
                                        <div className="flex items-center gap-2 border px-4 py-2 rounded-md hover:bg-gray-50 w-fit">
                                            <Upload className="w-4 h-4" />
                                            <span>{uploading ? "Enviando..." : "Alterar Logo"}</span>
                                        </div>
                                        <Input
                                            id="logo-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-2">Recomendado: 800x800px (JPG, PNG)</p>
                                </div>
                            </div>
                            <input type="hidden" name="logo_url" value={logoUrl} />
                        </div>

                        <div className="grid md:grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label>Slug (Link da Loja) <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Input
                                        name="slug"
                                        value={slug}
                                        onChange={handleSlugChange}
                                        className={slugError ? "border-red-500 pr-10" : "pr-10"}
                                        placeholder="minha-loja"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {isCheckingSlug ? (
                                            <span className="text-xs text-gray-400">...</span>
                                        ) : slugAvailable && slug ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : slugError ? (
                                            <X className="w-4 h-4 text-red-500" />
                                        ) : null}
                                    </div>
                                </div>
                                {slugError && <p className="text-xs text-red-500">{slugError}</p>}
                                <p className="text-xs text-muted-foreground">zapvitrine.com.br/{user.location?.city?.slug || 'cidade'}/{slug}</p>
                            </div>
                        </div>

                        {/* Sensitive Data Section */}
                        <div className="space-y-6 border p-4 rounded-md bg-gray-50 relative">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-sm flex items-center gap-2">
                                    <span className="text-red-500">*</span> Dados de Contato e Endereço
                                    {!isEditingSensitive && <span className="flex items-center gap-1 text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600"><Lock className="w-3 h-3" /> Bloqueado</span>}
                                </h3>
                                {!isEditingSensitive ? (
                                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditingSensitive(true)}>
                                        <Unlock className="w-3 h-3 mr-2" /> Editar Dados
                                    </Button>
                                ) : (
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditingSensitive(false)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        Cancelar Edição
                                    </Button>
                                )}
                            </div>

                            <div className={`space-y-6 transition-opacity ${!isEditingSensitive ? "opacity-75 pointer-events-none" : ""}`}>

                                {/* Contact Section */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">WhatsApp (Obrigatório) <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        defaultValue={user.phone || ""}
                                        placeholder="(99) 9 9999-9999"
                                        required
                                        readOnly={!isEditingSensitive}
                                        tabIndex={!isEditingSensitive ? -1 : 0}
                                        onChange={(e) => e.target.value = formatPhone(e.target.value)}
                                    />
                                </div>

                                <div className="h-px bg-gray-200" />

                                {/* Address Section */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>O que mostrar no site?</Label>
                                        <div className="flex gap-4">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="vis_full"
                                                    name="address_visibility"
                                                    value="FULL"
                                                    checked={addressVisibility === "FULL"}
                                                    onChange={() => setAddressVisibility("FULL")}
                                                    className="h-4 w-4"
                                                    disabled={!isEditingSensitive}
                                                />
                                                <Label htmlFor="vis_full">Endereço Completo</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="vis_city"
                                                    name="address_visibility"
                                                    value="CITY"
                                                    checked={addressVisibility === "CITY"}
                                                    onChange={() => setAddressVisibility("CITY")}
                                                    className="h-4 w-4"
                                                    disabled={!isEditingSensitive}
                                                />
                                                <Label htmlFor="vis_city">Apenas Cidade</Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {addressVisibility === "FULL" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="cep">CEP</Label>
                                                <Input
                                                    id="cep"
                                                    value={cep}
                                                    onChange={(e) => setCep(formatCep(e.target.value))}
                                                    onBlur={handleCepBlur}
                                                    placeholder="00000-000"
                                                    maxLength={9}
                                                    disabled={!isEditingSensitive}
                                                />
                                                {loadingCep && <span className="text-xs text-blue-500">Buscando...</span>}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="city_display">Cidade</Label>
                                            {addressVisibility === "CITY" ? (
                                                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={cityOpen}
                                                            className="w-full justify-between"
                                                            disabled={!isEditingSensitive}
                                                        >
                                                            {city || "Selecione a cidade..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0">
                                                        <Command shouldFilter={false}>
                                                            <CommandInput placeholder="Buscar cidade..." onValueChange={handleCitySearch} />
                                                            <CommandList>
                                                                {loadingCity && <div className="p-2 text-sm text-muted-foreground">Buscando...</div>}
                                                                <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {cityResults.map((c) => (
                                                                        <CommandItem
                                                                            key={c.slug}
                                                                            value={c.slug}
                                                                            onSelect={() => handleCitySelect(c)}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    city === c.name ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {c.name} - {c.state}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <Input id="city_display" value={city} readOnly className="bg-gray-100" />
                                            )}
                                            <Input type="hidden" name="city_name" value={city} />
                                        </div>
                                    </div>

                                    {addressVisibility === "FULL" && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="street">Rua</Label>
                                                <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua..." disabled={!isEditingSensitive} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="number">Número</Label>
                                                    <Input id="number" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} placeholder="123" disabled={!isEditingSensitive} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="complement">Complemento</Label>
                                                    <Input id="complement" value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} placeholder="Apto 101" disabled={!isEditingSensitive} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="neighborhood">Bairro</Label>
                                                <Input id="neighborhood" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro..." disabled={!isEditingSensitive} />
                                            </div>
                                        </>
                                    )}

                                    <Input type="hidden" name="address_text" defaultValue={user.location?.address_text || ""} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria da Loja <span className="text-red-500">*</span></Label>
                            <Select
                                name="category"
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STORE_CATEGORIES.map((group) => (
                                        <SelectGroup key={group.type}>
                                            <SelectLabel>{group.label}</SelectLabel>
                                            {group.items.map((item) => (
                                                <SelectItem key={item.value} value={item.value}>
                                                    <span className="mr-2">{item.icon}</span>
                                                    {item.label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {
                            isFoodOrRetail && (
                                <div className="space-y-2 border p-4 rounded-md bg-gray-50">
                                    <Label>Fornece entrega?</Label>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="delivery"
                                                checked={deliveryChecked}
                                                onCheckedChange={(c) => setDeliveryChecked(!!c)}
                                            />
                                            <Label htmlFor="delivery">Entrega Rápida</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="pickup"
                                                checked={pickupChecked}
                                                onCheckedChange={(c) => setPickupChecked(!!c)}
                                            />
                                            <Label htmlFor="pickup">Retirada</Label>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {
                            isService && (
                                <div className="space-y-2 border p-4 rounded-md bg-gray-50">
                                    <Label>Modalidades de Atendimento</Label>
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="online"
                                                checked={onlineChecked}
                                                onCheckedChange={(c) => setOnlineChecked(!!c)}
                                            />
                                            <Label htmlFor="online">Atendimento Online</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="in_person"
                                                checked={inPersonChecked}
                                                onCheckedChange={(c) => setInPersonChecked(!!c)}
                                            />
                                            <Label htmlFor="in_person">Presencial</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="home"
                                                checked={homeChecked}
                                                onCheckedChange={(c) => setHomeChecked(!!c)}
                                            />
                                            <Label htmlFor="home">A Domicílio</Label>
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição <span className="text-red-500">*</span></Label>
                            <Textarea id="description" name="description" defaultValue={user.description || ""} placeholder="Conte um pouco sobre sua loja..." />
                        </div>

                        <div className="space-y-4">
                            <Label>Horário de Funcionamento <span className="text-red-500">*</span></Label>

                            {!canOpenStore && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Atenção</AlertTitle>
                                    <AlertDescription>
                                        Para abrir a loja, você precisa preencher: Logo, Endereço, Categoria, Descrição e Horários.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-end mb-2">
                                <Button type="button" variant="outline" size="sm" onClick={applyMondayToAll}>
                                    Aplicar segunda para todos
                                </Button>
                            </div>

                            <div className="border rounded-md divide-y">
                                {Object.entries(schedule).map(([day, config]) => (
                                    <div key={day} className="flex items-center justify-between p-3">
                                        <div className="flex items-center gap-3 w-32">
                                            <Switch
                                                checked={config.isOpen}
                                                onCheckedChange={(checked) => handleScheduleChange(day, "isOpen", checked)}
                                            />
                                            <span className="capitalize text-sm font-medium">
                                                {day === "monday" ? "Segunda" :
                                                    day === "tuesday" ? "Terça" :
                                                        day === "wednesday" ? "Quarta" :
                                                            day === "thursday" ? "Quinta" :
                                                                day === "friday" ? "Sexta" :
                                                                    day === "saturday" ? "Sábado" : "Domingo"}
                                            </span>
                                        </div>

                                        {config.isOpen ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="time"
                                                    value={config.start}
                                                    onChange={(e) => handleScheduleChange(day, "start", e.target.value)}
                                                    className="w-24 h-8"
                                                />
                                                <span className="text-gray-400">-</span>
                                                <Input
                                                    type="time"
                                                    value={config.end}
                                                    onChange={(e) => handleScheduleChange(day, "end", e.target.value)}
                                                    className="w-24 h-8"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic flex-1 text-center">Fechado</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <input type="hidden" name="schedule" value={JSON.stringify(schedule)} />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" disabled={loading || uploading} className="w-full md:w-auto">
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </CardContent >
                </Card >
            </form >

            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Alterações</DialogTitle>
                        <DialogDescription>
                            Você tem certeza que deseja atualizar essas informações?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-500">
                            As alterações entrarão em vigor imediatamente na sua vitrine.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmation(false)}>Cancelar</Button>
                        <Button onClick={confirmSubmit} disabled={loading}>
                            {loading ? "Salvando..." : "Confirmar e Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
