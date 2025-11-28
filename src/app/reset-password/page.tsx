"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { resetPassword } from "@/actions/security"
import Link from "next/link"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <p className="text-red-500 mb-4">Token inválido ou ausente.</p>
                        <Button asChild variant="outline">
                            <Link href="/login">Voltar para Login</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await resetPassword(token!, formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setSuccess(true)
                toast.success("Senha alterada com sucesso!")
                setTimeout(() => router.push("/login"), 2000)
            }
        } catch (error) {
            toast.error("Erro ao redefinir senha")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Redefinir Senha</CardTitle>
                    <CardDescription className="text-center">
                        Digite sua nova senha abaixo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 text-green-700 rounded-md">
                                Senha alterada com sucesso! Redirecionando...
                            </div>
                        </div>
                    ) : (
                        <form action={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <Input id="password" name="password" type="password" required minLength={6} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Salvando..." : "Salvar Nova Senha"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
