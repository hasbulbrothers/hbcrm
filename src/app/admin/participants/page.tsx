'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getParticipants } from './actions'

// Editable Cell Component
const EditableCell = ({ id, field, value, options, onUpdate }: { id: string, field: string, value: string, options: string[], onUpdate: (id: string, field: string, value: string) => void }) => {
    const [currentValue, setCurrentValue] = useState(value || '')
    const [updating, setUpdating] = useState(false)

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = e.target.value
        setCurrentValue(newValue)
        setUpdating(true)
        await onUpdate(id, field, newValue)
        setUpdating(false)
    }

    return (
        <div className="relative min-w-[120px]">
            <select
                value={currentValue}
                onChange={handleChange}
                disabled={updating}
                className={`w-full bg-transparent border-none text-sm focus:ring-0 cursor-pointer pr-6 ${updating ? 'opacity-50' : ''}`}
            >
                <option value="">-</option>
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    )
}

import { updateParticipant } from './updateAction'

export default function ParticipantsPage() {
    const [data, setData] = useState<any[]>([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)

    // Handle Update
    const handleUpdate = async (id: string, field: string, value: string) => {
        await updateParticipant(id, field, value)
        // Optimistic update locally
        setData(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    const loadData = async () => {
        setLoading(true)
        const res = await getParticipants(page, 20, search)
        if (res.data) {
            setData(res.data)
            setCount(res.count || 0)
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [page]) // Reload when page changes

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1) // Reset to page 1
        loadData()
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Senarai Peserta</h1>
                <div className="flex gap-2">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Cari nama/telefon..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-64"
                        />
                        <Button type="submit">Cari</Button>
                    </form>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Nama</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Telefon</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Email</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Tiket</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Day 1</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Day 2</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Niche</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Negeri</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Sales</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Tarikh Daftar</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">BDS Invited</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">BDS Status</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Close By</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Pakej</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Payment</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Day</TableHead>
                            <TableHead className="whitespace-nowrap px-4 py-3 bg-gray-50 font-semibold text-gray-700">PIC</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={17} className="text-center h-24 border-r border-gray-200">Loading...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={17} className="text-center h-24 border-r border-gray-200">Tiada rekod.</TableCell>
                            </TableRow>
                        ) : (
                            data.map((p) => {
                                // Determine attendance from nested checkins data
                                const day1 = p.checkins?.some((c: any) => c.day === 1) ? 'Hadir' : '-'
                                const day2 = p.checkins?.some((c: any) => c.day === 2) ? 'Hadir' : '-'

                                return (
                                    <TableRow key={p.id} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                                        <TableCell className="font-medium whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.name}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.phone}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.email || '-'}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.ticket_type}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <span className={day1 === 'Hadir' ? 'text-green-600 font-bold' : 'text-gray-400'}>{day1}</span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <span className={day2 === 'Hadir' ? 'text-green-600 font-bold' : 'text-gray-400'}>{day2}</span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.niche || '-'}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.state || '-'}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.total_sales || '-'}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.registration_date ? new Date(p.registration_date).toLocaleDateString() : '-'}</TableCell>

                                        {/* Editable Dropdowns */}
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <EditableCell
                                                id={p.id}
                                                field="bds_invited"
                                                value={p.bds_invited}
                                                options={['Yes', 'No']}
                                                onUpdate={handleUpdate}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <EditableCell
                                                id={p.id}
                                                field="bds_status"
                                                value={p.bds_status}
                                                options={['Open', 'Close', 'KIV']}
                                                onUpdate={handleUpdate}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <EditableCell
                                                id={p.id}
                                                field="close_by"
                                                value={p.close_by}
                                                options={['Farizul', 'Hazim', 'Amzar', 'Shah', 'Aiman', 'Firdaus', 'NST']}
                                                onUpdate={handleUpdate}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <EditableCell
                                                id={p.id}
                                                field="package"
                                                value={p.package}
                                                options={['Icon', 'Principal', 'Strategist', 'Protege']}
                                                onUpdate={handleUpdate}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <EditableCell
                                                id={p.id}
                                                field="payment_status"
                                                value={p.payment_status}
                                                options={['Full Payment', 'Deposit']}
                                                onUpdate={handleUpdate}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <EditableCell
                                                id={p.id}
                                                field="close_day"
                                                value={p.close_day}
                                                options={['Day 1', 'Day 2', 'After Seminar']}
                                                onUpdate={handleUpdate}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-4 py-3">
                                            <EditableCell
                                                id={p.id}
                                                field="pic"
                                                value={p.pic}
                                                options={['Farizul', 'Hazim', 'Amzar', 'Shah', 'Aiman', 'Firdaus']}
                                                onUpdate={handleUpdate}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
                <p>Total: {count}</p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={(page * 20) >= count}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
