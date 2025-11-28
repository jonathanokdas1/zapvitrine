import { PrismaClient } from "@prisma/client"
import { getSession } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { ProductForm } from "../product-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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
        return ( // Added return statement to render the link
            <div className="flex flex-col items-center justify-center h-screen">
                <Link href="/painel/produtos">
                    <Button variant="ghost" className="gap-2 mb-4">
                        <ArrowLeft className="h-4 w-4" />
                        Voltar para Produtos
                    </Button>
                </Link>
                <p className="text-muted-foreground">Você não tem permissão para editar este produto.</p>
            </div>
        )
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
