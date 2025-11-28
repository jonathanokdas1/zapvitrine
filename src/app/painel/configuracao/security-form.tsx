"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { initiatePasswordChange } from "@/actions/security"
import { toast } from "sonner"
import { Mail, ShieldAlert } from "lucide-react"

export function SecurityForm() {
    const [loading, setLoading] = React.useState(false)

    async function handleInitiateChange() {
        setLoading(true)
        try {
            const result = await initiatePasswordChange()
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success("Link de alteração enviado para seu email!")
            }
        } catch (error) {
            toast.error("Erro ao enviar solicitação")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Gerencie sua senha de acesso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                    <div className="flex">
                        <ShieldAlert className="h-5 w-5 text-blue-500 mr-3 shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800">Alteração de Senha Segura</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Por motivos de segurança, a alteração de senha requer uma verificação por email.
                                Você receberá um link temporário para definir sua nova senha.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-start">
                    <Button onClick={handleInitiateChange} disabled={loading} className="w-full md:w-auto">
                        <Mail className="mr-2 h-4 w-4" />
                        {loading ? "Enviando..." : "Enviar Link de Alteração"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
