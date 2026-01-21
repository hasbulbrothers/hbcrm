/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, DollarSign, Gift } from 'lucide-react'
import { getSeminars, getSeminarAnalytics, getSeminarStats, updateSeminarStats, getDay1AttendanceBreakdown } from '../actions'
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

    // Day 1 attendance breakdown
    const [day1Breakdown, setDay1Breakdown] = useState<any>(null)

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

    async function loadDay1Breakdown(eventCode: string) {
        const res = await getDay1AttendanceBreakdown(eventCode)
        if (res.success && res.data) {
            setDay1Breakdown(res.data)
        }
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
                await loadDay1Breakdown(firstEvent)
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
        loadDay1Breakdown(eventCode)
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

                    {/* Summary Attendance Day 1 */}
                    {day1Breakdown && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-800">📊 Summary Attendance Day 1</h2>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Chart 1: By Sales - Full Width Pie Chart */}
                                <Card className="lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle className="text-base">Kehadiran By Sales</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {Object.keys(day1Breakdown.bySales).length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No data</p>
                                        ) : (
                                            <div className="h-96">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={Object.entries(day1Breakdown.bySales)
                                                                .sort(([, a]: any, [, b]: any) => b - a)
                                                                .map(([name, value]: any) => ({
                                                                    name,
                                                                    value,
                                                                    percent: day1Breakdown.totalAttendance ? ((value / day1Breakdown.totalAttendance) * 100).toFixed(1) : 0
                                                                }))}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={true}
                                                            label={({ name, percent }: any) => `${name} (${percent}%)`}
                                                            outerRadius={120}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {Object.entries(day1Breakdown.bySales).map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value: any, name: any, props: any) => [
                                                            `${value} orang (${props.payload.percent}%)`,
                                                            'Hadir'
                                                        ]} />
                                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Chart 2: By Niche - Full Width Pie Chart */}
                                <Card className="lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle className="text-base">Kehadiran By Niche</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {Object.keys(day1Breakdown.byNiche).length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No data</p>
                                        ) : (
                                            <div className="h-96">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={Object.entries(day1Breakdown.byNiche)
                                                                .sort(([, a]: any, [, b]: any) => b - a)
                                                                .slice(0, 10)
                                                                .map(([name, value]: any) => ({
                                                                    name,
                                                                    value,
                                                                    percent: day1Breakdown.totalAttendance ? ((value / day1Breakdown.totalAttendance) * 100).toFixed(1) : 0
                                                                }))}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={true}
                                                            label={({ name, percent }: any) => `${name} (${percent}%)`}
                                                            outerRadius={120}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {Object.entries(day1Breakdown.byNiche).slice(0, 10).map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value: any, name: any, props: any) => [
                                                            `${value} orang (${props.payload.percent}%)`,
                                                            'Hadir'
                                                        ]} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Chart 3: By State with Percentage */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Kehadiran By Negeri (%)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {Object.keys(day1Breakdown.byState).length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No data</p>
                                        ) : (
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={Object.entries(day1Breakdown.byState)
                                                            .sort(([, a]: any, [, b]: any) => b - a)
                                                            .slice(0, 8)
                                                            .map(([name, value]: any) => ({
                                                                name,
                                                                value,
                                                                percent: day1Breakdown.totalAttendance ? ((value / day1Breakdown.totalAttendance) * 100).toFixed(1) : 0
                                                            }))}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis type="number" />
                                                        <YAxis type="category" dataKey="name" width={50} tick={{ fontSize: 11 }} />
                                                        <Tooltip formatter={(value: any, name: any, props: any) => [
                                                            `${value} orang (${props.payload.percent}%)`,
                                                            'Hadir'
                                                        ]} />
                                                        <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]}>
                                                            {Object.entries(day1Breakdown.byState).slice(0, 8).map((_, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Breakdown Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
