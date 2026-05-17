'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Menu, LogOut, LayoutDashboard, Users, Upload, Settings, Shield } from 'lucide-react'
import { logout } from '../login/actions'

const AUTO_LOGOUT_TIMEOUT = 60 * 60 * 1000

const NAV_ITEMS = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/participants', label: 'Participants', icon: Users },
    { href: '/admin/import', label: 'Import CSV', icon: Upload },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/roles', label: 'Roles', icon: Shield },
]

function LogoutButton() {
    const handleLogout = async () => {
        await logout()
    }

    return (
        <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
        >
            <LogOut className="w-4 h-4" />
            Logout
        </button>
    )
}

function NavContent({ pathname }: { pathname: string }) {
    return (
        <nav className="flex flex-col h-full">
            <div className="flex-1 space-y-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link key={href} href={href}>
                            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}>
                                <Icon className="w-4 h-4" />
                                {label}
                            </div>
                        </Link>
                    )
                })}
            </div>
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
    const pathname = usePathname()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastActivityRef = useRef<number>(Date.now())

    useEffect(() => {
        const resetTimer = () => {
            lastActivityRef.current = Date.now()
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            timeoutRef.current = setTimeout(async () => {
                await logout()
            }, AUTO_LOGOUT_TIMEOUT)
        }

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true)
        })
        resetTimer()

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetTimer, true)
            })
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [router])

    const currentPage = NAV_ITEMS.find(item => pathname === item.href || pathname.startsWith(item.href + '/'))

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">HB CRM</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
                </div>
                <div className="flex-1 p-4">
                    <NavContent pathname={pathname} />
                </div>
            </aside>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">HB CRM</h2>
                        {currentPage && (
                            <p className="text-xs text-gray-400">{currentPage.label}</p>
                        )}
                    </div>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0 flex flex-col">
                            <SheetHeader className="p-6 border-b border-gray-100">
                                <SheetTitle className="text-lg font-bold text-left">HB CRM</SheetTitle>
                            </SheetHeader>
                            <div className="flex-1 p-4">
                                <NavContent pathname={pathname} />
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
