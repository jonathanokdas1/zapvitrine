"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"
import { ProductDetails } from "./product-details"
import { User, Business, Location, City } from "@prisma/client"

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

interface ProductModalProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
    store: StoreWithBusiness
}

export function ProductModal({ product, isOpen, onClose, store }: ProductModalProps) {
    const isDesktop = useMediaQuery("(min-width: 768px)")

    if (!product) return null

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{product.title}</DialogTitle>
                    </DialogHeader>
                    <ProductDetails product={product} store={store} onClose={onClose} />
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="h-[90vh]">
                <DrawerHeader className="sr-only">
                    <DrawerTitle>{product.title}</DrawerTitle>
                </DrawerHeader>
                <ProductDetails product={product} store={store} onClose={onClose} />
            </DrawerContent>
        </Drawer>
    )
}
