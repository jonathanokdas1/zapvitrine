const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const badCity = await prisma.city.findUnique({ where: { slug: 'concordia' } })
    if (!badCity) {
        console.log("Bad city not found")
        return
    }

    const locations = await prisma.location.findMany({
        where: { cityId: badCity.id },
        include: { user: true }
    })

    console.log(`Locations using 'concordia': ${locations.length}`)
    locations.forEach(loc => console.log(`- ${loc.user.name} (${loc.user.slug})`))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
