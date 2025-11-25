import Link from "next/link"
import { LayoutDashboard, ShoppingBag, Settings, CreditCard, HelpCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">ZapVitrine</h1>
                    <p className="text-xs text-gray-500">Vendor Dashboard</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/admin/products">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Products
                        </Button>
                    </Link>
                    <Link href="/admin/settings">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Settings className="w-4 h-4" />
                            Settings
                        </Button>
                    </Link>
                    <Link href="/admin/upgrade">
                        <Button variant="ghost" className="w-full justify-start gap-2 text-purple-600">
                            <CreditCard className="w-4 h-4" />
                            Upgrade Plan
                        </Button>
                    </Link>
                    <Link href="/admin/support">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <HelpCircle className="w-4 h-4" />
                            Support
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <Link href="/">
                        <Button variant="outline" className="w-full justify-start gap-2 text-red-500 hover:text-red-600">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
