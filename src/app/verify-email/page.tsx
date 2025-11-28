"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { verifyEmail } from "@/app/actions"
import Link from "next/link"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading')

    React.useEffect(() => {
        if (!token) {
            setStatus('error')
            return
        }

        verifyEmail(token)
            .then((result) => {
                if (result?.error) {
                    setStatus('error')
                    toast.error(result.error)
                } else {
                    setStatus('success')
                    toast.success("Email verificado com sucesso!")
                    setTimeout(() => router.push("/painel"), 3000)
                }
            })
            .catch(() => {
                setStatus('error')
            })
    }, [token, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Verificação de Email</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <p className="text-gray-500">Verificando seu email...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="w-12 h-12 text-green-500" />
                            <div className="space-y-2">
                                <p className="text-lg font-medium text-green-700">Email Verificado!</p>
                                <p className="text-gray-500">Sua loja agora está visível para todos.</p>
                            </div>
                            <Button asChild className="w-full mt-4">
                                <Link href="/painel">Ir para o Painel</Link>
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="w-12 h-12 text-red-500" />
                            <div className="space-y-2">
                                <p className="text-lg font-medium text-red-700">Falha na Verificação</p>
                                <p className="text-gray-500">O link é inválido ou expirou.</p>
                            </div>
                            <Button asChild variant="outline" className="w-full mt-4">
                                <Link href="/painel">Voltar ao Painel</Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
