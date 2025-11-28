import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
    try {
        // Cloudflare headers
        const cityHeader = request.headers.get('cf-ipcity')
        const regionHeader = request.headers.get('cf-region-code')

        // If no headers (dev mode), return null
        if (!cityHeader) {
            return NextResponse.json(null)
        }

        // Decode header (sometimes it comes encoded)
        const cityName = decodeURIComponent(cityHeader)

        // Find in DB
        const cities = await prisma.$queryRaw<any[]>`
            SELECT * FROM "City"
            WHERE unaccent(name) ILIKE unaccent(${cityName})
            LIMIT 1
        `

        if (cities && cities.length > 0) {
            return NextResponse.json(cities[0])
        }

        return NextResponse.json(null)
    } catch (error) {
        console.error('Error detecting location:', error)
        return NextResponse.json(null)
    } finally {
        await prisma.$disconnect()
    }
}
