const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const cities = await prisma.city.findMany({
        where: {
            name: {
                contains: 'Concórdia'
            }
        }
    })
    console.log(JSON.stringify(cities, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
