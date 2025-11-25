"use server"

import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"
import { z } from "zod"

const prisma = new PrismaClient()

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    storeName: z.string().min(3),
    storeSlug: z.string().min(3).regex(/^[a-z0-9-]+$/),
    cityId: z.string().min(1),
    phone: z.string().min(10),
    document: z.string().min(11),
})

export async function registerStore(prevState: any, formData: FormData) {
    const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        storeName: formData.get("storeName"),
        storeSlug: formData.get("storeSlug"),
        cityId: formData.get("cityId"),
        phone: formData.get("phone"),
        document: formData.get("document"),
    }

    const result = registerSchema.safeParse(data)

    if (!result.success) {
        return { error: "Dados inválidos. Verifique todos os campos." }
    }

    const { name, email, password, storeName, storeSlug, cityId, phone, document } = result.data

    try {
        // Check if email or slug exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { slug: storeSlug }
                ]
            }
        })

        if (existingUser) {
            return { error: "Email ou Link da Loja já existem." }
        }

        await prisma.user.create({
            data: {
                email,
                password_hash: password, // In real app, hash this!
                name: storeName,
                slug: storeSlug,
                phone,
                document,
                plan: {
                    create: { plan: "FREE" }
                },
                location: {
                    create: {
                        address_text: "Endereço não definido",
                        cityId
                    }
                },
                business: {
                    create: {
                        category: "RETAIL",
                        is_open: false
                    }
                },
                metrics: {
                    create: { views_count: 0 }
                }
            }
        })

    } catch (e) {
        console.error(e)
        return { error: "Algo deu errado. Tente novamente." }
    }

    redirect("/admin")
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        return { error: "Preencha todos os campos." }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || user.password_hash !== password) {
            return { error: "Email ou senha inválidos." }
        }

        // In a real app, set a session cookie here.
        // For MVP, we just redirect.

    } catch (error) {
        console.error(error)
        return { error: "Erro ao fazer login." }
    }

    redirect("/admin")
}

export async function createProduct(formData: FormData) {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string) * 100 // Convert to cents
    const promo_price = formData.get("promo_price") ? parseFloat(formData.get("promo_price") as string) * 100 : null
    const images = formData.get("images") as string
    const variants = formData.get("variants") as string

    // Mock user ID for MVP
    const user = await prisma.user.findFirst()
    if (!user) throw new Error("No user found")

    await prisma.product.create({
        data: {
            title,
            description,
            price,
            promo_price,
            images,
            variants,
            userId: user.id
        }
    })
}
