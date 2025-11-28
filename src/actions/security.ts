"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updatePassword(formData: FormData) {
    const session = await getSession()
    if (!session) return { error: "Não autorizado" }

    const current_password = formData.get("current_password") as string
    const new_password = formData.get("new_password") as string
    const confirm_password = formData.get("confirm_password") as string

    if (!current_password || !new_password || !confirm_password) {
        return { error: "Preencha todos os campos" }
    }

    if (new_password !== confirm_password) {
        return { error: "As senhas não coincidem" }
    }

    if (new_password.length < 6) {
        return { error: "A nova senha deve ter pelo menos 6 caracteres" }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId }
    })

    if (!user) return { error: "Usuário não encontrado" }

    // Check current password (plain text for now as per existing implementation)
    if (user.password_hash !== current_password) {
        return { error: "Senha atual incorreta" }
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password_hash: new_password
        }
    })

    revalidatePath("/painel/configuracao")
    return { success: true }
}

export async function initiatePasswordChange() {
    const session = await getSession()
    if (!session) return { error: "Não autorizado" }

    const user = await prisma.user.findUnique({
        where: { id: session.userId }
    })

    if (!user) return { error: "Usuário não encontrado" }

    // Create a FormData object to reuse the existing requestPasswordReset logic
    const formData = new FormData()
    formData.append("email", user.email)

    return await requestPasswordReset(formData)
}

import { sendPasswordResetEmail } from "@/lib/email"
import { emailQueue } from "@/lib/queue"
import crypto from "crypto"
import bcrypt from "bcryptjs"

export async function requestPasswordReset(formData: FormData) {
    const email = formData.get("email") as string

    if (!email) {
        return { error: "Digite seu email" }
    }

    const user = await prisma.user.findUnique({
        where: { email }
    })

    // Security: Always return success even if user not found
    if (!user) {
        return { success: true, message: "Se o email estiver cadastrado, você receberá um link de recuperação." }
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiry = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken: token,
            resetTokenExpiry: expiry
        }
    })

    // await sendPasswordResetEmail(email, token)
    await emailQueue.add('password-reset', { type: 'password-reset', data: { email, token } })

    return { success: true, message: "Solicitação enviada!" }
}

export async function resetPassword(token: string, formData: FormData) {
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!password || !confirmPassword) {
        return { error: "Preencha todos os campos" }
    }

    if (password !== confirmPassword) {
        return { error: "As senhas não coincidem" }
    }

    if (password.length < 6) {
        return { error: "A senha deve ter pelo menos 6 caracteres" }
    }

    const user = await prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpiry: {
                gt: new Date()
            }
        }
    })

    if (!user) {
        return { error: "Link inválido ou expirado" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password_hash: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
        }
    })

    return { success: true }
}
