'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { getParticipantById } from './actions'
import { submitCheckIn, updateCheckIn } from '../../actions'

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
    niche?: string
    state?: string
    checkins?: CheckIn[]
}

function ConfirmContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const participantId = searchParams.get('id') || ''
    const day = parseInt(searchParams.get('day') || '1')
    const eventCode = searchParams.get('event') || 'default-event'

    const [participant, setParticipant] = useState<Participant | null>(null)
    const [loading, setLoading] = useState(true)
    const [count, setCount] = useState(1)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [isUpdateMode, setIsUpdateMode] = useState(false)
    const [showCheck, setShowCheck] = useState(false)

    const fetchParticipant = useCallback(async () => {
        if (!participantId) {
            router.push('/checkin')
            return
        }
        try {
            const res = await getParticipantById(participantId)
            if (res.data) {
                const p = res.data as Participant
                setParticipant(p)

                const existingCheckin = p.checkins?.find(c => c.day === day)
                if (existingCheckin) {
                    setIsUpdateMode(true)
                    setCount(existingCheckin.attend_count)
                }
            } else {
                setError(res.error || 'Peserta tidak dijumpai.')
            }
        } catch {
            setError('Gagal memuatkan data. Sila cuba semula.')
        } finally {
            setLoading(false)
        }
    }, [participantId, router, day])

    useEffect(() => {
        fetchParticipant()
    }, [fetchParticipant])

    useEffect(() => {
        if (success) {
            setTimeout(() => setShowCheck(true), 100)
        }
    }, [success])

    const isSponsor = participant?.ticket_type?.toLowerCase().includes('sponsor')
    const totalAttendance = count

    const handleSubmit = async () => {
        if (totalAttendance === 0) {
            setError('Sila pilih sekurang-kurangnya 1 peserta.')
            return
        }

        setSubmitting(true)
        setError('')

        const res = isUpdateMode
            ? await updateCheckIn(participantId, day, totalAttendance)
            : await submitCheckIn(participantId, eventCode, day, totalAttendance)

        if (res.error) {
            setError(res.error)
            setSubmitting(false)
        } else {
            setSuccess(true)
            setSubmitting(false)
        }
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <div className="max-w-md mx-auto px-4 pt-20">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-zinc-800 rounded w-1/3 mx-auto" />
                        <div className="h-4 bg-zinc-800 rounded w-1/4 mx-auto" />
                        <div className="mt-6 rounded-xl bg-zinc-900 border border-zinc-800 p-6">
                            <div className="h-6 bg-zinc-800 rounded w-2/3 mb-4" />
                            <div className="h-4 bg-zinc-800 rounded w-1/2 mb-2" />
                            <div className="h-4 bg-zinc-800 rounded w-1/3 mb-2" />
                            <div className="h-4 bg-zinc-800 rounded w-2/3" />
                        </div>
                        <div className="h-12 bg-zinc-800 rounded-xl" />
                    </div>
                </div>
            </div>
        )
    }

    // Success screen with animation
    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center">
                    {/* Animated Checkmark */}
                    <div className={`mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${showCheck ? 'scale-100 opacity-100' : 'scale-50 opacity-0'} ${isSponsor ? 'bg-blue-600' : 'bg-green-600'}`}>
                        <svg className={`w-12 h-12 text-white transition-all duration-300 delay-300 ${showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h2 className={`text-3xl font-bold text-white mb-2 transition-all duration-500 delay-200 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        {isUpdateMode ? 'Dikemaskini!' : 'Berjaya!'}
                    </h2>
                    <p className={`text-zinc-400 mb-8 transition-all duration-500 delay-300 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        Check-in telah {isUpdateMode ? 'dikemaskini' : 'disahkan'}
                    </p>

                    <div className={`rounded-xl ${isSponsor ? 'bg-zinc-900 border border-zinc-800' : 'bg-green-950/40 border border-green-800/40'} p-5 text-left mb-6 transition-all duration-500 delay-400 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <p className="font-semibold text-white text-lg">{participant?.name}</p>
                        <div className="mt-3 space-y-1.5 text-sm">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Tiket</span>
                                <span className="text-zinc-300">{participant?.ticket_type || 'General'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Hari</span>
                                <span className="text-zinc-300">Hari {day}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Kehadiran</span>
                                <span className="text-white font-semibold">{totalAttendance} orang</span>
                            </div>
                        </div>
                    </div>

                    {isSponsor ? (
                        <div className={`rounded-xl bg-blue-950/30 border border-blue-800/30 p-4 mb-6 text-left transition-all duration-500 delay-500 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <p className="text-blue-300 text-sm font-medium">Tiket Sponsor</p>
                            <p className="text-blue-300/70 text-sm mt-1">Tiada workbook dan bonus. Boleh terus naik ke level 20.</p>
                        </div>
                    ) : (
                        <div className={`rounded-xl bg-yellow-950/30 border border-yellow-800/30 p-4 mb-6 text-left transition-all duration-500 delay-500 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <p className="text-yellow-300 text-sm font-medium">Sila ambil workbook & bonus</p>
                            <p className="text-yellow-300/70 text-sm mt-1">Tunjukkan bukti check-in ini kepada staff di meja pendaftaran.</p>
                        </div>
                    )}

                    <button
                        onClick={() => router.push(`/checkin?day=${day}&event=${eventCode}`)}
                        className={`w-full h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-all duration-500 delay-500 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                    >
                        Selesai
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
                    <button onClick={() => router.back()} className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-white font-semibold text-sm">
                            {isUpdateMode ? 'Kemaskini Kehadiran' : 'Sahkan Kehadiran'}
                        </h1>
                        <p className="text-zinc-500 text-xs">Hari {day}</p>
                    </div>
                    {isUpdateMode && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-900/30 text-yellow-500 border border-yellow-800/30">
                            Sudah check-in
                        </span>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 pb-32">
                {/* Participant Card */}
                <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 mb-6">
                    <p className="text-xl font-bold text-white">{participant?.name}</p>
                    <p className="text-zinc-500 text-sm mt-1">{participant?.phone}</p>

                    <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Tiket</span>
                            <div className="text-right">
                                {(participant?.ticket_type || 'General').split(/(?=\d+\.\s)/).filter(Boolean).map((item, idx) => (
                                    <p key={idx} className="text-zinc-300 leading-tight">{item.trim()}</p>
                                ))}
                            </div>
                        </div>
                        {participant?.email && (
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Emel</span>
                                <span className="text-zinc-300">{participant.email}</span>
                            </div>
                        )}
                        {participant?.niche && (
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Niche</span>
                                <span className="text-zinc-300">{participant.niche}</span>
                            </div>
                        )}
                        {participant?.state && (
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Negeri</span>
                                <span className="text-zinc-300">{participant.state}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Attendance Counter — satu kaunter mudah, default 1 */}
                <div className="mb-6">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Berapa orang hadir?</p>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map(num => (
                            <button
                                key={num}
                                onClick={() => setCount(num)}
                                className={`h-14 rounded-xl text-lg font-semibold transition-all ${count === num
                                    ? 'bg-green-600 text-white scale-105 shadow-lg shadow-green-600/20'
                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-zinc-600 mt-2">Default 1 — tekan nombor lain kalau bawa lebih ramai.</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-4 mb-6">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={submitting || totalAttendance === 0}
                    className={`w-full h-14 rounded-xl font-semibold text-base transition-all ${totalAttendance === 0
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        : isUpdateMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.98]'
                            : 'bg-green-600 hover:bg-green-700 text-white active:scale-[0.98]'
                    }`}
                >
                    {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Memproses...</span>
                        </div>
                    ) : (
                        isUpdateMode ? `Kemaskini (${totalAttendance} orang)` : `Sahkan Check-in (${totalAttendance} orang)`
                    )}
                </button>
            </div>
        </div>
    )
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ConfirmContent />
        </Suspense>
    )
}
