"use client"

import * as React from "react"
import { User } from "@prisma/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { VariantSelector, Variant } from "./variant-selector"
import { useCart } from "@/components/cart/cart-context"
import { Plus, Minus } from "lucide-react"

interface Product {
    id: string
    title: string
    description: string | null
    price: number
    promo_price: number | null
    images: string | null
    variants: string | null
}

interface ProductGridProps {
    products: Product[]
    store: User
}

export function ProductGrid({ products, store }: ProductGridProps) {
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
    const [isModalOpen, setIsModalOpen] = React.useState(false)
    const [quantity, setQuantity] = React.useState(1)
    const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string | string[]>>({})
    const [observation, setObservation] = React.useState("")

    const { addToCart } = useCart()

    const handleOpenProduct = (product: Product) => {
        setSelectedProduct(product)
        setQuantity(1)
        setSelectedOptions({})
        setObservation("")
        setIsModalOpen(true)
    }

    const handleOptionChange = (variantName: string, optionLabel: string, isMulti: boolean, isChecked?: boolean) => {
        setSelectedOptions(prev => {
            if (isMulti) {
                const current = (prev[variantName] as string[]) || []
                if (isChecked) {
                    return { ...prev, [variantName]: [...current, optionLabel] }
                } else {
                    return { ...prev, [variantName]: current.filter(l => l !== optionLabel) }
                }
            } else {
                return { ...prev, [variantName]: optionLabel }
            }
        })
    }

    const calculateTotal = () => {
        if (!selectedProduct) return 0
        let total = selectedProduct.price

        // Parse variants safely
        let variants: Variant[] = []
        try {
            variants = JSON.parse(selectedProduct.variants as string)
        } catch (e) {
            variants = []
        }

        variants.forEach(v => {
            const selected = selectedOptions[v.name]
            if (!selected) return

            if (Array.isArray(selected)) {
                selected.forEach(label => {
                    const opt = v.options.find(o => o.label === label)
                    if (opt) total += opt.price
                })
            } else {
                const opt = v.options.find(o => o.label === selected)
                if (opt) total += opt.price
            }
        })

        return total * quantity
    }

    const handleAddToCart = () => {
        if (!selectedProduct) return

        // Validate required selections
        let variants: Variant[] = []
        try {
            variants = JSON.parse(selectedProduct.variants as string)
        } catch (e) {
            variants = []
        }

        for (const v of variants) {
            if (v.type === "SELECT" && !selectedOptions[v.name]) {
                alert(`Por favor selecione uma opção de ${v.name}`)
                return
            }
        }

        // Format variants string for cart
        const variantDetails: string[] = []
        Object.entries(selectedOptions).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                if (value.length > 0) variantDetails.push(`${key}: ${value.join(", ")}`)
            } else {
                variantDetails.push(`${key}: ${value}`)
            }
        })

        if (observation) {
            variantDetails.push(`Obs: ${observation}`)
        }

        addToCart({
            id: `${selectedProduct.id}-${Date.now()}`,
            productId: selectedProduct.id,
            title: selectedProduct.title,
            price: calculateTotal() / quantity,
            quantity,
            variants: variantDetails,
            storeId: store.id,
            storeName: store.name,
            storePhone: store.phone || "",
            storeType: store.store_type || "RETAIL"
        })

        setIsModalOpen(false)
    }

    const getButtonText = () => {
        if (store.store_type === "SERVICE") return "Solicitar Horário"
        if (store.store_type === "FOOD") return "Fazer Pedido"
        return "Adicionar à Sacola"
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
                                {store.store_type === "SERVICE" ? "Agendar" : "Adicionar"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    {selectedProduct && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedProduct.title}</DialogTitle>
                                <p className="text-muted-foreground">{selectedProduct.description}</p>
                            </DialogHeader>

                            <div className="py-4 space-y-6">
                                {selectedProduct.variants && (
                                    <VariantSelector
                                        variants={JSON.parse(selectedProduct.variants as string)}
                                        selectedOptions={selectedOptions}
                                        onOptionChange={handleOptionChange}
                                    />
                                )}

                                <div className="space-y-2">
                                    <Label>Observações</Label>
                                    <Textarea
                                        placeholder="Ex: Sem cebola, capricha no molho..."
                                        value={observation}
                                        onChange={(e) => setObservation(e.target.value)}
                                    />
                                </div>
                            </div>

                            <DialogFooter className="flex-col sm:flex-col gap-4 sticky bottom-0 bg-white pt-4 border-t">
                                <div className="flex items-center justify-between w-full mb-2">
                                    <div className="flex items-center gap-3 border rounded-md p-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="font-bold w-4 text-center">{quantity}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => setQuantity(quantity + 1)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-xl font-bold">
                                        {formatCurrency(calculateTotal())}
                                    </div>
                                </div>
                                <Button className="w-full h-12 text-lg" onClick={handleAddToCart}>
                                    {getButtonText()}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )

}
