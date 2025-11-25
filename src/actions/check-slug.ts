"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function checkSlugAvailability(slug: string) {
    const session = await getSession()
    if (!session) {
        return { error: "Unauthorized" }
    }

    // Check if slug exists and belongs to another user
    const existingUser = await prisma.user.findUnique({
        where: {
            slug: slug,
        },
    })

    if (existingUser && existingUser.id !== session.id) {
        return { available: false }
    }

    return { available: true }
}
