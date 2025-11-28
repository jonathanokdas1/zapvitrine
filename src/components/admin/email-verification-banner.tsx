"use client"

import { AlertTriangle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resendVerificationEmail } from "@/app/actions"
import { toast } from "sonner"
import { useState } from "react"

export function EmailVerificationBanner({ emailVerified }: { emailVerified: Date | null }) {
    const [loading, setLoading] = useState(false)

    if (emailVerified) return null

    async function handleResend() {
        setLoading(true)
        try {
            const result = await resendVerificationEmail()
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Email de verificação reenviado!")
            }
        } catch (error) {
            toast.error("Erro ao reenviar email")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
                    <div>
                        <p className="text-sm text-yellow-700 font-medium">
                            Sua loja não está visível publicamente!
                        </p>
                        <p className="text-xs text-yellow-600">
                            Verifique seu email para ativar sua loja.
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-yellow-700 border-yellow-700 hover:bg-yellow-100"
                >
                    {loading ? "Enviando..." : "Reenviar Email"}
                    <Send className="ml-2 h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}
