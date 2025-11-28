"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getUserId() {
    const session = await getSession()
    if (!session) return null
    return session.userId
}

export async function getDashboardMetrics() {
    const userId = await getUserId()
    if (!userId) return null

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            products: true,
            plan: true,
        }
    })

    if (!user) return null

    // Get last 7 days analytics
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setUTCHours(0, 0, 0, 0)
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)

    const analytics = await prisma.analyticsDay.findMany({
        where: {
            userId: userId,
            date: {
                gte: sevenDaysAgo
            }
        },
        orderBy: {
            date: 'asc'
        }
    })

    // Get top products
    const topProducts = await prisma.product.findMany({
        where: {
            userId: userId,
            is_active: true
        },
        orderBy: {
            views: 'desc'
        },
        take: 5
    })

    // Generate last 7 days array
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setUTCHours(0, 0, 0, 0)
        d.setUTCDate(d.getUTCDate() - (6 - i))
        return d
    })

    const chartData = last7Days.map(date => {
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })
        // Find matching analytics for this day
        // Note: We need to compare dates carefully. The analytics dates from DB are at 00:00:00.
        // Our generated dates should also be compared by day/month/year.

        const dayAnalytics = analytics.find(a => {
            return a.date.getUTCDate() === date.getUTCDate() &&
                a.date.getUTCMonth() === date.getUTCMonth() &&
                a.date.getUTCFullYear() === date.getUTCFullYear()
        })

        return {
            date: dateStr,
            views: dayAnalytics?.views || 0,
            clicks: dayAnalytics?.clicks || 0,
            revenue: (dayAnalytics?.revenue_potential || 0) / 100
        }
    })

    return {
        views: user.views,
        clicks_whatsapp: user.clicks_whatsapp,
        active_products: user.products.filter(p => p.is_active).length,
        plan: user.plan?.plan || "FREE",
        name: user.name,
        analytics: chartData,
        topProducts: topProducts.map(p => ({
            id: p.id,
            title: p.title,
            views: p.views,
            price: Number(p.price)
        })),
        verified: user.verified,
        slug: user.slug,
        revenue_potential: analytics.reduce((acc, curr) => acc + curr.revenue_potential, 0),
        cart_adds: analytics.reduce((acc, curr) => acc + curr.cart_adds, 0)
    }
}

export async function updateSettings(formData: FormData) {
    const userId = await getUserId()
    if (!userId) throw new Error("User not found")

    const logo_url = formData.get("logo_url") as string
    const phone = formData.get("phone") as string
    const description = formData.get("description") as string
    const opening_hours = formData.get("opening_hours") as string
    const category = formData.get("category") as string

    await prisma.user.update({
        where: { id: userId },
        data: {
            logo_url,
            phone,
            description,
            opening_hours,
            category
        }
    })

    revalidatePath("/painel/configuracao")
    revalidatePath("/painel")
}

export async function deleteProduct(productId: string) {
    const userId = await getUserId()
    if (!userId) throw new Error("User not found")

    const product = await prisma.product.findUnique({
        where: { id: productId }
    })

    if (!product) throw new Error("Product not found")

    if (product.userId !== userId) {
        throw new Error("Unauthorized")
    }

    await prisma.product.delete({
        where: { id: productId }
    })

    revalidatePath("/painel/produtos")
    revalidatePath("/painel/produtos")
}

export async function toggleProductStatus(productId: string, isActive: boolean) {
    const userId = await getUserId()
    if (!userId) throw new Error("User not found")

    const product = await prisma.product.findUnique({
        where: { id: productId }
    })

    if (!product) throw new Error("Product not found")

    if (product.userId !== userId) {
        throw new Error("Unauthorized")
    }

    await prisma.product.update({
        where: { id: productId },
        data: { is_active: isActive }
    })

    revalidatePath("/painel/produtos")
}

export async function upgradeToPro() {
    const userId = await getUserId()
    if (!userId) throw new Error("User not found")

    await prisma.plan.upsert({
        where: { userId },
        update: { plan: 'PRO' },
        create: { userId, plan: 'PRO' }
    })

    revalidatePath("/painel")
    revalidatePath("/painel/planos")
}

export async function downgradeToFree() {
    const userId = await getUserId()
    if (!userId) throw new Error("User not found")

    await prisma.plan.upsert({
        where: { userId },
        update: { plan: 'FREE' },
        create: { userId, plan: 'FREE' }
    })

    revalidatePath("/painel")
    revalidatePath("/painel/planos")
}
