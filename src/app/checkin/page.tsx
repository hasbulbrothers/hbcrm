'use client'

import { useState, Suspense, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { searchParticipant } from '../actions'

interface CheckIn {
    day: number
    attend_count: number
    status: string
}

interface Participant {
    id: string
    name: string
    phone: string
    email?: string
    ticket_type?: string
    checkins?: CheckIn[]
}

function CheckInContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const eventCode = searchParams.get('event') || 'default-event'
    const day = parseInt(searchParams.get('day') || '1')

    const [query, setQuery] = useState('')
    const [participants, setParticipants] = useState<Participant[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery) return

        setLoading(true)
        setError('')
        setParticipants([])

        const res = await searchParticipant(searchQuery, eventCode)

        if (res.error) {
            setError(res.error)
        } else if (res.data) {
            setParticipants(res.data as Participant[])
        }
        setLoading(false)
    }, [eventCode])

    // Auto-search effect - using debounce pattern that avoids direct setState in effect body
    useEffect(() => {
        // Reset participants when query becomes too short
        if (query.length < 8) {
            if (participants.length > 0) {
                // Use functional update to avoid triggering re-render loop
                setParticipants(prev => prev.length > 0 ? [] : prev)
            }
            return
        }

        const timer = setTimeout(() => {
            handleSearch(query)
        }, 500)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, handleSearch])

    const handleSelectParticipant = (participant: Participant) => {
        // Navigate to confirm page with participant ID
        router.push(`/checkin/confirm?id=${participant.id}&day=${day}&event=${eventCode}`)
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Image src="/logo.png" alt="9X Growth Logo" width={150} height={80} className="object-contain" />
                    </div>
                    <CardTitle className="text-center text-white">Check-In Event</CardTitle>
                    <p className="text-center text-gray-400">Day {day} | Code: {eventCode}</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(query) }} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Search Participant (Name / Phone)</label>
                            <Input
                                placeholder="Enter name or phone..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </Button>

                        {/* Note about using buyer's info */}
                        <p className="text-xs text-yellow-400 text-center mt-3">
                            *Sila masukkan nama atau no telefon pembeli tiket bukan details peserta. Nama atau no telefon yang digunakan di resit/invois. Selepas masukkan data pembeli akan keluar berapa total tiket yang tuan/puan beli.
                        </p>

                        {/* Receipt example button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-2 border-zinc-600 text-gray-300 hover:bg-zinc-800 hover:text-white"
                            onClick={() => {
                                const modal = document.getElementById('receipt-modal')
                                if (modal) modal.classList.remove('hidden')
                            }}
                        >
                            📄 Lihat Contoh Resit
                        </Button>
                    </form>

                    {/* Receipt Example Modal */}
                    <div
                        id="receipt-modal"
                        className="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                e.currentTarget.classList.add('hidden')
                            }
                        }}
                    >
                        <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="font-bold text-gray-900">Contoh Resit</h3>
                                <button
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                    onClick={() => {
                                        const modal = document.getElementById('receipt-modal')
                                        if (modal) modal.classList.add('hidden')
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="p-4">
                                <Image
                                    src="/receipt-example.png"
                                    alt="Contoh Resit"
                                    width={500}
                                    height={600}
                                    className="w-full h-auto"
                                />
                                <p className="text-sm text-gray-600 mt-4 text-center">
                                    Guna nama atau no telefon dari bahagian &quot;KEPADA&quot; dalam resit anda.
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && <Alert variant="destructive" className="mt-4 bg-red-900 border-red-800 text-white"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

                    {participants.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <p className="font-semibold text-sm text-gray-400">Select Your Name:</p>
                            {participants.map((p) => {
                                // Check attendance for current day
                                const todayCheckin = p.checkins?.find(c => c.day === day)
                                const isCheckedIn = !!todayCheckin
                                const attendCount = todayCheckin?.attend_count || 0

                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => handleSelectParticipant(p)}
                                        className={`bg-zinc-800 border rounded-lg p-4 cursor-pointer transition-all ${isCheckedIn
                                            ? 'border-green-600 bg-zinc-800/80 hover:bg-zinc-700'
                                            : 'border-zinc-700 hover:bg-zinc-700 hover:border-green-600'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-bold text-lg text-white">{p.name}</p>
                                                <div className="text-sm text-gray-400 mt-1 space-y-1">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(p.ticket_type || 'General').split(/(?=\d+\.\s)/).filter(Boolean).map((item, idx) => (
                                                            <span key={idx} className="block">{item.trim()}</span>
                                                        ))}
                                                    </div>
                                                    <p>{p.phone}</p>
                                                </div>
                                                {p.email && <p className="text-xs text-gray-500 mt-1">{p.email}</p>}
                                            </div>

                                            {/* Attendance Status Badge */}
                                            <div className="flex flex-col items-end gap-2">
                                                {isCheckedIn ? (
                                                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                        ✓ Hadir ({attendCount} orang)
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                                                        Belum Hadir
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function CheckInPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckInContent />
        </Suspense>
    )
}
