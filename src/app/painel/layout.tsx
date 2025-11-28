import { getSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { EmailVerificationBanner } from "@/components/admin/email-verification-banner"
import { SidebarNav } from "@/components/admin/sidebar-nav"
import { MobileNav } from "@/components/admin/mobile-nav"

const prisma = new PrismaClient()

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    const user = session ? await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            slug: true,
            emailVerified: true,
            location: {
                select: {
                    city: {
                        select: {
                            slug: true
                        }
                    }
                }
            }
        }
    }) : null

    const storeLink = user?.location?.city?.slug && user?.slug
        ? `/${user.location.city.slug}/${user.slug}`
        : undefined

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 border-r bg-white fixed inset-y-0 z-50">
                <SidebarNav storeLink={storeLink} />
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b bg-white flex items-center px-4 sticky top-0 z-40 justify-between">
                    <div className="flex items-center gap-2 font-bold text-blue-600 text-lg">
                        ZapVitrine
                    </div>
                    <MobileNav storeLink={storeLink} />
                </header>

                {/* Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <EmailVerificationBanner emailVerified={user?.emailVerified ?? null} />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
