import { formatCurrency } from "@/lib/utils"

export interface CartItem {
    title: string
    quantity: number
    price: number
    variants?: string[]
    storeType?: string
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
    const isService = items[0]?.storeType === "SERVICE"

    let message = `*${isService ? "Novo Agendamento" : "Novo Pedido"} para ${storeName}*\n\n`

    if (customerName) {
        message += `Cliente: ${customerName}\n`
    }
    message += `Endereço: ${address}\n\n`

    message += `*${isService ? "Serviços" : "Itens"}:*\n`
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
