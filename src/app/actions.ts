"use server"

import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { login as authLogin, getSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

import { validateCPF } from "@/lib/validators"
import { sendVerificationEmail } from "@/lib/email"
import { emailQueue } from "@/lib/queue"
import crypto from "crypto"

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
                password_hash: await bcrypt.hash(password, 10),
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

        // Send verification email
        const token = crypto.randomBytes(32).toString("hex")
        await prisma.user.update({
            where: { id: newUser.id },
            data: { emailVerificationToken: token }
        })
        // await sendVerificationEmail(email, token)
        await emailQueue.add('verification', { type: 'verification', data: { email, token } })

    } catch (e) {
        console.error(e)
        return { error: "Algo deu errado. Tente novamente." }
    }

    redirect("/painel")
}

export async function verifyEmail(token: string) {
    const user = await prisma.user.findUnique({
        where: { emailVerificationToken: token }
    })

    if (!user) {
        return { error: "Token inválido ou expirado." }
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: new Date(),
            emailVerificationToken: null
        }
    })

    return { success: true }
}

export async function resendVerificationEmail() {
    const session = await getSession()
    if (!session) return { error: "Não autorizado" }

    const user = await prisma.user.findUnique({
        where: { id: session.userId }
    })

    if (!user) return { error: "Usuário não encontrado" }
    if (user.emailVerified) return { error: "Email já verificado" }

    const token = crypto.randomBytes(32).toString("hex")
    await prisma.user.update({
        where: { id: user.id },
        data: { emailVerificationToken: token }
    })

    // await sendVerificationEmail(user.email, token)
    await emailQueue.add('verification', { type: 'verification', data: { email: user.email, token } })
    return { success: true, message: "Email enviado!" }
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

        if (!user) {
            return { error: "Email ou senha inválidos." }
        }

        const isValid = await bcrypt.compare(password, user.password_hash)

        if (!isValid) {
            return { error: "Email ou senha inválidos." }
        }

        await authLogin(user.id)

    } catch (error) {
        console.error(error)
        return { error: "Erro ao fazer login." }
    }

    redirect("/painel")
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

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            plan: true,
            location: {
                include: { city: true }
            }
        }
    })

    if (!user) redirect('/login')

    const plan = user.plan?.plan || "FREE"
    const maxImages = plan === "FREE" ? 1 : 5
    const imageList = JSON.parse(images)

    if (imageList.length > maxImages) {
        throw new Error(`Limite de imagens excedido. Seu plano permite apenas ${maxImages} imagem(ns).`)
    }

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

    if (user.location?.city?.slug && user.slug) {
        revalidatePath(`/${user.location.city.slug}/${user.slug}`)
    }

    redirect('/painel/produtos?success=true')
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

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            plan: true,
            location: {
                include: { city: true }
            }
        }
    })

    if (!user) redirect('/login')

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product || product.userId !== session.userId) {
        throw new Error("Unauthorized")
    }

    const plan = user.plan?.plan || "FREE"
    const maxImages = plan === "FREE" ? 1 : 5
    const imageList = JSON.parse(images)

    if (imageList.length > maxImages) {
        throw new Error(`Limite de imagens excedido. Seu plano permite apenas ${maxImages} imagem(ns).`)
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

    if (user.location?.city?.slug && user.slug) {
        revalidatePath(`/${user.location.city.slug}/${user.slug}`)
    }

    redirect('/painel/produtos?success=true')
}
