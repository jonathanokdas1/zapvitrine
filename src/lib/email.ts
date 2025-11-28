import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
        console.log(`[DEV] Password Reset Link for ${email}: ${resetLink}`);
        return { success: true };
    }

    try {
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
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { error: 'Failed to send email' };
    }
}

export async function sendVerificationEmail(email: string, token: string) {
    const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    if (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY) {
        console.log(`[DEV] Verification Link for ${email}: ${verifyLink}`);
        return { success: true };
    }

    try {
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
        });
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { error: 'Failed to send email' };
    }
}
