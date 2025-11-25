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

    try {
        // Busca no banco de dados (SQLite)
        const cities = await prisma.city.findMany({
            where: {
                name: {
                    contains: query, // Procura cidades que CONTÊM o texto
                },
            },
            take: 20, // Limita a 20 resultados para ser rápido
            orderBy: {
                name: 'asc' // Ordena alfabeticamente
            }
        })

        return NextResponse.json(cities)
    } catch (error) {
        console.error('Erro ao buscar cidades:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}