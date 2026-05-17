'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, Gift } from 'lucide-react'

interface Props {
    paidCount: number
    sponsorCount: number
    saving: boolean
    onPaidChange: (val: number) => void
    onSponsorChange: (val: number) => void
    onSave: () => void
}

export function ParticipantInput({ paidCount, sponsorCount, saving, onPaidChange, onSponsorChange, onSave }: Props) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Bilangan Peserta</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Input manual jumlah peserta berdaftar</p>
                </div>
                <Button onClick={onSave} disabled={saving} size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                    {saving ? 'Saving...' : 'Simpan'}
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                        Paid
                    </label>
                    <Input
                        type="number"
                        value={paidCount}
                        onChange={(e) => onPaidChange(parseInt(e.target.value) || 0)}
                        className="text-3xl font-bold h-16 text-center rounded-xl bg-gray-50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-purple-600" />
                        Sponsor
                    </label>
                    <Input
                        type="number"
                        value={sponsorCount}
                        onChange={(e) => onSponsorChange(parseInt(e.target.value) || 0)}
                        className="text-3xl font-bold h-16 text-center rounded-xl bg-gray-50"
                    />
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 opacity-90">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase">Jumlah</span>
                    </div>
                    <span className="text-4xl font-bold">{paidCount + sponsorCount}</span>
                </div>
            </div>
        </div>
    )
}
