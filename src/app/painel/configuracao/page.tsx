import { prisma } from "@/lib/prisma"
import { SettingsForm } from "./settings-form"
import { SecurityForm } from "./security-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SettingsPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            business: true,
            location: {
                include: {
                    city: true
                }
            }
        }
    })

    if (!user) redirect('/login')

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
                <p className="text-muted-foreground">Gerencie as informações da sua loja.</p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="security">Segurança</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-4">
                    <SettingsForm user={user} />
                </TabsContent>
                <TabsContent value="security" className="space-y-4">
                    <SecurityForm />
                </TabsContent>
            </Tabs>
        </div>
    )
}
