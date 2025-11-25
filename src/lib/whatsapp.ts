export interface CartItem {
    title: string
    quantity: number
    price: number
    variants?: string[]
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

    let message = `*New Order for ${storeName}*\n\n`

    if (customerName) {
        message += `Customer: ${customerName}\n`
    }
    message += `Address: ${address}\n\n`

    message += `*Items:*\n`
    items.forEach(item => {
        message += `${item.quantity}x ${item.title}`
        if (item.variants && item.variants.length > 0) {
            message += ` (${item.variants.join(', ')})`
        }
        message += `\n`
    })

    message += `\n*Total: R$ ${(total / 100).toFixed(2).replace('.', ',')}*`

    return encodeURIComponent(message)
}

export function getWhatsAppLink(phone: string, message: string): string {
    // Remove non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '')
    return `https://wa.me/${cleanPhone}?text=${message}`
}
