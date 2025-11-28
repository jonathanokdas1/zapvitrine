import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Store, Clock, MapPin, BadgeCheck, AlertTriangle, Flag } from "lucide-react"
import { ProductGrid } from "@/components/product/product-grid"
import { checkStoreOpen, getStoreStatus } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ViewTracker } from "@/components/analytics/view-tracker"
import { LiveTracker } from "@/components/analytics/live-tracker"

const getStore = async (slug: string) => {
    const store = await prisma.user.findUnique({
        where: { slug },
        include: {
            business: true,
            location: {
                include: {
                    city: true
                }
            },
            products: {
                where: { is_active: true },
                orderBy: { title: 'asc' }
            },
            plan: true
        }
    })

    if (!store) return null

    return {
        ...store,
        products: store.products.map(p => ({
            ...p,
            price: Number(p.price),
            promo_price: p.promo_price ? Number(p.promo_price) : null
        }))
    }
}

export default async function StorePage({ params }: { params: Promise<{ citySlug: string, storeSlug: string }> }) {
    const { citySlug, storeSlug } = await params
    const store = await getStore(storeSlug)

    if (!store) {
        notFound()
    }

    if (store.blocked) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Loja Indisponível</h1>
                <p className="text-gray-600 mt-2 max-w-md">
                    Esta loja está temporariamente indisponível por violar nossos termos de uso ou por solicitação do proprietário.
                </p>
            </div>
        )
    }

    if (!store.emailVerified) {
        notFound()
    }

    const storeStatus = getStoreStatus(store.business?.schedule ?? null)
    const isOpen = storeStatus.isOpen

    if (store.products.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Store className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-700">Loja em construção</h1>
                <p className="text-gray-500 mt-2">Volte mais tarde!</p>
            </div>
        )
    }

    const reportMessage = encodeURIComponent(`Olá, gostaria de denunciar a loja ${store.name} (Slug: ${storeSlug}). Motivo: ...`)
    const reportLink = `https://wa.me/5547999327137?text=${reportMessage}`

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <ViewTracker slug={storeSlug} />
            <LiveTracker slug={storeSlug} />

            {/* Store Header */}
            <header className="bg-white shadow-sm">
                <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="container mx-auto px-4 -mt-12 pb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                        <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
                            {store.logo_url ? (
                                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                            ) : (
                                <Store className="w-10 h-10 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold">{store.name}</h1>
                                {store.verified && store.plan?.plan === 'PRO' && (
                                    <div className="relative group">
                                        <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-100" />
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            Loja Verificada
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-muted-foreground">{store.description}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-start md:items-end">
                            <div className="flex gap-2">
                                <Badge variant={isOpen ? "default" : "destructive"} className="text-sm px-3 py-1">
                                    {isOpen ? "Aberto" : "Fechado"}
                                </Badge>
                                {(() => {
                                    const mode = store.business?.consumption_mode
                                    if (!mode) return null

                                    // Check for JSON array (Service modes)
                                    if (mode.startsWith("[")) {
                                        try {
                                            const modes = JSON.parse(mode)
                                            return (
                                                <>
                                                    {modes.includes("ONLINE") && (
                                                        <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-700">
                                                            Atendimento Online
                                                        </Badge>
                                                    )}
                                                    {modes.includes("IN_PERSON") && (
                                                        <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-100 text-green-700">
                                                            Presencial
                                                        </Badge>
                                                    )}
                                                    {modes.includes("HOME") && (
                                                        <Badge variant="secondary" className="text-sm px-3 py-1 bg-purple-100 text-purple-700">
                                                            A Domicílio
                                                        </Badge>
                                                    )}
                                                </>
                                            )
                                        } catch (e) {
                                            return null
                                        }
                                    }

                                    // Legacy/Food/Retail modes
                                    return (
                                        <>
                                            {(mode === "DELIVERY" || mode === "BOTH") && (
                                                <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-100 text-blue-700">
                                                    Entrega Rápida
                                                </Badge>
                                            )}
                                            {(mode === "PICKUP" || mode === "BOTH") && (
                                                <Badge variant="secondary" className="text-sm px-3 py-1 bg-orange-100 text-orange-700">
                                                    Retirada
                                                </Badge>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground gap-1">
                                <Clock className="w-4 h-4" />
                                {storeStatus.message}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground gap-1 text-right">
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span>
                                    {store.business?.consumption_mode === "DELIVERY" ? (
                                        store.location?.city.name
                                    ) : (
                                        store.location?.address_text ? (
                                            store.location.address_text.replace(/ - CEP:.*$/, "").replace(/CEP:.*$/, "")
                                        ) : (
                                            store.location?.city.name
                                        )
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Products */}
            <main className="container mx-auto py-8 px-4">
                <h2 className="text-2xl font-bold mb-6">Menu</h2>
                <ProductGrid
                    products={store.products}
                    store={store}
                />
            </main>

            {/* Footer / Report */}
            <footer className="container mx-auto py-8 px-4 text-center border-t mt-8">
                <a
                    href={reportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs text-gray-400 hover:text-red-500 transition-colors gap-1"
                >
                    <Flag className="w-3 h-3" />
                    Denunciar Loja
                </a>
            </footer>

            {/* Free Plan Branding */}
            {(!store.plan || store.plan.plan === 'FREE') && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4 text-center text-sm shadow-lg z-40 md:static md:shadow-none md:border-t-0 md:bg-transparent md:pb-8">
                    <p className="text-muted-foreground">
                        Crie seu cardápio digital grátis no <Link href="/?utm_source=store_footer" className="font-bold text-primary hover:underline">ZapVitrine</Link>
                    </p>
                </div>
            )}
        </div>
    )
}
