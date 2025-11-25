"use client"

import * as React from "react"
import { ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { useCart } from "./cart-context"
import { formatCurrency } from "@/lib/utils"
import { createWhatsAppMessage, getWhatsAppLink } from "@/lib/whatsapp"

export function CartSheet() {
    const { items, removeFromCart, total, clearCart } = useCart()
    const [address, setAddress] = React.useState("")
    const [name, setName] = React.useState("")
    const [isOpen, setIsOpen] = React.useState(false)

    React.useEffect(() => {
        const savedAddress = localStorage.getItem('zapvitrine-address')
        const savedName = localStorage.getItem('zapvitrine-name')
        if (savedAddress) setAddress(savedAddress)
        if (savedName) setName(savedName)
    }, [])

    const handleCheckout = () => {
        if (!address) {
            alert("Please enter your address")
            return
        }

        localStorage.setItem('zapvitrine-address', address)
        localStorage.setItem('zapvitrine-name', name)

        const order = {
            storeName: items[0].storeName,
            storePhone: items[0].storePhone,
            items: items,
            total: total,
            address: address,
            customerName: name
        }

        const message = createWhatsAppMessage(order)
        const link = getWhatsAppLink(items[0].storePhone, message)

        window.open(link, '_blank')
        clearCart()
        setIsOpen(false)
    }

    if (items.length === 0) return null

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-xl z-50" size="icon">
                    <ShoppingCart className="h-6 w-6" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {items.length}
                    </span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>Your Order ({items[0].storeName})</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start border-b pb-4">
                            <div>
                                <p className="font-medium">{item.quantity}x {item.title}</p>
                                {item.variants.length > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        {item.variants.join(", ")}
                                    </p>
                                )}
                                <p className="text-sm font-medium mt-1">
                                    {formatCurrency(item.price * item.quantity)}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                        <Label htmlFor="name">Your Name (Optional)</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Delivery Address</Label>
                        <Input
                            id="address"
                            placeholder="Street, Number, Neighborhood"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(total)}</span>
                    </div>

                    <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700" onClick={handleCheckout}>
                        Send to WhatsApp
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
