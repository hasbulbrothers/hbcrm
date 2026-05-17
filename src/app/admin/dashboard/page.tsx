/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getSeminars, updateSeminarStats } from '../actions'
import { getDashboardData } from './actions'
import { StatCards } from './components/stat-cards'
import { AttendanceCards } from './components/attendance-cards'
import { BreakdownCard } from './components/breakdown-cards'
import { ParticipantInput } from './components/participant-input'
import { DashboardSkeleton } from './components/skeleton'
import { toast } from 'sonner'

export default function AdminDashboard() {
    const [seminars, setSeminars] = useState<string[]>([])
    const [selectedSeminar, setSelectedSeminar] = useState('')
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [paidCount, setPaidCount] = useState(0)
    const [sponsorCount, setSponsorCount] = useState(0)
    const [saving, setSaving] = useState(false)

    async function loadAll(eventCode: string) {
        const res = await getDashboardData(eventCode)
        if (res.success) {
            setStats(res.stats)
            setPaidCount(res.paidCount || 0)
            setSponsorCount(res.sponsorCount || 0)
        }
    }

    useEffect(() => {
        async function init() {
            const res = await getSeminars()
            if (res.success && res.events && res.events.length > 0) {
                setSeminars(res.events)
                const first = res.events[0]
                setSelectedSeminar(first)
                await loadAll(first)
            }
            setLoading(false)
        }
        init()
    }, [])

    async function handleSeminarChange(code: string) {
        setSelectedSeminar(code)
        setRefreshing(true)
        await loadAll(code)
        setRefreshing(false)
    }

    async function handleRefresh() {
        setRefreshing(true)
        await loadAll(selectedSeminar)
        setRefreshing(false)
        toast.success('Data dikemaskini')
    }

    async function handleSaveCounts() {
        setSaving(true)
        await updateSeminarStats(selectedSeminar, paidCount, sponsorCount)
        await loadAll(selectedSeminar)
        setSaving(false)
        toast.success('Jumlah peserta disimpan')
    }

    if (loading) return <DashboardSkeleton />

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Overview & analytics seminar</p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium min-w-[180px]"
                        value={selectedSeminar}
                        onChange={(e) => handleSeminarChange(e.target.value)}
                    >
                        {seminars.length === 0 && <option value="">Tiada seminar</option>}
                        {seminars.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} className="h-10 w-10">
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {stats ? (
                <>
                    <StatCards stats={{ ...stats, paidCount, sponsorCount }} />
                    <ParticipantInput
                        paidCount={paidCount}
                        sponsorCount={sponsorCount}
                        saving={saving}
                        onPaidChange={setPaidCount}
                        onSponsorChange={setSponsorCount}
                        onSave={handleSaveCounts}
                    />
                    <AttendanceCards stats={{ ...stats, paidCount, sponsorCount }} />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <BreakdownCard title="Mengikut Jenis Tiket" data={stats.byTicketType || {}} />
                        <BreakdownCard title="Mengikut Package" data={stats.byPackage || {}} />
                        <BreakdownCard title="Mengikut Payment" data={stats.byPayment || {}} />
                        <BreakdownCard title="Mengikut Niche" data={stats.byNiche || {}} />
                        <BreakdownCard title="Mengikut Negeri" data={stats.byState || {}} />
                        <BreakdownCard title="Mengikut BDS Status" data={stats.byBdsStatus || {}} />
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-gray-400">Pilih seminar untuk lihat data</div>
            )}
        </div>
    )
}
