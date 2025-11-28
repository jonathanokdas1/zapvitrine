const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const cityCount = await prisma.city.count()
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()

    console.log(`Cities: ${cityCount}`)
    console.log(`Users: ${userCount}`)
    console.log(`Products: ${productCount}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
