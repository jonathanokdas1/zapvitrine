import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
        return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
        where: { slug }
    })

    return NextResponse.json({ available: !user })
}
