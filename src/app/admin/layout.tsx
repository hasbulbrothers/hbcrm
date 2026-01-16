import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { logoutAdmin } from './logout-action'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r p-6 space-y-4">
                <h2 className="text-xl font-bold mb-6">9X Growth Admin</h2>
                <nav className="space-y-2">
                    <Link href="/admin/dashboard" className="block">
                        <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                    </Link>
                    <Link href="/admin/participants" className="block">
                        <Button variant="ghost" className="w-full justify-start">Peserta</Button>
                    </Link>
                    <Link href="/admin/import" className="block">
                        <Button variant="ghost" className="w-full justify-start">Import CSV</Button>
                    </Link>
                    <Link href="/admin/settings" className="block">
                        <Button variant="ghost" className="w-full justify-start">Settings</Button>
                    </Link>
                    <form action={logoutAdmin}>
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">Log Keluar</Button>
                    </form>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}
