"use client"

import React, { createContext, useContext, useEffect, useReducer } from 'react'

export interface CartItem {
    id: string
    productId: string
    title: string
    price: number
    quantity: number
    selected_variants: string[]
    storeId: string
    storeName: string
    storeSlug?: string
    storeCity?: string
    storePhone: string
    storeType?: "PRODUCT" | "SERVICE"
    storePlan?: "FREE" | "PRO"
    isService?: boolean
}

interface CartState {
    items: CartItem[]
    isOpen: boolean
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' }
    | { type: 'SET_CART'; payload: CartItem[] }

const initialState: CartState = {
    items: [],
    isOpen: false
}

// ... (imports)
import { toast } from "sonner"

// ... (imports)

// ... (interfaces)

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const newItem = action.payload
            // Reducer should just add. Validation/Confirmation happens before dispatch.
            // If we are here, it means we are safe to add (or replace if logic dictates, but we clear first)
            return { ...state, items: [...state.items, newItem], isOpen: true }
        }
        // ... (other cases)
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter(item => item.id !== action.payload) }
        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                )
            }
        case 'CLEAR_CART':
            return { ...state, items: [] }
        case 'TOGGLE_CART':
            return { ...state, isOpen: !state.isOpen }
        case 'SET_CART':
            return { ...state, items: action.payload }
        default:
            return state
    }
}

interface CartContextType {
    state: CartState
    addItem: (item: CartItem) => void
    removeItem: (itemId: string) => void
    updateQuantity: (itemId: string, quantity: number) => void
    clearCart: () => void
    toggleCart: () => void
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState)

    // ... (useEffect for localStorage)

    const addItem = (item: CartItem) => {
        // Check if adding from a different store
        if (state.items.length > 0 && state.items[0].storeId !== item.storeId) {
            toast.warning(`Sua sacola tem itens de ${state.items[0].storeName}`, {
                description: `Deseja limpar a sacola para adicionar itens de ${item.storeName}?`,
                action: {
                    label: "Limpar e Adicionar",
                    onClick: () => {
                        dispatch({ type: 'CLEAR_CART' })
                        dispatch({ type: 'ADD_ITEM', payload: item })
                        toast.success("Sacola atualizada!")
                    }
                },
                cancel: {
                    label: "Cancelar",
                    onClick: () => { }
                }
            })
            return
        }

        dispatch({ type: 'ADD_ITEM', payload: item })
        toast.success("Item adicionado à sacola!")
    }

    const removeItem = (itemId: string) => dispatch({ type: 'REMOVE_ITEM', payload: itemId })
    const updateQuantity = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    const clearCart = () => dispatch({ type: 'CLEAR_CART' })
    const toggleCart = () => dispatch({ type: 'TOGGLE_CART' })

    const total = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    return (
        <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, toggleCart, total }}>
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
