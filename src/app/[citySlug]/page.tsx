import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { STORE_CATEGORIES } from "@/config/categories"
import { Store, MapPin } from "lucide-react"
import { ChangeCityButton } from "@/components/change-city-button"
import { checkStoreOpen } from "@/lib/utils"

const prisma = new PrismaClient()

export default async function CityPage({ params, searchParams }: { params: Promise<{ citySlug: string }>, searchParams: Promise<{ type?: string }> }) {
    const { citySlug } = await params
    const { type } = await searchParams

    const city = await prisma.city.findUnique({
        where: { slug: citySlug },
        include: {
            locations: {
                include: {
                    user: {
                        include: {
                            business: true
                        }
                    }
                }
            }
        }
    })

    if (!city) {
        return <div>Cidade não encontrada</div>
    }

    let stores = city.locations.map(loc => loc.user)

    if (type) {
        stores = stores.filter(store => store.store_type === type)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="font-bold text-xl text-primary">ZapVitrine</Link>
                        <span className="text-gray-300">|</span>
                        <span className="font-medium">{city.name}</span>
                    </div>
                    <ChangeCityButton />
                </div>
                <div className="container mx-auto px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                    <Link href={`/${citySlug}`}>
                        <Badge variant={!type ? "default" : "outline"} className="cursor-pointer">
                            Todos
                        </Badge>
                    </Link>
                    {STORE_CATEGORIES.map(cat => (
                        <Link key={cat.type} href={`/${citySlug}?type=${cat.type}`}>
                            <Badge variant={type === cat.type ? "default" : "outline"} className="cursor-pointer">
                                {cat.label}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Lojas em {city.name}</h1>

                {stores.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Nenhuma loja encontrada nesta categoria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map(store => {
                            const isOpen = store.business?.is_open && checkStoreOpen(store.business?.schedule)
                            return (
                                <Link key={store.id} href={`/${citySlug}/${store.slug}`} className="block group">
                                    <div className="bg-white rounded-lg border p-4 flex items-center gap-4 transition-all hover:shadow-md">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                            {store.logo_url ? (
                                                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl font-bold text-gray-400">{store.name[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                                                {store.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {store.description || "Sem descrição"}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {isOpen ? (
                                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-100">
                                                        Aberto
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 hover:bg-red-100">
                                                        Fechado
                                                    </Badge>
                                                )}
                                                {store.category_slug && (
                                                    <span className="text-xs text-muted-foreground border px-1.5 py-0.5 rounded flex items-center gap-1">
                                                        {(() => {
                                                            const allItems = (STORE_CATEGORIES as any).flatMap((c: any) => c.items);
                                                            const item = allItems.find((i: any) => i.value === store.category_slug);
                                                            return item ? <>{item.icon} {item.label}</> : null;
                                                        })()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
