import db from '@/lib/db';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || '';

  const stores = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { slug: { contains: query } },
        // Assuming settings might contain city, but it's a JSON string, so simple search might not work easily on it with SQLite without extensions.
        // We'll stick to name/slug for now as per prompt "busca por cidade" - we might need to extract city to a column or do client side filtering if dataset is small, or just simple LIKE on the stringified JSON?
        // SQLite LIKE on JSON string works for simple cases.
        { settings: { contains: query } }
      ]
    },
    take: 20
  });

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <header className="text-center py-8">
          <h1 className="text-3xl font-bold text-slate-900">ZapVitrine</h1>
          <p className="text-slate-600">Encontre lojas e peça pelo WhatsApp</p>
        </header>

        <form className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar loja ou cidade..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </form>

        <div className="grid gap-4">
          {stores.map((store) => {
            let settings = {};
            try { settings = JSON.parse(store.settings); } catch (e) { }
            // @ts-ignore
            const color = settings.color || '#10b981';

            return (
              <Link key={store.id} href={`/${store.slug}`}>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-white" style={{ backgroundColor: color }}>
                    {store.name.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{store.name}</h3>
                    <p className="text-sm text-slate-500">@{store.slug}</p>
                  </div>
                </div>
              </Link>
            );
          })}

          {stores.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              Nenhuma loja encontrada.
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link href="/admin" className="text-sm text-green-600 hover:underline">
            Sou lojista (Login)
          </Link>
        </div>
      </div>
    </main>
  );
}
