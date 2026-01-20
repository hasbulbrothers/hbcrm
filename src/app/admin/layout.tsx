'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu, LogOut } from 'lucide-react'
import { logout } from '../login/actions'

// Auto-logout timeout: 2 hours in milliseconds
const AUTO_LOGOUT_TIMEOUT = 2 * 60 * 60 * 1000 // 2 hours

function LogoutButton({ className = '' }: { className?: string }) {
    const handleLogout = async () => {
        await logout()
    }

    return (
        <Button
            variant="ghost"
            className={`w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
            onClick={handleLogout}
        >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
        </Button>
    )
}

function NavContent({ isMobile = false }: { isMobile?: boolean }) {
    return (
        <nav className="space-y-2 flex flex-col h-full">
            <div className="flex-1 space-y-2">
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
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t">
                <LogoutButton />
            </div>
        </nav>
    )
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastActivityRef = useRef<number>(Date.now())

    useEffect(() => {
        // Reset timer on user activity
        const resetTimer = () => {
            lastActivityRef.current = Date.now()

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(async () => {
                // Auto-logout after 2 hours of inactivity
                await logout()
            }, AUTO_LOGOUT_TIMEOUT)
        }

        // Events that indicate user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true)
        })

        // Start the initial timer
        resetTimer()

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetTimer, true)
            })
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [router])

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col w-64 bg-white border-r p-6">
                <h2 className="text-xl font-bold mb-6">9X Growth Admin</h2>
                <div className="flex-1">
                    <NavContent isMobile={false} />
                </div>
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
                        <SheetContent side="left" className="w-64 p-6 flex flex-col">
                            <SheetHeader>
                                <SheetTitle className="text-xl font-bold mb-6 text-left">Admin Menu</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4 flex-1">
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
