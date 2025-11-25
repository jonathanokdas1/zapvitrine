import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Store, Clock, MapPin } from "lucide-react"
import { ProductGrid } from "@/components/product/product-grid"

const prisma = new PrismaClient()

async function getStore(slug: string) {
    return await prisma.user.findUnique({
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
}

export default async function StorePage({ params }: { params: Promise<{ storeSlug: string }> }) {
    const { storeSlug } = await params
    const store = await getStore(storeSlug)

    if (!store) {
        notFound()
    }

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
                            <Badge variant={store.business?.is_open ? "default" : "destructive"} className="text-sm px-3 py-1">
                                {store.business?.is_open ? "Open Now" : "Closed"}
                            </Badge>
                            <div className="flex items-center text-sm text-muted-foreground gap-1">
                                <Clock className="w-4 h-4" />
                                {store.business?.opening_hours}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground gap-1">
                                <MapPin className="w-4 h-4" />
                                {store.location?.address_text}, {store.location?.city.name}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Products */}
            <main className="container mx-auto py-8 px-4">
                <h2 className="text-2xl font-bold mb-6">Menu</h2>
                <ProductGrid products={store.products} store={store} />
            </main>
        </div>
    )
}
