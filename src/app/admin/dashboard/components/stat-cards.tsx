import { Users, CalendarCheck, TrendingUp, UserCheck } from 'lucide-react'

interface StatCardProps {
    icon: React.ElementType
    label: string
    value: string | number
    subtitle?: string
    color: string
}

function StatCard({ icon: Icon, label, value, subtitle, color }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-gray-500 font-medium">{label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
    )
}

interface OverviewStats {
    totalParticipants: number
    day1Attendance: number
    day2Attendance: number
    attendedCount: number
    attendanceRate: number
    paidCount: number
    sponsorCount: number
}

export function StatCards({ stats }: { stats: OverviewStats }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                icon={Users}
                label="Jumlah Peserta"
                value={stats.paidCount + stats.sponsorCount}
                subtitle={`${stats.paidCount} paid, ${stats.sponsorCount} sponsor`}
                color="bg-blue-600"
            />
            <StatCard
                icon={CalendarCheck}
                label="Hadir Hari 1"
                value={stats.day1Attendance}
                color="bg-green-600"
            />
            <StatCard
                icon={CalendarCheck}
                label="Hadir Hari 2"
                value={stats.day2Attendance}
                color="bg-purple-600"
            />
            <StatCard
                icon={UserCheck}
                label="Kadar Kehadiran"
                value={`${stats.attendanceRate}%`}
                subtitle={`${stats.attendedCount} unique hadir`}
                color="bg-amber-600"
            />
        </div>
    )
}
