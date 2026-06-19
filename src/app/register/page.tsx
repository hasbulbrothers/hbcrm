'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { registerParticipant } from './actions'

const STATES = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Perak', 'Perlis', 'Pulau Pinang', 'Sabah',
    'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur',
    'W.P. Labuan', 'W.P. Putrajaya'
]

function RegisterContent() {
    const searchParams = useSearchParams()
    const eventCode = searchParams.get('event') || ''

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        state: '',
        ticket_type: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await registerParticipant({ ...form, event_code: eventCode })

        if (res.error) {
            setError(res.error)
        } else {
            setSuccess(true)
        }
        setLoading(false)
    }

    if (!eventCode) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-400">Event code tidak ditemui.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 bg-black">
                <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white">
                    <CardContent className="p-8 text-center space-y-4">
                        <div className="flex justify-center mb-4">
                            <Image src="/logo-gyb.png" alt="Logo" width={150} height={80} className="object-contain" />
                        </div>
                        <div className="text-green-400 text-5xl">✓</div>
                        <h2 className="text-2xl font-bold text-white">Pendaftaran Berjaya!</h2>
                        <p className="text-gray-400">Terima kasih kerana mendaftar untuk <span className="text-white font-semibold">{eventCode}</span>.</p>
                        <p className="text-gray-400 text-sm">Kami akan menghubungi anda untuk pengesahan pembayaran.</p>
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
                        <Image src="/logo-gyb.png" alt="Logo" width={150} height={80} className="object-contain" />
                    </div>
                    <CardTitle className="text-center text-white text-2xl">Pendaftaran</CardTitle>
                    <p className="text-center text-gray-400">{eventCode}</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Nama Penuh *</label>
                            <Input
                                name="name"
                                placeholder="Masukkan nama penuh"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">No. Telefon *</label>
                            <Input
                                name="phone"
                                placeholder="012-3456789"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">E-mel *</label>
                            <Input
                                name="email"
                                type="email"
                                placeholder="email@contoh.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Jenis Tiket *</label>
                            <select
                                name="ticket_type"
                                value={form.ticket_type}
                                onChange={handleChange}
                                required
                                className="w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm"
                            >
                                <option value="">Pilih jenis tiket</option>
                                <option value="General">General — RM 2,700</option>
                                <option value="VIP">VIP — RM 5,700</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Negeri</label>
                            <select
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                className="w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-white text-sm"
                            >
                                <option value="">Pilih negeri</option>
                                {STATES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white font-bold"
                            disabled={loading}
                        >
                            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
                        </Button>

                        {error && (
                            <Alert variant="destructive" className="mt-4 bg-red-900 border-red-800 text-white">
                                <AlertTitle>Ralat</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black text-white">Loading...</div>}>
            <RegisterContent />
        </Suspense>
    )
}
