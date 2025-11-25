"use client"

import { Switch } from "@/components/ui/switch"
import { toggleProductStatus } from "@/actions/dashboard"
import { useState } from "react"
import { toast } from "sonner"

interface ProductStatusToggleProps {
    productId: string
    isActive: boolean
}

export function ProductStatusToggle({ productId, isActive }: ProductStatusToggleProps) {
    const [active, setActive] = useState(isActive)
    const [loading, setLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        // Optimistic update
        setActive(checked)
        setLoading(true)

        try {
            await toggleProductStatus(productId, checked)
            toast.success(checked ? "Produto ativado" : "Produto inativado")
        } catch (error) {
            console.error(error)
            // Revert on error
            setActive(!checked)
            toast.error("Erro ao atualizar status")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={active}
                onCheckedChange={handleToggle}
                disabled={loading}
            />
            <span className="text-sm text-muted-foreground">
                {active ? "Ativo" : "Inativo"}
            </span>
        </div>
    )
}
