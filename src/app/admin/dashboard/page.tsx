/* eslint-disable @typescript-eslint/no-explicit-any */
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Breakdown by Niche</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {Object.entries(stats.niche).map(([key, val]: any) => (
                                <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                    <span>{key}</span>
                                    <span className="font-bold">{val}</span>
                                </li>
                            ))}
                            {Object.keys(stats.niche).length === 0 && <p className="text-gray-500">No data</p>}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Breakdown by State</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {Object.entries(stats.state).map(([key, val]: any) => (
                                <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                    <span>{key}</span>
                                    <span className="font-bold">{val}</span>
                                </li>
                            ))}
                            {Object.keys(stats.state).length === 0 && <p className="text-gray-500">No data</p>}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Breakdown by Sales Value (RM)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {stats.salesValue && Object.entries(stats.salesValue).map(([key, val]: any) => (
                                <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                    <span>{key}</span>
                                    <span className="font-bold">{val}</span>
                                </li>
                            ))}
                            {(!stats.salesValue || Object.keys(stats.salesValue).length === 0) && <p className="text-gray-500">No data</p>}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Breakdown by Ticket Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {stats.ticketType && Object.entries(stats.ticketType).map(([key, val]: any) => (
                                <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                    <span>{key}</span>
                                    <span className="font-bold">{val}</span>
                                </li>
                            ))}
                            {(!stats.ticketType || Object.keys(stats.ticketType).length === 0) && <p className="text-gray-500">No data</p>}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
