import { PrismaClient } from "@prisma/client"
import { getSession } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { ProductForm } from "../product-form"

const prisma = new PrismaClient()

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
    const session = await getSession()
    if (!session) redirect("/login")

    const { productId } = await params

    const product = await prisma.product.findUnique({
        where: { id: productId }
    })

    if (!product) notFound()

    if (product.userId !== session.userId) {
        redirect("/admin/products")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { plan: true }
    })

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Editar Produto</h2>
                <p className="text-muted-foreground">Atualize as informações do seu produto.</p>
            </div>

            <ProductForm plan={user?.plan?.plan || "FREE"} product={product} />
        </div>
    )
}
