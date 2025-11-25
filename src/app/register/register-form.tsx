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

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value))
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
                <Input id="email" name="email" type="email" placeholder="joao@exemplo.com" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" name="password" type="password" required />
            </div>

            <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-4">Dados da Loja</h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="storeName">Nome da Loja</Label>
                        <Input id="storeName" name="storeName" placeholder="Minha Loja Incrível" required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="storeSlug">Link da Loja (Slug)</Label>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">zapvitrine.com/</span>
                            <Input id="storeSlug" name="storeSlug" placeholder="minha-loja" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cityId">Cidade</Label>
                        <CitySelect />
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
