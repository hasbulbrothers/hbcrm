/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, DollarSign, Gift } from 'lucide-react'
import { getSeminars, getSeminarAnalytics, getSeminarStats, updateSeminarStats } from '../actions'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

// Color palette for charts
const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#6366F1', '#F97316']

export default function AnalyticsPage() {
    const [seminars, setSeminars] = useState<string[]>([])
    const [selectedSeminar, setSelectedSeminar] = useState<string>('')
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [statsLoading, setStatsLoading] = useState(false)
    const [error, setError] = useState('')

    // Participant counts
    const [paidCount, setPaidCount] = useState<number>(0)
    const [sponsorCount, setSponsorCount] = useState<number>(0)
    const [saving, setSaving] = useState(false)

    async function loadParticipantCounts(eventCode: string) {
        if (!eventCode) return
        const res = await getSeminarStats(eventCode)
        if (res.success) {
            setPaidCount(res.paidCount || 0)
            setSponsorCount(res.sponsorCount || 0)
        } else {
            setPaidCount(0)
            setSponsorCount(0)
        }
    }

    async function loadStats(eventCode: string) {
        setStatsLoading(true)
        setError('')
        const res = await getSeminarAnalytics(eventCode)
        if (res.success && res.stats) {
            setStats(res.stats)
        } else {
            setError('Failed to load analytics')
        }
        setStatsLoading(false)
    }

    async function loadSeminars() {
        setLoading(true)
        try {
            const res = await getSeminars()
            if (res.success && res.events && res.events.length > 0) {
                setSeminars(res.events)
                // Auto-select first event if available
                const firstEvent = res.events[0]
                setSelectedSeminar(firstEvent)
                await loadStats(firstEvent)
                await loadParticipantCounts(firstEvent)
            } else {
                // No seminars found - that's okay
                setSeminars([])
            }
        } catch (err) {
            console.error('Error loading seminars:', err)
            setError('Failed to load seminars')
        }
        setLoading(false)
    }

    useEffect(() => {
        loadSeminars()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function handleSaveCounts() {
        if (!selectedSeminar) return
        setSaving(true)
        await updateSeminarStats(selectedSeminar, paidCount, sponsorCount)
        setSaving(false)
        // Refresh stats to update rates
        loadStats(selectedSeminar)
    }

    const handleSeminarChange = (eventCode: string) => {
        setSelectedSeminar(eventCode)
        loadStats(eventCode)
        loadParticipantCounts(eventCode)
    }

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold">Seminar Analytics</h1>

                {/* Seminar Selector */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">Select Seminar:</label>
                    <select
                        className="border rounded-md p-2 min-w-[200px]"
                        value={selectedSeminar}
                        onChange={(e) => handleSeminarChange(e.target.value)}
                    >
                        {seminars.length === 0 && <option value="">No seminars found</option>}
                        {seminars.map((event) => (
                            <option key={event} value={event}>{event}</option>
                        ))}
                    </select>
                    <Button variant="outline" onClick={() => loadStats(selectedSeminar)}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Manual Participant Entry */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Participant Overview</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage and view manual participant counts</p>
                    </div>
                    <Button
                        onClick={handleSaveCounts}
                        disabled={saving}
                        className="bg-gray-900 hover:bg-gray-800 text-white shadow-md transition-all hover:translate-y-[-1px]"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {/* Paid */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-blue-600" />
                            Paid Participants
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={paidCount}
                                onChange={(e) => setPaidCount(parseInt(e.target.value) || 0)}
                                className="text-4xl font-bold h-20 text-center border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl bg-gray-50/50 transition-all hover:bg-white hover:border-blue-200"
                            />
                        </div>
                    </div>

                    {/* Sponsor */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Gift className="w-4 h-4 text-purple-600" />
                            Sponsor Participants
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={sponsorCount}
                                onChange={(e) => setSponsorCount(parseInt(e.target.value) || 0)}
                                className="text-4xl font-bold h-20 text-center border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 rounded-xl bg-gray-50/50 transition-all hover:bg-white hover:border-purple-200"
                            />
                        </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
                        <div className="relative z-10 flex items-center gap-2 opacity-90">
                            <Users className="w-5 h-5" />
                            <span className="text-sm font-semibold tracking-wide uppercase">Total Participants</span>
                        </div>
                        <div className="relative z-10 flex items-baseline gap-2 mt-2">
                            <span className="text-6xl font-bold tracking-tight">{paidCount + sponsorCount}</span>
                            <span className="text-xl opacity-80 font-medium">Pax</span>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {statsLoading ? (
                <div className="text-center py-12">Loading analytics...</div>
            ) : stats ? (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Day 1 Attendance */}
                        <Card>
                            <CardHeader className="pb-4 border-b">
                                <CardTitle className="text-base text-gray-700">Attendance Day 1</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-3 gap-4 text-center divide-x">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Paid</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.day1Paid}</p>
                                    <p className="text-xs text-gray-400">
                                        {paidCount ? ((stats.day1Paid / paidCount) * 100).toFixed(1) : '0.0'}%
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Sponsor</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.day1Sponsor}</p>
                                    <p className="text-xs text-gray-400">
                                        {sponsorCount ? ((stats.day1Sponsor / sponsorCount) * 100).toFixed(1) : '0.0'}%
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">All</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.day1Attendance}</p>
                                    <p className="text-xs text-gray-400">
                                        {(paidCount + sponsorCount) ? ((stats.day1Attendance / (paidCount + sponsorCount)) * 100).toFixed(1) : '0.0'}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Day 2 Attendance */}
                        <Card>
                            <CardHeader className="pb-4 border-b">
                                <CardTitle className="text-base text-gray-700">Attendance Day 2</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-3 gap-4 text-center divide-x">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Paid</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.day2Paid}</p>
                                    <p className="text-xs text-gray-400">
                                        {paidCount ? ((stats.day2Paid / paidCount) * 100).toFixed(1) : '0.0'}%
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Sponsor</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.day2Sponsor}</p>
                                    <p className="text-xs text-gray-400">
                                        {sponsorCount ? ((stats.day2Sponsor / sponsorCount) * 100).toFixed(1) : '0.0'}%
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">All</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.day2Attendance}</p>
                                    <p className="text-xs text-gray-400">
                                        {(paidCount + sponsorCount) ? ((stats.day2Attendance / (paidCount + sponsorCount)) * 100).toFixed(1) : '0.0'}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Breakdown Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* By Ticket Type */}
                        <Card>
                            <CardHeader>
                                <CardTitle>By Ticket Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {Object.entries(stats.byTicketType).map(([key, val]: any) => (
                                        <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                            <span>{key}</span>
                                            <span className="font-bold">{val}</span>
                                        </li>
                                    ))}
                                    {Object.keys(stats.byTicketType).length === 0 && <p className="text-gray-500">No data</p>}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* By Package */}
                        <Card>
                            <CardHeader>
                                <CardTitle>By Package</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {Object.entries(stats.byPackage).map(([key, val]: any) => (
                                        <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                            <span>{key}</span>
                                            <span className="font-bold">{val}</span>
                                        </li>
                                    ))}
                                    {Object.keys(stats.byPackage).length === 0 && <p className="text-gray-500">No data</p>}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* By Payment Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>By Payment Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {Object.entries(stats.byPayment).map(([key, val]: any) => (
                                        <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                            <span>{key}</span>
                                            <span className="font-bold">{val}</span>
                                        </li>
                                    ))}
                                    {Object.keys(stats.byPayment).length === 0 && <p className="text-gray-500">No data</p>}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* By Niche - Pie Chart */}
                        <Card className="col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>📊 By Niche</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(stats.byNiche).length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No data</p>
                                ) : (
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={Object.entries(stats.byNiche)
                                                        .sort(([, a]: any, [, b]: any) => b - a)
                                                        .slice(0, 10) // Top 10 only
                                                        .map(([name, value]) => ({ name, value }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }: any) => `${(name || '').slice(0, 15)}${(name || '').length > 15 ? '...' : ''} (${(percent * 100).toFixed(0)}%)`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {Object.entries(stats.byNiche).slice(0, 10).map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: number) => [`${value} orang`, 'Jumlah']} />
                                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* By State - Bar Chart */}
                        <Card className="col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>🗺️ By State</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {Object.keys(stats.byState).length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No data</p>
                                ) : (
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={Object.entries(stats.byState)
                                                    .sort(([, a]: any, [, b]: any) => b - a)
                                                    .slice(0, 10) // Top 10 only
                                                    .map(([name, value]) => ({ name, value }))}
                                                layout="vertical"
                                                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis type="number" />
                                                <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                                                <Tooltip formatter={(value: number) => [`${value} orang`, 'Jumlah']} />
                                                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                                                    {Object.entries(stats.byState).slice(0, 10).map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* By BDS Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>By BDS Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {Object.entries(stats.byBdsStatus).map(([key, val]: any) => (
                                        <li key={key} className="flex justify-between border-b pb-1 last:border-0">
                                            <span>{key}</span>
                                            <span className="font-bold">{val}</span>
                                        </li>
                                    ))}
                                    {Object.keys(stats.byBdsStatus).length === 0 && <p className="text-gray-500">No data</p>}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    Select a seminar to view analytics
                </div>
            )}
        </div>
    )
}
