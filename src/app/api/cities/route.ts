import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    // Se não tiver busca ou for muito curta, retorna vazio para não pesar
    if (!query || query.length < 2) {
        return NextResponse.json([])
    }

    // Normalize query to remove accents (NFD -> Remove Diacritics)
    // This ensures "Concórdia" becomes "Concordia" before searching
    const normalizedQuery = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

    try {
        // Busca no banco de dados (Postgres com unaccent)
        // O Prisma não suporta nativamente unaccent no findMany, então usamos raw query
        const cities = await prisma.$queryRaw`
            SELECT * FROM "City"
            WHERE unaccent(name) ILIKE unaccent(${'%' + normalizedQuery + '%'})
            ORDER BY 
                CASE 
                    WHEN unaccent(name) ILIKE unaccent(${normalizedQuery}) THEN 1 
                    WHEN unaccent(name) ILIKE unaccent(${normalizedQuery + '%'}) THEN 2 
                    ELSE 3 
                END,
                name ASC
            LIMIT 20
        `

        return NextResponse.json(cities)
    } catch (error) {
        console.error('Erro ao buscar cidades:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}