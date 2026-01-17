'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { searchParticipant } from '../actions'

function CheckInContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const eventCode = searchParams.get('event') || 'default-event'
    const day = parseInt(searchParams.get('day') || '1')

    const [query, setQuery] = useState('')
    const [participants, setParticipants] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSearch = async (e?: React.FormEvent, SearchQuery?: string) => {
        if (e) e.preventDefault()
        const finalQuery = SearchQuery || query
        if (!finalQuery) return

        setLoading(true)
        setError('')
        setParticipants([])

        const res = await searchParticipant(finalQuery, eventCode)

        if (res.error) {
            setError(res.error)
        } else if (res.data) {
            setParticipants(res.data)
        }
        setLoading(false)
    }

    // Auto-search effect
    useEffect(() => {
        if (query.length >= 8) {
            const timer = setTimeout(() => {
                handleSearch(undefined, query)
            }, 500)
            return () => clearTimeout(timer)
        } else {
            setParticipants([])
        }
    }, [query])

    const handleSelectParticipant = (participant: any) => {
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
                    <form onSubmit={handleSearch} className="space-y-4">
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
                    </form>

                    {error && <Alert variant="destructive" className="mt-4 bg-red-900 border-red-800 text-white"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

                    {participants.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <p className="font-semibold text-sm text-gray-400">Select Your Name:</p>
                            {participants.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => handleSelectParticipant(p)}
                                    className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:bg-zinc-700 hover:border-green-600 transition-all"
                                >
                                    <p className="font-bold text-lg text-white">{p.name}</p>
                                    <div className="flex justify-between text-sm text-gray-400 mt-1">
                                        <span>{p.ticket_type || 'General'}</span>
                                        <span>{p.phone}</span>
                                    </div>
                                    {p.email && <p className="text-xs text-gray-500 mt-1">{p.email}</p>}
                                </div>
                            ))}
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
