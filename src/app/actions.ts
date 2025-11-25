"use server"

import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"
import { z } from "zod"
import { login as authLogin, getSession } from "@/lib/auth"

const prisma = new PrismaClient()

import { validateCPF } from "@/lib/validators"

const registerSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    storeName: z.string().min(3),
    storeSlug: z.string().min(3).regex(/^[a-z0-9-]+$/),
    cityId: z.string().min(1),
    phone: z.string().min(14), // (99) 9 9999-9999 is 16 chars, but min 14 covers basic
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

    // Validate CPF
    const cleanCPF = document.replace(/[^\d]+/g, '')
    if (!validateCPF(cleanCPF)) {
        return { error: "CPF inválido." }
    }

    try {
        // Check if email, slug or phone exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { slug: storeSlug },
                    { phone }
                ]
            }
        })

        if (existingUser) {
            if (existingUser.email === email) return { error: "Email já cadastrado." }
            if (existingUser.slug === storeSlug) return { error: "Link da loja já existe." }
            if (existingUser.phone === phone) return { error: "WhatsApp já cadastrado." }
            return { error: "Usuário já existe." }
        }

        const newUser = await prisma.user.create({
            data: {
                email,
                password_hash: password, // In real app, hash this!
                name: storeName,
                owner_name: name,
                slug: storeSlug,
                phone,
                document: cleanCPF, // Save clean CPF
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
                        is_open: true
                    }
                },
                metrics: {
                    create: { views_count: 0 }
                }
            }
        })

        // Login after register
        await authLogin(newUser.id)

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

        await authLogin(user.id)

    } catch (error) {
        console.error(error)
        return { error: "Erro ao fazer login." }
    }

    redirect("/admin")
}

export async function createProduct(formData: FormData) {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = BigInt(Math.round(parseFloat(formData.get("price") as string) * 100)) // Convert to cents BigInt
    const promo_price_raw = formData.get("promo_price")
    const promo_price = promo_price_raw ? BigInt(Math.round(parseFloat(promo_price_raw as string) * 100)) : null
    const images = formData.get("images") as string
    const variants = formData.get("variants") as string

    const session = await getSession()
    if (!session) redirect('/login')

    await prisma.product.create({
        data: {
            title,
            description,
            price,
            promo_price,
            images,
            variants,
            userId: session.userId
        }
    })

    redirect('/admin/products?success=true')
}

export async function updateProduct(formData: FormData) {
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const price = BigInt(Math.round(parseFloat(formData.get("price") as string) * 100))
    const promo_price_raw = formData.get("promo_price")
    const promo_price = promo_price_raw ? BigInt(Math.round(parseFloat(promo_price_raw as string) * 100)) : null
    const images = formData.get("images") as string
    const variants = formData.get("variants") as string

    const session = await getSession()
    if (!session) redirect('/login')

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product || product.userId !== session.userId) {
        throw new Error("Unauthorized")
    }

    await prisma.product.update({
        where: { id },
        data: {
            title,
            description,
            price,
            promo_price,
            images,
            variants
        }
    })

    redirect('/admin/products?success=true')
}
