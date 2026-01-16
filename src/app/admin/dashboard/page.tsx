'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStats } from '../actions'

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getDashboardStats().then(data => {
            setStats(data)
            setLoading(false)
        })
    }, [])

    if (loading) return <div className="p-8">Loading Dashboard...</div>

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Kehadiran Day 1</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold text-blue-600">{stats.day1}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Kehadiran Day 2</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold text-green-600">{stats.day2}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Sales (Hadir)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-bold text-purple-600">
                            {new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR' }).format(stats.totalSales || 0)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pecahan Mengikut Niche</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {Object.entries(stats.niche).map(([key, val]: any) => (
                                <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                    <span>{key}</span>
                                    <span className="font-bold">{val}</span>
                                </li>
                            ))}
                            {Object.keys(stats.niche).length === 0 && <p className="text-gray-500">Tiada data</p>}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pecahan Mengikut Negeri</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {Object.entries(stats.state).map(([key, val]: any) => (
                                <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                    <span>{key}</span>
                                    <span className="font-bold">{val}</span>
                                </li>
                            ))}
                            {Object.keys(stats.state).length === 0 && <p className="text-gray-500">Tiada data</p>}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pecahan Ikut Nilai Sales (RM)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {stats.salesValue && Object.entries(stats.salesValue).map(([key, val]: any) => (
                                <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                    <span>{key}</span>
                                    <span className="font-bold">{val}</span>
                                </li>
                            ))}
                            {(!stats.salesValue || Object.keys(stats.salesValue).length === 0) && <p className="text-gray-500">Tiada data</p>}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pecahan Ikut Jenis Tiket</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {stats.ticketType && Object.entries(stats.ticketType).map(([key, val]: any) => (
                                <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                    <span>{key}</span>
                                    <span className="font-bold">{val}</span>
                                </li>
                            ))}
                            {(!stats.ticketType || Object.keys(stats.ticketType).length === 0) && <p className="text-gray-500">Tiada data</p>}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
