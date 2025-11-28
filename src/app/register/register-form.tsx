"use client"

import { useActionState, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CitySelect } from "@/components/city-select"
import { registerStore } from "@/app/actions"
import { formatCPF, formatPhone, validateCPF } from "@/lib/validators"

export function RegisterForm() {
    const [state, formAction, isPending] = useActionState(registerStore, null)
    const [phone, setPhone] = useState("")
    const [cpf, setCpf] = useState("")
    const [cpfError, setCpfError] = useState("")
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")
    const [slug, setSlug] = useState("")
    const [slugError, setSlugError] = useState("")
    const [slugAvailable, setSlugAvailable] = useState(false)
    const [checkingSlug, setCheckingSlug] = useState(false)
    const [selectedCity, setSelectedCity] = useState<{ name: string, slug: string } | null>(null)

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value))
    }

    const checkSlug = async (slugToCheck: string) => {
        if (slugToCheck.length < 3) {
            setSlugError("Mínimo 3 caracteres")
            setSlugAvailable(false)
            return
        }

        setCheckingSlug(true)
        try {
            const res = await fetch(`/api/check-slug?slug=${slugToCheck}`)
            const data = await res.json()
            if (data.available) {
                setSlugAvailable(true)
                setSlugError("")
            } else {
                setSlugAvailable(false)
                setSlugError("Link indisponível")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setCheckingSlug(false)
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.toLowerCase()
        // Replace spaces with hyphens and remove invalid chars
        val = val.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

        setSlug(val)
        setSlugAvailable(false)
        setSlugError("")

        if (val.length >= 3) {
            // Simple debounce
            const timeoutId = setTimeout(() => checkSlug(val), 500)
            return () => clearTimeout(timeoutId)
        }
    }

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCPF(e.target.value)
        setCpf(formatted)

        if (formatted.length === 14) {
            if (!validateCPF(formatted)) {
                setCpfError("CPF inválido")
            } else {
                setCpfError("")
            }
        } else {
            setCpfError("")
        }
    }

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {state.error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Seu Nome</Label>
                <Input id="name" name="name" placeholder="João Silva" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    required
                    onChange={(e) => {
                        const email = e.target.value
                        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                            setEmailError("Email inválido")
                        } else {
                            setEmailError("")
                        }
                    }}
                    className={emailError ? "border-red-500" : ""}
                />
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    onChange={(e) => {
                        if (e.target.value.length < 6) {
                            setPasswordError("A senha deve ter pelo menos 6 caracteres")
                        } else {
                            setPasswordError("")
                        }
                    }}
                    className={passwordError ? "border-red-500" : ""}
                />
                {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            </div>

            <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Dados da Loja</h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="storeName">Nome da Loja</Label>
                        <Input id="storeName" name="storeName" placeholder="Minha Loja Incrível" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cityId">Cidade</Label>
                        <CitySelect onSelect={(city) => setSelectedCity(city)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="storeSlug">Link da Loja (Slug)</Label>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">
                                zapvitrine.com/{selectedCity ? selectedCity.slug : "cidade"}/
                            </span>
                            <Input
                                id="storeSlug"
                                name="storeSlug"
                                placeholder="minha-loja"
                                required
                                value={slug}
                                onChange={handleSlugChange}
                                disabled={!selectedCity}
                                className={slugError ? "border-red-500" : (slugAvailable ? "border-green-500" : "")}
                            />
                        </div>
                        {!selectedCity && <p className="text-xs text-yellow-600">Selecione uma cidade primeiro.</p>}
                        {slugError && <p className="text-xs text-red-500">{slugError}</p>}
                        {slugAvailable && !slugError && <p className="text-xs text-green-600">Link disponível!</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">WhatsApp</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="(11) 9 9999-9999"
                            required
                            value={phone}
                            onChange={handlePhoneChange}
                            maxLength={16}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="document">CPF</Label>
                        <Input
                            id="document"
                            name="document"
                            placeholder="000.000.000-00"
                            required
                            value={cpf}
                            onChange={handleCpfChange}
                            maxLength={14}
                            className={cpfError ? "border-red-500" : ""}
                        />
                        {cpfError && <p className="text-xs text-red-500">{cpfError}</p>}
                    </div>
                </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isPending || !!cpfError}>
                {isPending ? "Criando..." : "Criar Loja"}
            </Button>
        </form>
    )
}
