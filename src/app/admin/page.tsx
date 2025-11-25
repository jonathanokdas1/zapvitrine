import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, MousePointer, ShoppingBag, DollarSign } from "lucide-react"
import { getDashboardMetrics } from "@/actions/dashboard"

export default async function AdminDashboard() {
    const metrics = await getDashboardMetrics()

    if (!metrics) return <div>Carregando...</div>

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Painel</h2>
                <p className="text-muted-foreground">Bem-vindo de volta, {metrics.name}!</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Visualizações Totais</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.views}</div>
                        <p className="text-xs text-muted-foreground">+20.1% desde o último mês</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.active_products}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cliques no WhatsApp</CardTitle>
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.clicks_whatsapp}</div>
                        <p className="text-xs text-muted-foreground">+19% desde o último mês</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.plan}</div>
                        <p className="text-xs text-muted-foreground">Faça upgrade para mais recursos</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
