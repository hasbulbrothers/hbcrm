'use client'

import { useState, Suspense, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
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
    const [searched, setSearched] = useState(false)

    const handleSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery || searchQuery.length < 3) return

        setLoading(true)
        setError('')
        setParticipants([])
        setSearched(true)

        try {
            const res = await searchParticipant(searchQuery, eventCode)
            if (res.error) {
                setError(res.error)
            } else if (res.data) {
                setParticipants(res.data as Participant[])
            }
        } catch {
            setError('Carian gagal. Sila cuba semula.')
        } finally {
            setLoading(false)
        }
    }, [eventCode])

    useEffect(() => {
        if (query.length < 3) {
            if (participants.length > 0) {
                setParticipants([])
                setSearched(false)
            }
            return
        }
        const timer = setTimeout(() => {
            handleSearch(query)
        }, 400)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, handleSearch])

    const handleSelectParticipant = (participant: Participant) => {
        router.push(`/checkin/confirm?id=${participant.id}&day=${day}&event=${eventCode}`)
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Image src="/logo-gyb.png" alt="Logo" width={100} height={50} className="object-contain" />
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">Hari {day}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 pb-32">
                {/* Search */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white mb-1">Check-In Peserta</h1>
                    <p className="text-zinc-500 text-sm mb-4">Cari nama, no telefon atau email pembeli tiket</p>

                    <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Masukkan nama, no telefon atau email..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-all text-base"
                            autoFocus
                        />
                        {loading && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    <p className="text-sm text-green-400 mt-3 font-medium flex items-center gap-1.5">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        Lebih mudah &amp; cepat — masukkan no telefon anda
                    </p>
                    <p className="text-xs text-yellow-500/80 mt-2">
                        *Guna nama, no telefon atau email dari resit/invois pembelian tiket
                    </p>
                </div>

                {/* Receipt Example */}
                <button
                    onClick={() => {
                        const modal = document.getElementById('receipt-modal')
                        if (modal) modal.classList.remove('hidden')
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-zinc-300 hover:border-zinc-700 transition-all mb-6 text-sm"
                >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Lihat contoh resit
                </button>

                {/* Loading Skeleton */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 animate-pulse">
                                <div className="h-5 bg-zinc-800 rounded w-2/3 mb-3" />
                                <div className="h-3 bg-zinc-800 rounded w-1/2 mb-2" />
                                <div className="h-3 bg-zinc-800 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && searched && participants.length > 0 && (
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                            {participants.length} peserta dijumpai
                        </p>
                        <div className="space-y-2.5">
                            {participants.map((p) => {
                                const todayCheckin = p.checkins?.find(c => c.day === day)
                                const otherDayCheckin = p.checkins?.find(c => c.day !== day)
                                const isCheckedIn = !!todayCheckin
                                const attendCount = todayCheckin?.attend_count || 0

                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => handleSelectParticipant(p)}
                                        className={`w-full text-left rounded-xl p-4 transition-all active:scale-[0.98] ${isCheckedIn
                                            ? 'bg-green-950/40 border border-green-800/60 hover:border-green-700'
                                            : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-600'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-white text-base truncate">{p.name}</p>
                                                <p className="text-zinc-500 text-sm mt-0.5">{p.phone}</p>
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {(p.ticket_type || 'General').split(/(?=\d+\.\s)/).filter(Boolean).map((item, idx) => (
                                                        <span key={idx} className="inline-block text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                                                            {item.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex flex-col items-end gap-1.5">
                                                {isCheckedIn ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-600 text-white">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        Hadir ({attendCount})
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-500">
                                                        Belum hadir
                                                    </span>
                                                )}
                                                {otherDayCheckin && (
                                                    <span className="text-xs text-yellow-500/70">
                                                        Hari {otherDayCheckin.day} hadir
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && searched && participants.length === 0 && !error && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
                            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-zinc-400 font-medium">Tiada peserta dijumpai</p>
                        <p className="text-zinc-600 text-sm mt-1">Cuba semak nama, no telefon atau email dari resit</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-4 mt-4">
                        <p className="text-red-400 text-sm font-medium">Ralat</p>
                        <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            <div
                id="receipt-modal"
                className="hidden fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                onClick={(e) => {
                    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden')
                }}
            >
                <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Contoh Resit</h3>
                        <button className="text-gray-500 hover:text-gray-700 text-2xl leading-none" onClick={() => document.getElementById('receipt-modal')?.classList.add('hidden')}>
                            &times;
                        </button>
                    </div>
                    <div className="p-4">
                        <Image src="/receipt-example.png" alt="Contoh Resit" width={500} height={600} className="w-full h-auto" />
                        <p className="text-sm text-gray-600 mt-4 text-center">
                            Guna nama atau no telefon dari bahagian &quot;KEPADA&quot; dalam resit anda.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CheckInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <CheckInContent />
        </Suspense>
    )
}
