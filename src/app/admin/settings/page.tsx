"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SettingsPage() {
    const [loading, setLoading] = React.useState(false)
    const [logoUrl, setLogoUrl] = React.useState("")
    const [uploading, setUploading] = React.useState(false)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", "logo")

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                setLogoUrl(data.url)
            }
        } catch (error) {
            console.error("Upload failed", error)
            alert("Erro ao fazer upload da logo")
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const openTime = formData.get("openTime")
        const closeTime = formData.get("closeTime")
        const hours = `${openTime} - ${closeTime}`

        // In a real app, we would send this to a server action or API
        console.log("Saving:", {
            logo: logoUrl,
            phone: formData.get("phone"),
            description: formData.get("description"),
            hours
        })

        // Mock save delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setLoading(false)
        alert("Configurações salvas com sucesso!")
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">Gerencie as informações da sua loja.</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Dados da Loja</CardTitle>
                        <CardDescription>Essas informações aparecem na sua vitrine.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo da Loja</Label>
                            <div className="flex items-center gap-4">
                                {logoUrl && (
                                    <img src={logoUrl} alt="Logo Preview" className="w-16 h-16 rounded-full object-cover border" />
                                )}
                                <Input
                                    id="logo"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </div>
                            {uploading && <p className="text-sm text-muted-foreground">Enviando...</p>}
                            <input type="hidden" name="logo_url" value={logoUrl} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">WhatsApp (com DDD)</Label>
                            <Input id="phone" name="phone" placeholder="(99) 99999-9999" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" name="description" placeholder="Conte um pouco sobre sua loja..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Horário de Funcionamento</Label>
                            <div className="flex items-center gap-2">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="openTime" className="text-xs text-muted-foreground">Abertura</Label>
                                    <Input id="openTime" name="openTime" type="time" className="w-32" />
                                </div>
                                <span className="pt-6 text-muted-foreground">até</span>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="closeTime" className="text-xs text-muted-foreground">Fechamento</Label>
                                    <Input id="closeTime" name="closeTime" type="time" className="w-32" />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading || uploading}>
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    )
}
