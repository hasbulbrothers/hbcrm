'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    const [isAttending, setIsAttending] = useState(false)
    const [attendCount, setAttendCount] = useState(1) // For sponsor tickets
    const [generalCount, setGeneralCount] = useState(0) // For paid tickets - General
    const [vipCount, setVipCount] = useState(0) // For paid tickets - VIP
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [isUpdateMode, setIsUpdateMode] = useState(false) // Track if updating existing check-in

    const fetchParticipant = useCallback(async () => {
        if (!participantId) {
            router.push('/checkin')
            return
        }
        const res = await getParticipantById(participantId)
        if (res.data) {
            const p = res.data as Participant
            setParticipant(p)

            // Check if already checked in for this day
            const existingCheckin = p.checkins?.find(c => c.day === day)
            if (existingCheckin) {
                setIsUpdateMode(true)
                setIsAttending(true)
                setAttendCount(existingCheckin.attend_count)
                // For paid tickets, set the count to general by default
                setGeneralCount(existingCheckin.attend_count)
            }
        } else {
            setError('Participant not found.')
        }
        setLoading(false)
    }, [participantId, router, day])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchParticipant()
    }, [fetchParticipant])

    const handleSubmit = async () => {
        if (!isAttending) {
            setError('Please confirm your attendance.')
            return
        }

        // Calculate total based on ticket type
        const isSponsor = participant?.ticket_type?.toLowerCase().includes('sponsor')
        const totalAttendance = isSponsor ? attendCount : (generalCount + vipCount)

        if (totalAttendance === 0) {
            setError('Please select at least 1 attendee.')
            return
        }

        setSubmitting(true)
        setError('')

        let res
        if (isUpdateMode) {
            // Update existing check-in
            res = await updateCheckIn(participantId, day, totalAttendance)
        } else {
            // New check-in
            res = await submitCheckIn(participantId, eventCode, day, totalAttendance)
        }

        if (res.error) {
            setError(res.error)
            setSubmitting(false)
        } else {
            setSuccess(true)
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <p>Loading...</p>
            </div>
        )
    }

    if (success) {
        const isSponsor = participant?.ticket_type?.toLowerCase().includes('sponsor')
        const totalAttendance = isSponsor ? attendCount : (generalCount + vipCount)

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
                <Card className={`w-full max-w-md text-center border-none ${isSponsor ? 'bg-zinc-900 border-zinc-800' : 'bg-green-800 border-green-700'}`}>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-white">✓ Congratulations!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className={`text-xl ${isSponsor ? 'text-white' : 'text-green-100'}`}>Check-in Successful</p>
                        <div className={`${isSponsor ? 'bg-zinc-800' : 'bg-green-700'} p-4 rounded text-left text-white`}>
                            <p><strong>Name:</strong> {participant?.name}</p>
                            <p><strong>Tiket:</strong> {participant?.ticket_type || 'General'}</p>
                            <p><strong>Day:</strong> Day {day}</p>

                            {/* Attendance Breakdown */}
                            <div className="mt-3 pt-3 border-t border-white/20">
                                <p className="font-semibold mb-2">Kehadiran:</p>
                                {isSponsor ? (
                                    <p>Sponsor: <strong>{attendCount}</strong> orang</p>
                                ) : (
                                    <div className="space-y-1">
                                        {generalCount > 0 && (
                                            <p>Tiket General: <strong>{generalCount}</strong> orang</p>
                                        )}
                                        {vipCount > 0 && (
                                            <p>Tiket VIP: <strong>{vipCount}</strong> orang</p>
                                        )}
                                        <p className="text-sm opacity-80 mt-1">Jumlah: <strong>{totalAttendance}</strong> orang</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isSponsor ? (
                            <div className="bg-blue-600 p-4 rounded text-white mt-4">
                                <p className="font-semibold text-lg">Terima kasih untuk pendaftaran. </p>
                                <p className="mt-2 text-sm">Untuk tiket sponsor tiada sebarang workbook dan bonus. Boleh terus naik ke level 20.</p>
                            </div>
                        ) : (
                            <div className="bg-yellow-500 p-4 rounded text-black mt-4 space-y-2">
                                <p className="font-semibold text-lg">📖 Sila ambil/claim workbook dan bonus lain di meja pendaftaran.</p>
                                <p className="text-sm">Sila tunjukkan bukti pendaftaran ini kepada staff kami di meja.</p>
                            </div>
                        )}

                        <Button
                            onClick={() => router.push(`/checkin?day=${day}&event=${eventCode}`)}
                            className={`w-full mt-4 ${isSponsor ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-white text-green-900 hover:bg-gray-100'}`}
                        >
                            Done
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Image src="/logo.png" alt="9X Growth Logo" width={150} height={80} className="object-contain" />
                    </div>
                    <CardTitle className="text-center text-white">
                        {isUpdateMode ? '✏️ Update Attendance' : 'Confirm Attendance'}
                    </CardTitle>
                    <p className="text-center text-gray-400">Day {day}</p>
                    {isUpdateMode && (
                        <p className="text-center text-yellow-500 text-sm mt-1">
                            Already checked in - updating attendance count
                        </p>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Participant Details */}
                    <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                        <p className="text-xl font-bold text-white">{participant?.name}</p>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                            <div>
                                <p className="text-gray-400">Phone</p>
                                <p className="text-white">{participant?.phone}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-400">Ticket</p>
                                <div className="text-white text-sm space-y-1">
                                    {(participant?.ticket_type || 'General').split(/(?=\d+\.\s)/).filter(Boolean).map((item, idx) => (
                                        <p key={idx} className="leading-tight">{item.trim()}</p>
                                    ))}
                                </div>
                            </div>
                            {participant?.email && (
                                <div className="col-span-2">
                                    <p className="text-gray-400">Email</p>
                                    <p className="text-white">{participant?.email}</p>
                                </div>
                            )}
                            {participant?.niche && (
                                <div>
                                    <p className="text-gray-400">Niche</p>
                                    <p className="text-white">{participant?.niche}</p>
                                </div>
                            )}
                            {participant?.state && (
                                <div>
                                    <p className="text-gray-400">State</p>
                                    <p className="text-white">{participant?.state}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendance Toggle */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Attendance</label>
                        <div
                            onClick={() => setIsAttending(!isAttending)}
                            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${isAttending
                                ? 'bg-green-600 border-2 border-green-400'
                                : 'bg-zinc-800 border-2 border-zinc-700 hover:border-zinc-600'
                                }`}
                        >
                            <span className="text-lg font-semibold text-white">
                                {isAttending ? '✓ I am Attending' : 'Click to confirm attendance'}
                            </span>
                            <div className={`w-14 h-8 rounded-full p-1 transition-all ${isAttending ? 'bg-green-400' : 'bg-zinc-600'}`}>
                                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${isAttending ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Count */}
                    {isAttending && (
                        <div className="space-y-4">
                            {/* Check if Sponsor - show single counter */}
                            {participant?.ticket_type?.toLowerCase().includes('sponsor') ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Number of Attendees</label>
                                    <div className="flex gap-3">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <Button
                                                key={num}
                                                variant={attendCount === num ? 'default' : 'outline'}
                                                onClick={() => setAttendCount(num)}
                                                className={`w-12 h-12 text-lg ${attendCount === num
                                                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                    : 'bg-transparent border-zinc-600 text-gray-300 hover:bg-zinc-800'
                                                    }`}
                                            >
                                                {num}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Paid tickets - show separate General and VIP counters */
                                <>
                                    {/* General Ticket Counter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Tiket General</label>
                                        <div className="flex gap-3">
                                            {[0, 1, 2, 3, 4, 5].map(num => (
                                                <Button
                                                    key={num}
                                                    variant={generalCount === num ? 'default' : 'outline'}
                                                    onClick={() => setGeneralCount(num)}
                                                    className={`w-12 h-12 text-lg ${generalCount === num
                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        : 'bg-transparent border-zinc-600 text-gray-300 hover:bg-zinc-800'
                                                        }`}
                                                >
                                                    {num}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* VIP Ticket Counter */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Tiket VIP</label>
                                        <div className="flex gap-3">
                                            {[0, 1, 2, 3, 4, 5].map(num => (
                                                <Button
                                                    key={num}
                                                    variant={vipCount === num ? 'default' : 'outline'}
                                                    onClick={() => setVipCount(num)}
                                                    className={`w-12 h-12 text-lg ${vipCount === num
                                                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                                        : 'bg-transparent border-zinc-600 text-gray-300 hover:bg-zinc-800'
                                                        }`}
                                                >
                                                    {num}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Total Display */}
                                    <div className="bg-zinc-800 p-3 rounded-lg text-center">
                                        <span className="text-gray-400 text-sm">Total Attendees: </span>
                                        <span className="text-white font-bold text-lg">{generalCount + vipCount}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="w-1/3 border-zinc-600 text-gray-300 hover:bg-zinc-800 hover:text-white"
                            onClick={() => router.back()}
                        >
                            Back
                        </Button>
                        <Button
                            className={`w-2/3 text-white ${isAttending
                                ? (isUpdateMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700')
                                : 'bg-zinc-700 cursor-not-allowed'}`}
                            onClick={handleSubmit}
                            disabled={submitting || !isAttending}
                        >
                            {submitting ? 'Processing...' : (isUpdateMode ? 'Update Attendance' : 'Confirm Check-in')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function ConfirmPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black text-white">Loading...</div>}>
            <ConfirmContent />
        </Suspense>
    )
}
