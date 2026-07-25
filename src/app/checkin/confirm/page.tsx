'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
    total_sales?: string | number | null
    checkins?: CheckIn[]
}

// Day 2 afternoon split. Hall 2 (Boardroom) is for monthly sales ABOVE RM80,000 —
// i.e. the "RM80,000 - RM200,000", "RM200,000 - RM500,000" and "RM500,000 keatas"
// bands. Everyone else, including "RM30,000 - RM80,000", goes to Hall 1.
const HALL_2_THRESHOLD = 80_000

// Highest ringgit figure mentioned in the free-text band.
// "RM80,000 - RM200,000" -> 200000, "70k" -> 70000. Null when no figure is present.
function highestFigure(s: string): number | null {
    const kFigures = [...s.matchAll(/(\d+(?:\.\d+)?)\s*k/g)].map(m => parseFloat(m[1]) * 1000)
    if (kFigures.length > 0) return Math.max(...kFigures)
    const rawNumbers = [...s.matchAll(/(\d{3,})/g)].map(m => parseFloat(m[1]))
    if (rawNumbers.length > 0) return Math.max(...rawNumbers)
    return null
}

// Afternoon "Business Scaling & Expansion Boardroom" segment: above RM80,000.
// A band whose top end is exactly 80K ("RM30,000 - RM80,000") stays in Hall 1.
function inBoardroomSegment(totalSales?: string | number | null): boolean {
    if (totalSales === null || totalSales === undefined) return false
    const s = String(totalSales).toLowerCase().replace(/,/g, '') // strip thousands separators (RM100,000)
    // "Bawah RM100k" style labels are a ceiling, never a Boardroom figure.
    if (/(bawah|kurang|below|under|<)/.test(s)) return false
    const hasAbove = /(ke\s*atas|keatas|above|melebihi|\+)/.test(s)
    const max = highestFigure(s)
    if (max === null) return false
    return max > HALL_2_THRESHOLD || (hasAbove && max >= HALL_2_THRESHOLD)
}

// A hall can only be assigned once total_sales is actually on record.
// Blank means the participant has to declare it at the registration desk.
function hasSalesBand(totalSales?: string | number | null): boolean {
    return totalSales !== null && totalSales !== undefined && String(totalSales).trim() !== ''
}

// Afternoon "Sales Growth Breakthrough" segment: everyone with a recorded band who
// is not in the Boardroom — RM80,000 and below, plus those just starting out.
// Mutually exclusive with inBoardroomSegment by construction.
function inAfternoonSegment(totalSales?: string | number | null): boolean {
    if (!hasSalesBand(totalSales)) return false
    return !inBoardroomSegment(totalSales)
}

function ConfirmContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const participantId = searchParams.get('id') || ''
    const day = parseInt(searchParams.get('day') || '1')
    const eventCode = searchParams.get('event') || 'default-event'

    const [participant, setParticipant] = useState<Participant | null>(null)
    const [loading, setLoading] = useState(true)
    const [generalCount, setGeneralCount] = useState(0)
    const [vipCount, setVipCount] = useState(0)
    const [sponsorCount, setSponsorCount] = useState(1)
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

                // Detect which ticket types this participant bought
                const tt = (p.ticket_type || '').toLowerCase()
                const hasSponsor = tt.includes('sponsor')
                const hasGeneral = tt.includes('general')
                const hasVip = tt.includes('vip')
                const showGeneral = hasGeneral || (!hasSponsor && !hasVip) // fallback: unknown ticket = general

                const existingCheckin = p.checkins?.find(c => c.day === day)
                if (existingCheckin) {
                    setIsUpdateMode(true)
                    // Existing total goes into the primary counter for this ticket
                    if (hasSponsor) setSponsorCount(existingCheckin.attend_count)
                    else if (showGeneral) setGeneralCount(existingCheckin.attend_count)
                    else if (hasVip) setVipCount(existingCheckin.attend_count)
                } else {
                    // Sensible default of 1 on the relevant counter
                    if (hasSponsor) setSponsorCount(1)
                    else if (showGeneral) setGeneralCount(1)
                    else if (hasVip) setVipCount(1)
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

    const ticketStr = (participant?.ticket_type || '').toLowerCase()
    const hasSponsor = ticketStr.includes('sponsor')
    const hasGeneral = ticketStr.includes('general')
    const hasVip = ticketStr.includes('vip')
    const showGeneral = hasGeneral || (!hasSponsor && !hasVip) // fallback: unknown ticket = general
    const isSponsor = hasSponsor
    const totalAttendance = isSponsor
        ? sponsorCount
        : (showGeneral ? generalCount : 0) + (hasVip ? vipCount : 0)

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

                    {day === 2 && inAfternoonSegment(participant?.total_sales) && (
                        <div className={`rounded-xl border-2 border-green-600 bg-green-950/40 p-4 text-left mb-6 shadow-lg shadow-green-900/30 transition-all duration-500 delay-300 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <p className="text-xs text-green-400 uppercase tracking-wider font-semibold">Sesi Petang</p>
                            <p className="text-white font-bold text-lg mt-1">Sales Growth Breakthrough Session</p>
                            <div className="flex items-center gap-1.5 mt-2.5 text-green-300 text-base">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span>Dewan: <span className="font-bold text-white">Hall 1</span></span>
                            </div>
                        </div>
                    )}

                    {day === 2 && inBoardroomSegment(participant?.total_sales) && (
                        <div className={`rounded-xl border-2 border-blue-600 bg-blue-950/40 p-4 text-left mb-6 shadow-lg shadow-blue-900/30 transition-all duration-500 delay-300 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold">Sesi Petang</p>
                            <p className="text-white font-bold text-lg mt-1">Business Scaling &amp; Expansion Boardroom Session</p>
                            <div className="flex items-center gap-1.5 mt-2.5 text-blue-300 text-base">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span>Dewan: <span className="font-bold text-white">Hall 2</span></span>
                            </div>
                        </div>
                    )}

                    {day === 2 && !hasSalesBand(participant?.total_sales) && (
                        <div className={`rounded-xl border-2 border-amber-500 bg-amber-950/40 p-4 text-left mb-6 shadow-lg shadow-amber-900/30 transition-all duration-500 delay-300 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black text-sm font-bold">!</span>
                                <p className="text-xs text-amber-400 uppercase tracking-wider font-semibold">Tindakan Diperlukan</p>
                            </div>
                            <p className="text-white font-bold text-lg mt-2">Sila ke Meja Pendaftaran</p>
                            <p className="text-amber-100/90 text-sm mt-2 leading-relaxed">
                                Rujuk staf kami di meja pendaftaran untuk <span className="font-semibold text-white">claim tiket</span> anda
                                dan maklumkan <span className="font-semibold text-white">purata sales bulanan</span> anda.
                            </p>
                            <p className="text-amber-200/70 text-xs mt-1.5">
                                Maklumat ini diperlukan untuk kami tempatkan anda di sesi petang yang bersesuaian.
                            </p>
                        </div>
                    )}

                    <div className={`rounded-xl ${isSponsor ? 'bg-zinc-900 border border-zinc-800' : 'bg-green-950/40 border border-green-800/40'} p-5 text-left mb-6 transition-all duration-500 delay-400 ${showCheck ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <p className="font-semibold text-white text-lg">{participant?.name}</p>
                        <div className="mt-3 space-y-1.5 text-sm">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-zinc-500">Tiket</span>
                                <div className="text-zinc-300">
                                    {(participant?.ticket_type || 'General').split(/(?=\d+\.\s)/).filter(Boolean).map((item, idx) => (
                                        <p key={idx} className="leading-snug">{item.trim()}</p>
                                    ))}
                                </div>
                            </div>
                            {day === 2 && participant?.total_sales && (
                                <div className="flex justify-between gap-3">
                                    <span className="text-zinc-500 shrink-0">Purata Sales Bulanan</span>
                                    <span className="text-zinc-300 text-right">{participant.total_sales}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Hari</span>
                                <span className="text-zinc-300">Hari {day}</span>
                            </div>
                            {!isSponsor && showGeneral && hasVip && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">General hadir</span>
                                        <span className="text-zinc-300">{generalCount} orang</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">VIP hadir</span>
                                        <span className="text-zinc-300">{vipCount} orang</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Kehadiran</span>
                                <span className="text-white font-semibold">{totalAttendance} orang</span>
                            </div>
                        </div>
                    </div>

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
                    </div>
                </div>

                {/* Attendance Counter — ikut jenis tiket peserta */}
                <div className="mb-6">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Berapa orang hadir?</p>

                    {isSponsor ? (
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setSponsorCount(num)}
                                    className={`h-14 rounded-xl text-lg font-semibold transition-all ${sponsorCount === num
                                        ? 'bg-yellow-600 text-white scale-105 shadow-lg shadow-yellow-600/20'
                                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {showGeneral && (
                                <div>
                                    <p className="text-sm text-zinc-400 mb-2">Tiket General</p>
                                    <div className="grid grid-cols-6 gap-2">
                                        {[0, 1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => setGeneralCount(num)}
                                                className={`h-12 rounded-xl text-base font-semibold transition-all ${generalCount === num
                                                    ? 'bg-blue-600 text-white scale-105 shadow-lg shadow-blue-600/20'
                                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {hasVip && (
                                <div>
                                    <p className="text-sm text-zinc-400 mb-2">Tiket VIP</p>
                                    <div className="grid grid-cols-6 gap-2">
                                        {[0, 1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => setVipCount(num)}
                                                className={`h-12 rounded-xl text-base font-semibold transition-all ${vipCount === num
                                                    ? 'bg-purple-600 text-white scale-105 shadow-lg shadow-purple-600/20'
                                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {showGeneral && hasVip && (
                                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                                    <span className="text-zinc-500 text-sm">Jumlah kehadiran</span>
                                    <span className="text-white text-xl font-bold">{generalCount + vipCount}</span>
                                </div>
                            )}
                        </div>
                    )}
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
