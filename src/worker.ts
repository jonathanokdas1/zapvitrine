import { Worker } from "bullmq"
import { Resend } from "resend"
import dotenv from "dotenv"

dotenv.config()

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379"

const worker = new Worker("email-queue", async (job) => {
    const { type, data } = job.data

    console.log(`Processing job ${job.id} of type ${type}`)

    try {
        if (type === 'password-reset') {
            const { email, token } = data
            const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

            if (!resend) {
                console.log(`[DEV] Password Reset Link for ${email}: ${resetLink}`)
                return
            }

            await resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: email,
                subject: 'Recuperação de Senha - ZapVitrine',
                html: `
                    <p>Você solicitou a recuperação de senha.</p>
                    <p>Clique no link abaixo para redefinir sua senha:</p>
                    <a href="${resetLink}">${resetLink}</a>
                    <p>Este link expira em 1 hora.</p>
                `
            })
        } else if (type === 'verification') {
            const { email, token } = data
            const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

            if (!resend) {
                console.log(`[DEV] Verification Link for ${email}: ${verifyLink}`)
                return
            }

            await resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: email,
                subject: 'Verifique seu email - ZapVitrine',
                html: `
                    <p>Bem-vindo ao ZapVitrine!</p>
                    <p>Para ativar sua loja, clique no link abaixo:</p>
                    <a href="${verifyLink}">${verifyLink}</a>
                    <p>Se você não criou esta conta, ignore este email.</p>
                `
            })
        }
    } catch (error) {
        console.error(`Failed to process job ${job.id}:`, error)
        throw error
    }
}, {
    connection: {
        url: redisUrl
    }
})

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed!`)
})

worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with ${err.message}`)
})

console.log("Worker started...")
