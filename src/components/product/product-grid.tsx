"use client"

import * as React from "react"
import { User, Business, Location, City } from "@prisma/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/contexts/cart-context"
import { ProductModal } from "./product-modal"

interface Product {
    id: string
    title: string
    description: string | null
    price: number
    promo_price: number | null
    images: string | null
    variants: string | null
    is_service: boolean
}

interface StoreWithBusiness extends User {
    business: Business | null
    location: (Location & { city: City }) | null
    plan: { plan: string } | null
}

import { trackProductView, trackAddToCart } from "@/actions/analytics"
import { toast } from "sonner"

interface ProductGridProps {
    products: Product[]
    store: StoreWithBusiness
}

export function ProductGrid({ products, store }: ProductGridProps) {
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
    const [isModalOpen, setIsModalOpen] = React.useState(false)

    const handleOpenProduct = (product: Product) => {
        setSelectedProduct(product)
        setIsModalOpen(true)

        // Track view
        trackProductView(product.id)
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <Card
                        key={product.id}
                        className="cursor-pointer hover:shadow-md transition-shadow flex flex-col h-full"
                        onClick={() => handleOpenProduct(product)}
                    >
                        <div className="h-48 bg-gray-100 relative overflow-hidden rounded-t-xl">
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
                            {product.promo_price && (
                                <Badge className="absolute top-2 right-2 bg-red-500">Promo</Badge>
                            )}
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{product.title}</CardTitle>
                                <span className="font-bold text-green-600">
                                    {product.promo_price ? formatCurrency(product.promo_price) : formatCurrency(product.price)}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="secondary">
                                {product.is_service ? "Agendar" : (store.business?.category === "SERVICE" ? "Agendar" : "Adicionar")}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <ProductModal
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                store={store}
            />
        </>
    )

}
