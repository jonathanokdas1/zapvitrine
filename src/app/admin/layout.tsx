import Link from "next/link"
import { LayoutDashboard, ShoppingBag, Settings, CreditCard, HelpCircle, LogOut, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    const user = session ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            slug: true,
            location: {
                select: {
                    city: {
                        select: {
                            slug: true
                        }
                    }
                }
            }
        }
    }) : null

    const storeLink = user?.location?.city?.slug && user?.slug
        ? `/${user.location.city.slug}/${user.slug}`
        : "/"

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">ZapVitrine</h1>
                    <p className="text-xs text-gray-500">Painel do Vendedor</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Início
                        </Button>
                    </Link>
                    <Link href="/admin/products">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Produtos
                        </Button>
                    </Link>
                    <Link href="/admin/settings">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings className="w-4 h-4" />
                            Configurações
                        </Button>
                    </Link>
                    <Link href="/admin/upgrade">
                        <Button variant="ghost" className="w-full justify-start gap-2 text-purple-600">
                            <CreditCard className="w-4 h-4" />
                            Planos
                        </Button>
                    </Link>
                    <Link href="/admin/support">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <HelpCircle className="w-4 h-4" />
                            Suporte
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t space-y-2">
                    {/* Minha Loja Button */}
                    <Link href={storeLink} target="_blank">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Minha Loja
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600">
                            <LogOut className="w-4 h-4" />
                            Sair
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
