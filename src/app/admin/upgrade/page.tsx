import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function UpgradePage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Planos</h2>
                <p className="text-muted-foreground">Escolha o melhor plano para o seu negócio.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>Para quem está começando</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">R$ 0,00<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Até 10 produtos</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Vitrine básica</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Pedidos no WhatsApp</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" disabled>Plano Atual</Button>
                    </CardFooter>
                </Card>

                <Card className="border-blue-600 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        RECOMENDADO
                    </div>
                    <CardHeader>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>Para quem quer vender mais</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">R$ 29,90<span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Produtos ilimitados</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Fotos em alta resolução</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Estatísticas avançadas</li>
                            <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-green-500" /> Suporte prioritário</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Fazer Upgrade</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
