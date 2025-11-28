"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { requestPasswordReset } from "@/actions/security"
import Link from "next/link"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await requestPasswordReset(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setSuccess(true)
                toast.success(result.message || "Solicitação enviada!")
            }
        } catch (error) {
            toast.error("Erro ao solicitar recuperação")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Recuperar Senha</CardTitle>
                    <CardDescription className="text-center">
                        Digite seu email para receber um link de recuperação.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 text-green-700 rounded-md">
                                Se o email estiver cadastrado, você receberá um link de recuperação em instantes.
                            </div>
                            <Button asChild className="w-full" variant="outline">
                                <Link href="/login">Voltar para Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Enviando..." : "Enviar Link"}
                            </Button>

                            <div className="text-center text-sm">
                                <Link href="/login" className="text-blue-600 hover:underline">
                                    Voltar para Login
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
