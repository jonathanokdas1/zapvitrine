"use client"

import * as React from "react"
import { User, Business, Location, City } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import { VariantSelector, Variant } from "./variant-selector"
import { useCart } from "@/contexts/cart-context"
import { Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

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

interface ProductDetailsProps {
    product: Product
    store: StoreWithBusiness
    onClose: () => void
}

export function ProductDetails({ product, store, onClose }: ProductDetailsProps) {
    const [quantity, setQuantity] = React.useState(1)
    const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string | string[]>>({})
    const [observation, setObservation] = React.useState("")
    const [isVariantValid, setIsVariantValid] = React.useState(true)
    const { addItem } = useCart()

    const handleOptionChange = (variantName: string, optionLabel: string, isMulti: boolean, isChecked?: boolean) => {
        if (optionLabel === "__CLEAR__") {
            setSelectedOptions(prev => {
                const newOptions = { ...prev }
                delete newOptions[variantName]
                return newOptions
            })
            return
        }

        setSelectedOptions(prev => {
            if (isMulti) {
                const current = Array.isArray(prev[variantName])
                    ? (prev[variantName] as string[])
                    : (prev[variantName] ? [prev[variantName] as string] : [])

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
        let total = product.price

        let variants: Variant[] = []
        try {
            variants = JSON.parse(product.variants as string)
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
        let variants: Variant[] = []
        try {
            variants = JSON.parse(product.variants as string)
        } catch (e) {
            variants = []
        }

        const isValid = variants.every(variant => {
            const selected = selectedOptions[variant.name]
            const min = variant.min_selection || 0

            if (min === 0) return true

            if (!selected) return false
            if (Array.isArray(selected)) {
                return selected.length >= min
            }
            return true
        })

        if (!isValid) {
            toast.warning("Por favor, verifique as opções selecionadas.")
            return
        }

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

        addItem({
            id: `${product.id}-${Date.now()}`,
            productId: product.id,
            title: product.title,
            price: calculateTotal() / quantity,
            quantity,
            selected_variants: variantDetails,
            storeId: store.id,
            storeName: store.name,
            storeSlug: store.slug,
            storePhone: store.phone || "",
            storeType: (store.business?.category as "PRODUCT" | "SERVICE") || "RETAIL",
            storeCity: store.location?.city.name,
            storePlan: (store.plan?.plan as "FREE" | "PRO") || "FREE",
            isService: product.is_service
        })

        onClose()
    }

    const getButtonText = () => {
        if (product.is_service) return "Agendar"
        if (store.business?.category === "SERVICE") return "Solicitar Horário"
        if (store.business?.category === "FOOD") return "Fazer Pedido"
        return "Adicionar à Sacola"
    }

    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
    const [isHovered, setIsHovered] = React.useState(false)

    // Parse images safely
    let images: string[] = []
    try {
        images = JSON.parse(product.images as string)
    } catch (e) {
        images = []
    }

    // Smart Auto-Scroll
    React.useEffect(() => {
        if (images.length <= 1 || isHovered) return

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length)
        }, 5000) // 5 seconds

        return () => clearInterval(interval)
    }, [images.length, isHovered])

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="flex flex-col h-full">
            {/* Image Section */}
            <div
                className="relative w-full aspect-[4/3] bg-gray-100 rounded-t-lg overflow-hidden shrink-0 group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {images.length > 0 ? (
                    <>
                        <div
                            className="flex h-full transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                        >
                            {images.map((url, index) => (
                                <div key={index} className="w-full h-full shrink-0">
                                    <img
                                        src={url}
                                        alt={`${product.title} - Imagem ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>

                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage() }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage() }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                    {images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "bg-white w-3" : "bg-white/50"}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sem Imagem
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                <div>
                    <h2 className="text-2xl font-bold">{product.title}</h2>
                    <p className="text-muted-foreground mt-2">{product.description}</p>
                </div>

                {product.variants && (
                    <VariantSelector
                        variants={JSON.parse(product.variants as string)}
                        selectedOptions={selectedOptions}
                        onOptionChange={handleOptionChange}
                        onValidationChange={setIsVariantValid}
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

            {/* Footer Section */}
            <div className="p-4 border-t bg-white sticky bottom-0">
                <div className="flex items-center justify-between w-full mb-4">
                    {!product.is_service && (
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
                    )}
                    <div className="text-xl font-bold ml-auto">
                        {formatCurrency(calculateTotal())}
                    </div>
                </div>
                <Button className="w-full h-12 text-lg" onClick={handleAddToCart} disabled={!isVariantValid}>
                    {getButtonText()}
                </Button>
            </div>
        </div>
    )
}
