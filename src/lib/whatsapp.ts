import { formatCurrency } from "@/lib/utils"

export interface CartItem {
    title: string
    quantity: number
    price: number
    variants?: string[]
    storeType?: string
    isService?: boolean
}

export interface OrderDetails {
    storeName: string
    storePhone: string
    items: CartItem[]
    total: number
    address: string
    customerName?: string
}

export function createWhatsAppMessage(order: OrderDetails): string {
    const { storeName, items, total, address, customerName } = order

    // Check if any item is a service or if store type is service
    const hasService = items.some(item => item.isService || item.storeType === "SERVICE")

    let message = `*${hasService ? "Novo Agendamento" : "Novo Pedido"} para ${storeName}*\n\n`

    if (customerName) {
        message += `Cliente: ${customerName}\n`
    }
    message += `Endereço: ${address}\n\n`

    message += `*${hasService ? "Serviços/Itens" : "Itens"}:*\n`
    items.forEach(item => {
        message += `${item.quantity}x ${item.title}`
        if (item.variants && item.variants.length > 0) {
            message += ` (${item.variants.join(', ')})`
        }
        message += `\n`
    })

    message += `\n*Total: ${formatCurrency(total)}*`

    return encodeURIComponent(message)
}

export function getWhatsAppLink(phone: string, message: string): string {
    // Remove non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '')
    return `https://wa.me/${cleanPhone}?text=${message}`
}
