"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingCart, Settings, CreditCard, HelpCircle, LogOut, ExternalLink, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopyLinkButton } from "@/components/copy-link-button"
import { cn } from "@/lib/utils"

interface SidebarNavProps {
    className?: string
    storeLink?: string
}

export function SidebarNav({ className, storeLink }: SidebarNavProps) {
    const pathname = usePathname()

    const navItems = [
        {
            title: "Gerenciar",
            items: [
                {
                    title: "Início",
                    href: "/painel",
                    icon: Home,
                    exact: true
                },
                {
                    title: "Produtos",
                    href: "/painel/produtos",
                    icon: ShoppingCart
                }
            ]
        },
        {
            title: "Configurações",
            items: [
                {
                    title: "Loja",
                    href: "/painel/configuracao",
                    icon: Settings
                },
                {
                    title: "Planos",
                    href: "/painel/planos",
                    icon: CreditCard
                }
            ]
        },
        {
            title: "Ajuda",
            items: [
                {
                    title: "Suporte",
                    href: "/painel/suporte",
                    icon: HelpCircle
                }
            ]
        }
    ]

    return (
        <nav className={cn("flex flex-col h-full", className)}>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                    <Store className="w-6 h-6" />
                    ZapVitrine
                </h1>
                <p className="text-xs text-gray-500 mt-1">Painel do Vendedor</p>
            </div>

            <div className="flex-1 px-4 space-y-6 overflow-y-auto">
                {navItems.map((group, i) => (
                    <div key={i}>
                        <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = item.exact
                                    ? pathname === item.href
                                    : pathname.startsWith(item.href)

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4", isActive ? "text-blue-600" : "text-gray-500")} />
                                        {item.title}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t space-y-2 bg-gray-50/50">
                {storeLink && (
                    <div className="space-y-2">
                        <Button asChild variant="outline" className="w-full justify-start gap-2 bg-white">
                            <Link href={storeLink} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                                Minha Loja
                            </Link>
                        </Button>
                        <CopyLinkButton url={storeLink} variant="ghost" className="w-full justify-start gap-2 h-9" label="Copiar Link" />
                    </div>
                )}

                <Button asChild variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Link href="/">
                        <LogOut className="w-4 h-4" />
                        Sair
                    </Link>
                </Button>
            </div>
        </nav>
    )
}
