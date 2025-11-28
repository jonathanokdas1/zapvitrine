import { getSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"
import { ProductForm } from "../product-form"

const prisma = new PrismaClient()

export default async function NewProductPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { plan: true }
    })

    if (!user) redirect('/login')

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Novo Produto</h2>
                <p className="text-muted-foreground">Adicione um novo item ao seu cardápio.</p>
            </div>
            <ProductForm plan={user.plan?.plan || "FREE"} />
        </div>
    )
}
