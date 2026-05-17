import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AttendanceProps {
    day1Paid: number
    day1Sponsor: number
    day1Attendance: number
    day2Paid: number
    day2Sponsor: number
    day2Attendance: number
    paidCount: number
    sponsorCount: number
}

function AttendanceColumn({ label, value, total, color }: {
    label: string, value: number, total: number, color: string
}) {
    const pct = total ? ((value / total) * 100).toFixed(1) : '0.0'
    return (
        <div className="space-y-1 text-center">
            <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400">{pct}%</p>
        </div>
    )
}

export function AttendanceCards({ stats }: { stats: AttendanceProps }) {
    const total = stats.paidCount + stats.sponsorCount

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-base text-gray-700">Kehadiran Hari 1</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-3 gap-4 divide-x">
                    <AttendanceColumn label="Paid" value={stats.day1Paid} total={stats.paidCount} color="text-blue-600" />
                    <AttendanceColumn label="Sponsor" value={stats.day1Sponsor} total={stats.sponsorCount} color="text-purple-600" />
                    <AttendanceColumn label="Semua" value={stats.day1Attendance} total={total} color="text-gray-900" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-base text-gray-700">Kehadiran Hari 2</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-3 gap-4 divide-x">
                    <AttendanceColumn label="Paid" value={stats.day2Paid} total={stats.paidCount} color="text-blue-600" />
                    <AttendanceColumn label="Sponsor" value={stats.day2Sponsor} total={stats.sponsorCount} color="text-purple-600" />
                    <AttendanceColumn label="Semua" value={stats.day2Attendance} total={total} color="text-gray-900" />
                </CardContent>
            </Card>
        </div>
    )
}
