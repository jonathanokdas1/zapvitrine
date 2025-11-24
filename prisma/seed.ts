import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            password: 'password',
            name: 'Loja do João',
            slug: 'loja-teste',
            plan: 'FREE',
            settings: JSON.stringify({ color: '#10b981', phone: '5511999999999' }),
            products: {
                create: [
                    {
                        name: 'X-Burger',
                        description: 'Pão, carne, queijo e molho especial',
                        price: 25.00,
                        imageUrl: 'https://placehold.co/400x400/png',
                    },
                    {
                        name: 'Coca-Cola',
                        description: 'Lata 350ml',
                        price: 6.00,
                    }
                ]
            }
        },
    });
    console.log({ user });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
