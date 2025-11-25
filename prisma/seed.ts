import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Definição da estrutura do JSON
interface StateData {
    name: string
    cities: string[]
}
type BrazilData = Record<string, StateData>

function createSlug(text: string) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

async function main() {
    console.log('🌱 Iniciando Seed (SQLite Safe)...')

    const filePath = path.join(process.cwd(), 'prisma', 'brazil-data.json')

    if (!fs.existsSync(filePath)) {
        console.error(`❌ ERRO: Arquivo não encontrado: ${filePath}`)
        process.exit(1)
    }

    const rawData = fs.readFileSync(filePath, 'utf-8')
    const brazilData: BrazilData = JSON.parse(rawData)

    const citiesToInsert = []
    const usedSlugs = new Set()

    console.log('📦 Processando e removendo duplicatas...')

    for (const [sigla, data] of Object.entries(brazilData)) {
        const cidades = data.cities

        for (const nomeCidade of cidades) {
            const slug = createSlug(`${nomeCidade}-${sigla}`)

            if (!usedSlugs.has(slug)) {
                usedSlugs.add(slug)
                citiesToInsert.push({
                    name: nomeCidade,
                    state: sigla,
                    slug: slug
                })
            }
        }
    }

    console.log(`📊 Total único mapeado: ${citiesToInsert.length} cidades.`)

    console.log('🧹 Limpando banco antigo...')
    try { await prisma.location.deleteMany({}) } catch (e) { }
    await prisma.city.deleteMany({})

    console.log('🚀 Inserindo no SQLite...')

    const batchSize = 500
    for (let i = 0; i < citiesToInsert.length; i += batchSize) {
        const batch = citiesToInsert.slice(i, i + batchSize)
        await prisma.city.createMany({
            data: batch
        })

        if (i % 2000 === 0) process.stdout.write('.')
    }
    console.log('\n✅ Cidades importadas com sucesso!')

    // Criar Loja Demo
    const demoCitySlug = 'sao-paulo-sp'
    const demoCity = await prisma.city.findFirst({ where: { slug: demoCitySlug } }) || await prisma.city.findFirst()

    if (demoCity) {
        console.log(`🍔 Criando Loja Demo em ${demoCity.name}...`)

        const email = 'demo@zapvitrine.com'
        await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password_hash: '$2a$10$fakehash',
                name: 'Burger King Demo',
                slug: 'burger-king-demo',
                phone: '5511999999999',
                logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/200px-Burger_King_logo_%281999%29.svg.png',
                description: 'O melhor hambúrguer da cidade.',
                plan: { create: { plan: 'PRO' } },
                location: {
                    create: {
                        address_text: 'Av. Paulista, 1000',
                        cityId: demoCity.id
                    }
                },
                business: {
                    create: {
                        category: 'FOOD',
                        is_open: true,
                        opening_hours: '10:00 - 22:00'
                    }
                },
                metrics: { create: { views_count: 150 } },
                products: {
                    create: [
                        {
                            title: 'Whopper',
                            price: 2990,
                            images: JSON.stringify(['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80']),
                            variants: JSON.stringify([{ name: "Tamanho", type: "SELECT", options: [{ label: "M", price: 0 }] }]),
                            is_active: true
                        }
                    ]
                }
            }
        })
    }

    console.log('🏁 Seed finalizado!')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })