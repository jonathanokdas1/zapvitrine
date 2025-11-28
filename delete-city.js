const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const deleted = await prisma.city.delete({
        where: { slug: 'concordia' }
    })
    console.log(`Deleted city: ${deleted.name} (${deleted.slug})`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
