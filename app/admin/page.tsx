import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit, Trash } from 'lucide-react';
import Image from 'next/image';

export default async function AdminPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const products = await db.product.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Painel Admin</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">{user.email}</span>
                    <Link href="/" className="text-sm text-green-600 hover:underline">Ver Loja</Link>
                </div>
            </header>

            <main className="p-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Meus Produtos</h2>
                    <Link href="/admin/products/new" className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700">
                        <Plus className="h-5 w-5" />
                        Novo Produto
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-4 font-medium text-slate-600">Imagem</th>
                                <th className="p-4 font-medium text-slate-600">Nome</th>
                                <th className="p-4 font-medium text-slate-600">Preço</th>
                                <th className="p-4 font-medium text-slate-600">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="p-4">
                                        {product.imageUrl ? (
                                            <div className="relative h-12 w-12">
                                                <Image src={product.imageUrl} alt={product.name} fill className="object-cover rounded" />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 bg-slate-100 rounded flex items-center justify-center text-xs text-slate-400">Sem img</div>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium">{product.name}</td>
                                    <td className="p-4">R$ {product.price.toFixed(2)}</td>
                                    <td className="p-4">
                                        <button className="text-red-500 hover:text-red-700"><Trash className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-500">
                                        Você ainda não tem produtos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
