import { PrismaClient } from "@prisma/client"
import { CityCombobox } from "@/components/city-combobox"
import Link from "next/link"
import { Store, MapPin, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const prisma = new PrismaClient()

async function getCities() {
    return await prisma.city.findMany({
        orderBy: { name: 'asc' }
    })
}

async function getFeaturedStores() {
    // Mock logic: fetch random stores. In real app, use metrics or ratings.
    return await prisma.user.findMany({
        where: {
            business: {
                is_open: true
            }
        },
        take: 6,
        include: {
            business: true,
            location: {
                include: {
                    city: true
                }
            }
        }
    })
}

export default async function Home() {
    const featuredStores = await getFeaturedStores()

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header / Hero */}
            <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20 px-4">
                <div className="container mx-auto flex flex-col items-center text-center">
                    <h1 className="text-5xl font-bold mb-6 tracking-tight">ZapVitrine</h1>
                    <p className="text-xl mb-8 max-w-2xl opacity-90">
                        Descubra as melhores lojas da sua cidade. Peça direto no WhatsApp.
                        Simples, rápido e sem taxas escondidas.
                    </p>

                    <div className="bg-white p-2 rounded-lg shadow-xl">
                        <CityCombobox />
                    </div>
                </div>
            </header>

            {/* Highlights Section */}
            <main className="flex-1 container mx-auto py-16 px-4">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                    <Star className="text-yellow-500 fill-yellow-500" />
                    Lojas em Destaque
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredStores.map((store) => (
                        <Link href={`/${store.slug}`} key={store.id} className="group">
                            <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-none shadow-md overflow-hidden">
                                <div className="h-32 bg-gray-100 flex items-center justify-center relative">
                                    {store.logo_url ? (
                                        <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Store className="w-12 h-12 text-gray-400" />
                                    )}
                                    <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
                                        5.0 ★
                                    </Badge>
                                </div>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                                {store.name}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {store.business?.category}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {store.location?.city.name}, {store.location?.city.state}
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t py-12">
                <div className="container mx-auto px-4 text-center text-gray-500">
                    <p className="mb-4">© 2024 ZapVitrine. Todos os direitos reservados.</p>
                    <div className="space-x-4">
                        <Link href="/register" className="text-sm hover:underline">
                            Cadastre sua loja
                        </Link>
                        <Link href="/login" className="text-sm hover:underline">
                            Login Vendedor
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
