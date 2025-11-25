import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Store, Clock, MapPin } from "lucide-react"
import { ProductGrid } from "@/components/product/product-grid"
import { checkStoreOpen } from "@/lib/utils"

async function getStore(slug: string) {
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
            }
        }
    })
    return store
}

export default async function StorePage({ params }: { params: Promise<{ citySlug: string, storeSlug: string }> }) {
    const { citySlug, storeSlug } = await params
    const store = await getStore(storeSlug)

    if (!store) {
        notFound()
    }

    const isOpen = store.business?.is_open && checkStoreOpen(store.business?.schedule)

    if (store.products.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Store className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-700">Store under construction</h1>
                <p className="text-gray-500 mt-2">Check back later!</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
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
                            <h1 className="text-3xl font-bold">{store.name}</h1>
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
                                {store.business?.opening_hours}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground gap-1 text-right">
                                <MapPin className="w-4 h-4 shrink-0" />
                                <span>
                                    {store.business?.consumption_mode === "DELIVERY" ? (
                                        store.location?.city.name
                                    ) : (
                                        store.location?.address_text ? (
                                            store.location.address_text.replace(/ - CEP: \d{5}-\d{3}/, "")
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
                    products={store.products.map(p => ({
                        ...p,
                        price: Number(p.price),
                        promo_price: p.promo_price ? Number(p.promo_price) : null
                    }))}
                    store={store}
                />
            </main>
        </div>
    )
}
