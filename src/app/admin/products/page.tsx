import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Plus, Edit, Trash2, AlertTriangle, ExternalLink, Eye, EyeOff } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const prisma = new PrismaClient()

async function getUserData() {
    const user = await prisma.user.findFirst({
        include: {
            products: true,
            plan: true,
            business: true
        }
    })
    return user
}

export default async function ProductsPage() {
    const user = await getUserData()

    if (!user) return <div>Carregando...</div>

    const isProfileComplete =
        user.phone &&
        user.slug &&
        user.logo_url &&
        user.description &&
        user.business?.opening_hours

    const isFreePlan = user.plan?.plan === 'FREE'

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
                    <p className="text-muted-foreground">Gerencie o cardápio da sua loja.</p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/${user.slug}`} target="_blank">
                        <Button variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" /> Minha Loja
                        </Button>
                    </Link>
                    {isProfileComplete ? (
                        <Link href="/admin/products/new">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" /> Novo Produto
                            </Button>
                        </Link>
                    ) : (
                        <Button disabled>
                            <Plus className="w-4 h-4 mr-2" /> Novo Produto
                        </Button>
                    )}
                </div>
            </div>

            {!isProfileComplete && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cadastro Incompleto</AlertTitle>
                    <AlertDescription>
                        Para criar produtos, termine de configurar sua loja (Logo, Descrição, Horários) na aba Configurações.
                        <div className="mt-4">
                            <Link href="/admin/settings">
                                <Button variant="outline" className="border-red-300 hover:bg-red-100">
                                    Ir para Configurações
                                </Button>
                            </Link>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {isFreePlan && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                    <AlertTriangle className="h-4 w-4 text-blue-800" />
                    <AlertTitle>Plano Grátis</AlertTitle>
                    <AlertDescription>
                        Você está no plano Grátis. Limite de 1 imagem por produto.
                        <Link href="/admin/upgrade" className="font-bold underline ml-1">
                            Faça Upgrade para PRO
                        </Link>
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {user.products.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-muted-foreground mb-4">Você ainda não tem produtos.</p>
                        {isProfileComplete && (
                            <Link href="/admin/products/new">
                                <Button variant="outline">Criar primeiro produto</Button>
                            </Link>
                        )}
                    </div>
                )}

                {user.products.map((product) => (
                    <Card key={product.id} className={product.is_active ? "" : "opacity-75"}>
                        <div className="h-48 bg-gray-100 relative overflow-hidden rounded-t-xl group">
                            {product.images ? (
                                <img
                                    src={JSON.parse(product.images as string)[0]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    Sem Imagem
                                </div>
                            )}
                            {!product.is_active && (
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">Inativo</Badge>
                                </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/${user.slug}?product=${product.id}`} target="_blank">
                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{product.title}</CardTitle>
                                <span className="font-bold">
                                    {formatCurrency(product.price)}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2">
                                    <Switch checked={product.is_active} />
                                    <span className="text-sm text-muted-foreground">
                                        {product.is_active ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="icon">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
