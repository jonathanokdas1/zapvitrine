"use client"

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { SidebarNav } from "./sidebar-nav"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

interface MobileNavProps {
    storeLink?: string
}

export function MobileNav({ storeLink }: MobileNavProps) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Close sheet when route changes
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
                <SidebarNav storeLink={storeLink} />
            </SheetContent>
        </Sheet>
    )
}
