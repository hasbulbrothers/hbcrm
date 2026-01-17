import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logoutAdmin } from './logout-action'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <nav className="space-y-2">
            <Link href="/admin/dashboard" className="block">
                <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link href="/admin/analytics" className="block">
                <Button variant="ghost" className="w-full justify-start">Analytics</Button>
            </Link>

            {/* Desktop Only Links */}
            {!isMobile && (
                <>
                    <Link href="/admin/participants" className="block">
                        <Button variant="ghost" className="w-full justify-start">Participants</Button>
                    </Link>
                    <Link href="/admin/import" className="block">
                        <Button variant="ghost" className="w-full justify-start">Import CSV</Button>
                    </Link>
                    <Link href="/admin/settings" className="block">
                        <Button variant="ghost" className="w-full justify-start">Settings</Button>
                    </Link>
                    <Link href="/admin/roles" className="block">
                        <Button variant="ghost" className="w-full justify-start">Roles</Button>
                    </Link>
                </>
            )}

            <form action={logoutAdmin}>
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">Logout</Button>
            </form>
        </nav>
    )

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 bg-white border-r p-6 space-y-4">
                <h2 className="text-xl font-bold mb-6">9X Growth Admin</h2>
                <NavContent isMobile={false} />
            </aside>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-lg font-bold">9X Growth Admin</h2>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-6">
                            <SheetHeader>
                                <SheetTitle className="text-xl font-bold mb-6 text-left">Admin Menu</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4">
                                <NavContent isMobile={true} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
