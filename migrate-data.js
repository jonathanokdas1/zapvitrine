const sqlite3 = require('sqlite3').verbose();
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();
const sqliteDbPath = path.resolve(__dirname, 'prisma/dev.db');

const db = new sqlite3.Database(sqliteDbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function main() {
    console.log('Starting migration...');

    // 1. Map Cities (Slug -> Postgres ID)
    console.log('Fetching Postgres cities...');
    const pgCities = await prisma.city.findMany();
    const cityMap = new Map(pgCities.map(c => [c.slug, c.id]));
    console.log(`Loaded ${cityMap.size} cities from Postgres.`);

    // 2. Fetch Users from SQLite
    const users = await query('SELECT * FROM User');
    console.log(`Found ${users.length} users in SQLite.`);

    for (const user of users) {
        console.log(`Migrating user: ${user.email} (${user.name})`);

        // Check if user exists by ID or Email
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: user.id },
                    { email: user.email }
                ]
            }
        });

        if (existingUser) {
            console.log(`User ${user.email} (ID: ${user.id}) already exists. Skipping.`);
            continue;
        }

        // Create User
        await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                password_hash: user.password_hash,
                name: user.name,
                owner_name: user.owner_name,
                slug: user.slug,
                logo_url: user.logo_url,
                description: user.description,
                phone: user.phone,
                document: user.document,
                category: user.category,
                category_slug: user.category_slug,
                store_type: user.store_type,
                opening_hours: user.opening_hours,
                address_text: user.address_text,
                views: user.views,
                clicks_whatsapp: user.clicks_whatsapp,
                verified: Boolean(user.verified),
                blocked: Boolean(user.blocked),
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt),
            }
        });

        // Migrate Business
        const business = await get('SELECT * FROM Business WHERE userId = ?', [user.id]);
        if (business) {
            await prisma.business.create({
                data: {
                    id: business.id,
                    category: business.category,
                    consumption_mode: business.consumption_mode,
                    opening_hours: business.opening_hours,
                    schedule: business.schedule,
                    is_open: Boolean(business.is_open),
                    userId: user.id
                }
            });
        }

        // Migrate Plan
        const plan = await get('SELECT * FROM Plan WHERE userId = ?', [user.id]);
        if (plan) {
            await prisma.plan.create({
                data: {
                    id: plan.id,
                    plan: plan.plan,
                    userId: user.id
                }
            });
        }

        // Migrate Metrics
        const metrics = await get('SELECT * FROM Metrics WHERE userId = ?', [user.id]);
        if (metrics) {
            await prisma.metrics.create({
                data: {
                    id: metrics.id,
                    views_count: metrics.views_count,
                    userId: user.id
                }
            });
        }

        // Migrate Location
        const location = await get('SELECT * FROM Location WHERE userId = ?', [user.id]);
        if (location) {
            // Find city slug from SQLite City table
            const sqliteCity = await get('SELECT * FROM City WHERE id = ?', [location.cityId]);
            if (sqliteCity) {
                const pgCityId = cityMap.get(sqliteCity.slug);
                if (pgCityId) {
                    await prisma.location.create({
                        data: {
                            id: location.id,
                            address_text: location.address_text,
                            cityId: pgCityId,
                            userId: user.id
                        }
                    });
                } else {
                    console.warn(`City slug ${sqliteCity.slug} not found in Postgres. Skipping location for user ${user.id}.`);
                }
            }
        }

        // Migrate Products
        const products = await query('SELECT * FROM Product WHERE userId = ?', [user.id]);
        for (const product of products) {
            await prisma.product.create({
                data: {
                    id: product.id,
                    title: product.title,
                    description: product.description,
                    price: BigInt(product.price), // Handle BigInt
                    promo_price: product.promo_price ? BigInt(product.promo_price) : null,
                    images: product.images,
                    variants: product.variants,
                    is_active: Boolean(product.is_active),
                    is_service: Boolean(product.is_service),
                    views: product.views,
                    userId: user.id,
                    createdAt: new Date(product.createdAt),
                    updatedAt: new Date(product.updatedAt),
                }
            });
        }

        console.log(`User ${user.email} migrated successfully.`);
    }

    console.log('Migration complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        db.close();
        await prisma.$disconnect();
    });
