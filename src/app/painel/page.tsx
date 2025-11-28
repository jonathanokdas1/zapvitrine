import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointer, ShoppingBag, DollarSign, BadgeCheck, Users } from "lucide-react"
import { getDashboardMetrics } from "@/actions/dashboard"
import { getOnlineCount } from "@/actions/analytics"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
    const metrics = await getDashboardMetrics()
    const onlineCount = metrics ? await getOnlineCount(metrics.slug) : 0

    if (!metrics) return <div>Carregando...</div>

    const conversionRate = metrics.views > 0 ? ((metrics.clicks_whatsapp / metrics.views) * 100).toFixed(1) : "0.0"

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Painel</h2>
                <p className="text-muted-foreground">Bem-vindo de volta, {metrics.name}!</p>
            </div>

            {!metrics.verified && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-blue-800 font-semibold flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5" />
                            Passe mais confiança!
                        </h3>
                        <p className="text-blue-600 text-sm mt-1">
                            Lojas verificadas vendem 30% mais. Envie seu CPF/CNPJ para nosso suporte para ganhar o Selo Azul.
                        </p>
                    </div>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                        <a
                            href="https://wa.me/5547999327137?text=Ol%C3%A1%2C%20gostaria%20de%20solicitar%20a%20verifica%C3%A7%C3%A3o%20da%20minha%20loja."
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Solicitar Verificação
                        </a>
                    </Button>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pessoas Online Agora</CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            {onlineCount}
                        </div>
                        <p className="text-xs text-muted-foreground">Visitantes ativos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visualizações Totais</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.views}</div>
                        <p className="text-xs text-muted-foreground">Visitas na loja</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cliques no WhatsApp</CardTitle>
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.clicks_whatsapp}</div>
                        <p className="text-xs text-muted-foreground">Intenções de compra</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={metrics.plan === 'FREE' ? "blur-sm select-none" : ""}>
                            <div className="text-2xl font-bold">{conversionRate}%</div>
                            <p className="text-xs text-muted-foreground">Cliques / Visualizações</p>
                        </div>
                        {metrics.plan === 'FREE' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                <div className="bg-black text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                                    <BadgeCheck className="w-3 h-3" /> PRO
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.active_products}</div>
                        <p className="text-xs text-muted-foreground">Itens no catálogo</p>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Gerado (Est.)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={metrics.plan === 'FREE' ? "blur-sm select-none" : ""}>
                            <div className="text-2xl font-bold text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.revenue_potential / 100)}
                            </div>
                            <p className="text-xs text-muted-foreground">Em pedidos enviados</p>
                        </div>
                        {metrics.plan === 'FREE' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                <div className="bg-black text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                                    <BadgeCheck className="w-3 h-3" /> PRO
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={metrics.plan === 'FREE' ? "blur-sm select-none" : ""}>
                            <div className="text-2xl font-bold">
                                {metrics.clicks_whatsapp > 0
                                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((metrics.revenue_potential / metrics.clicks_whatsapp) / 100)
                                    : "R$ 0,00"}
                            </div>
                            <p className="text-xs text-muted-foreground">Por pedido enviado</p>
                        </div>
                        {metrics.plan === 'FREE' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                                <div className="bg-black text-white text-xs px-2 py-1 rounded flex items-center gap-1 shadow-lg">
                                    <BadgeCheck className="w-3 h-3" /> PRO
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Visitas nos Últimos 7 Dias</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={metrics.analytics} />
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Produtos Mais Populares</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentSales products={metrics.topProducts} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function Overview({ data }: { data: any[] }) {
    // Simple bar chart using CSS/HTML if recharts is complex to setup in RSC without client component wrapper
    // But since we installed recharts, let's use a Client Component wrapper.
    // Actually, let's just use a simple CSS bar chart for speed and robustness if we don't want to create a new file.
    // Wait, user asked for recharts or CSS. Let's create a client component for the chart.
    return <DashboardChart data={data} />
}

function RecentSales({ products }: { products: any[] }) {
    return (
        <div className="space-y-8">
            {products.map((product) => (
                <div key={product.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{product.title}</p>
                        <p className="text-sm text-muted-foreground">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100)}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">+{product.views} views</div>
                </div>
            ))}
        </div>
    )
}

import { DashboardChart } from "./dashboard-chart"
