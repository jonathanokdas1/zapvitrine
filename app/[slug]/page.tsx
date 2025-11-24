import db from '@/lib/db';
import { notFound } from 'next/navigation';
import Cart from './components/Cart';
import Image from 'next/image';
import AddToCartButton from './components/AddToCartButton';

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const store = await db.user.findUnique({
        where: { slug },
        include: { products: { where: { active: true } } }
    });

    if (!store) {
        notFound();
    }

    let settings: any = {};
    try {
        settings = JSON.parse(store.settings);
    } catch (e) {
        settings = { color: '#10b981', phone: '' };
    }

    const themeColor = settings.color || '#10b981';

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="text-white p-6 shadow-md" style={{ backgroundColor: themeColor }}>
                <h1 className="text-2xl font-bold">{store.name}</h1>
                <p className="opacity-90 text-sm mt-1">@{store.slug}</p>
            </header>

            {/* Product Grid */}
            <main className="p-4 max-w-2xl mx-auto">
                <h2 className="font-bold text-slate-800 mb-4 text-lg">Cardápio</h2>

                <div className="space-y-4">
                    {store.products.map(product => (
                        <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
                            {product.imageUrl && (
                                <div className="relative h-24 w-24 flex-shrink-0">
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            )}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900">{product.name}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="font-semibold text-green-700">R$ {product.price.toFixed(2)}</span>
                                    <AddToCartButton product={{ id: product.id, name: product.name, price: product.price }} color={themeColor} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {store.products.length === 0 && (
                        <div className="text-center text-slate-500 py-10">
                            Nenhum produto disponível.
                        </div>
                    )}
                </div>
            </main>

            <Cart
                storeName={store.name}
                storePhone={settings.phone || ''}
                userPlan={store.plan}
            />
        </div>
    );
}
