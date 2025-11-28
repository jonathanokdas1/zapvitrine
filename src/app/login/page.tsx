"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { login } from "@/app/actions"
import Link from "next/link"

function LoginForm() {
    const [state, formAction, isPending] = useActionState(login, null)

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {state.error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                        Esqueci minha senha
                    </Link>
                </div>
                <Input id="password" name="password" type="password" required />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Entrando..." : "Entrar"}
            </Button>
        </form>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login Vendedor</CardTitle>
                    <CardDescription className="text-center">
                        Acesse o painel da sua loja.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Não tem uma conta?{" "}
                        <Link href="/register" className="text-blue-600 hover:underline">
                            Cadastre-se
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
