"use server"

import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"

export async function registerHeartbeat(storeSlug: string, visitorId: string) {
    if (!storeSlug || !visitorId) return

    const key = `live:${storeSlug}:${visitorId}`

    // Define a chave com expiração de 60 segundos
    // Isso gerencia efetivamente a "janela ativa"
    await redis.set(key, "1", "EX", 60)
}

export async function getOnlineCount(storeSlug: string) {
    if (!storeSlug) return 0

    // Conta as chaves que correspondem ao padrão para esta loja
    // Nota: Em produção com muitas chaves, SCAN é preferível a KEYS
    // Mas para este MVP, KEYS é aceitável
    const keys = await redis.keys(`live:${storeSlug}:*`)

    return keys.length
}

export async function trackStoreView(slug: string) {
    const user = await prisma.user.findUnique({ where: { slug } })
    if (!user) return

    // Increment total views
    await prisma.user.update({
        where: { id: user.id },
        data: { views: { increment: 1 } }
    })

    // Increment daily views
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    await prisma.analyticsDay.upsert({
        where: {
            date_userId: {
                date: today,
                userId: user.id
            }
        },
        create: {
            date: today,
            userId: user.id,
            views: 1
        },
        update: {
            views: { increment: 1 }
        }
    })
}

export async function trackWhatsAppClick(slug: string, cartValue: number = 0) {
    const user = await prisma.user.findUnique({ where: { slug } })
    if (!user) return

    // Increment total clicks
    await prisma.user.update({
        where: { id: user.id },
        data: { clicks_whatsapp: { increment: 1 } }
    })

    // Increment daily clicks and revenue potential
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    await prisma.analyticsDay.upsert({
        where: {
            date_userId: {
                date: today,
                userId: user.id
            }
        },
        create: {
            date: today,
            userId: user.id,
            clicks: 1,
            revenue_potential: cartValue
        },
        update: {
            clicks: { increment: 1 },
            revenue_potential: { increment: cartValue }
        }
    })
}

export async function trackAddToCart(slug: string) {
    const user = await prisma.user.findUnique({ where: { slug } })
    if (!user) return

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    await prisma.analyticsDay.upsert({
        where: {
            date_userId: {
                date: today,
                userId: user.id
            }
        },
        create: {
            date: today,
            userId: user.id,
            cart_adds: 1
        },
        update: {
            cart_adds: { increment: 1 }
        }
    })
}

export async function trackProductView(productId: string) {
    // Increment product views
    await prisma.product.update({
        where: { id: productId },
        data: { views: { increment: 1 } }
    })
}
