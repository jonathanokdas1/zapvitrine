import { PrismaClient } from "@prisma/client"
import { SettingsForm } from "./settings-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export default async function SettingsPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
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

            <SettingsForm user={user} />
        </div>
    )
}
