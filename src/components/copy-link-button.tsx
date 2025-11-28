"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { getBaseUrl } from "@/lib/utils"

interface CopyLinkButtonProps {
    url: string
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    label?: string
}

export function CopyLinkButton({ url, className, variant = "outline", size = "default", label }: CopyLinkButtonProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = async () => {
        try {
            const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`
            await navigator.clipboard.writeText(fullUrl)
            setCopied(true)
            toast.success("Link copiado!")
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error("Erro ao copiar link")
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleCopy}
        >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {label || (copied ? "Copiado!" : "Copiar Link")}
        </Button>
    )
}
