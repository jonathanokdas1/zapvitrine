"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
    id: string
    productId: string
    title: string
    price: number
    quantity: number
    variants: string[]
    storeId: string
    storeName: string
    storePhone: string
}

interface CartContextType {
    items: CartItem[]
    addToCart: (item: CartItem) => void
    removeFromCart: (itemId: string) => void
    clearCart: () => void
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('zapvitrine-cart')
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse cart", e)
            }
        }
        setIsLoaded(true)
    }, [])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('zapvitrine-cart', JSON.stringify(items))
        }
    }, [items, isLoaded])

    const addToCart = (newItem: CartItem) => {
        setItems(prev => {
            // Check if adding from a different store
            if (prev.length > 0 && prev[0].storeId !== newItem.storeId) {
                if (!confirm(`Your cart contains items from ${prev[0].storeName}. Clear cart to add items from ${newItem.storeName}?`)) {
                    return prev
                }
                return [newItem]
            }
            return [...prev, newItem]
        })
    }

    const removeFromCart = (itemId: string) => {
        setItems(prev => prev.filter(item => item.id !== itemId))
    }

    const clearCart = () => {
        setItems([])
    }

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
