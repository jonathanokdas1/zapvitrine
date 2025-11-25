import { PrismaClient } from "@prisma/client"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, MapPin } from "lucide-react"

const prisma = new PrismaClient()

async function getCity(slug: string) {
    return await prisma.city.findUnique({
        where: { slug },
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
}

export default async function CityPage({ params }: { params: Promise<{ citySlug: string }> }) {
    const { citySlug } = await params
    const city = await getCity(citySlug)

    if (!city) {
        notFound()
    }

    const stores = city.locations.map(loc => loc.user).filter(user => user.business?.is_open)

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b py-8 px-4">
                <div className="container mx-auto">
                    <Link href="/" className="text-sm text-muted-foreground hover:underline mb-2 block">
                        ← Change City
                    </Link>
                    <h1 className="text-3xl font-bold">Stores in {city.name}</h1>
                </div>
            </header>

            <main className="container mx-auto py-12 px-4">
                {stores.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-xl text-gray-500">No stores found in this city yet.</h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stores.map((store) => (
                            <Link href={`/${store.slug}`} key={store.id} className="group">
                                <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-none shadow-md overflow-hidden">
                                    <div className="h-32 bg-gray-200 flex items-center justify-center relative">
                                        {store.logo_url ? (
                                            <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Store className="w-12 h-12 text-gray-400" />
                                        )}
                                        <Badge className="absolute top-3 right-3 bg-green-500">
                                            5.0 ★
                                        </Badge>
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                            {store.name}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {store.business?.category}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center text-sm text-muted-foreground gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {city.name}, {city.state}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
