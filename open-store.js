const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const slug = 'klivio'
    console.log(`Opening store: ${slug}`)

    const user = await prisma.user.findUnique({
        where: { slug },
        include: { business: true }
    })

    if (!user) {
        console.log('User not found!')
        return
    }

    await prisma.business.update({
        where: { id: user.business.id },
        data: { is_open: true }
    })

    console.log('Store opened successfully!')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
