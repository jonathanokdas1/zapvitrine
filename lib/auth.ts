import { cookies } from 'next/headers';
import db from './db';

// Simple session management
// In a real app, use a proper session library or JWT
// Here we just store the user ID in a httpOnly cookie

export async function createSession(userId: string) {
    (await cookies()).set('session', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    return session;
}

export async function logout() {
    (await cookies()).delete('session');
}

export async function getCurrentUser() {
    const userId = await getSession();
    if (!userId) return null;

    const user = await db.user.findUnique({
        where: { id: userId },
    });

    return user;
}
