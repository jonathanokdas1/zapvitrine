const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const slug = 'concordia-sc'
    console.log(`Checking city: ${slug}`)

    const city = await prisma.city.findUnique({
        where: { slug },
        include: {
            locations: {
                include: {
                    user: {
                        include: {
                            business: true
                        }
                    }
                }
            }
        }
    })

    if (!city) {
        console.log('City not found!')
        return
    }

    console.log(`City found: ${city.name} (${city.state})`)
    console.log(`Total locations: ${city.locations.length}`)

    city.locations.forEach(loc => {
        console.log(`- Store: ${loc.user.name} (Slug: ${loc.user.slug})`)
        console.log(`  Business Open? ${loc.user.business?.is_open}`)
        console.log(`  Category: ${loc.user.business?.category}`)
    })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
