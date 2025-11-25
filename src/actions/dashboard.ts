"use server"

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

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

    return {
        views: user.views,
        clicks_whatsapp: user.clicks_whatsapp,
        active_products: user.products.filter(p => p.is_active).length,
        plan: user.plan?.plan || "FREE",
        name: user.name
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

    revalidatePath("/admin/settings")
    revalidatePath("/admin")
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

    revalidatePath("/admin/products")
    revalidatePath("/admin/products")
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

    revalidatePath("/admin/products")
}
