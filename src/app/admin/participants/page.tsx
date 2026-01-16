/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Filter } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { getParticipants } from './actions'
import { getSeminars } from '../actions'

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

    // Filter states

    const [seminars, setSeminars] = useState<string[]>([])
    const [selectedSeminar, setSelectedSeminar] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Handle Update
    const handleUpdate = async (id: string, field: string, value: string) => {
        await updateParticipant(id, field, value)
        // Optimistic update locally
        setData(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    const loadData = async () => {
        setLoading(true)
        const res = await getParticipants(page, 20, search, selectedSeminar, startDate, endDate)
        if (res.data) {
            setData(res.data)
            setCount(res.count || 0)
        }
        setLoading(false)
    }

    const loadSeminars = async () => {
        const res = await getSeminars()
        if (res.success && res.events) {
            setSeminars(res.events)
        }
    }

    useEffect(() => {
        loadSeminars()
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    }, [])

    useEffect(() => {
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    }, [page]) // Reload when page changes

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1) // Reset to page 1
        loadData()
    }

    const handleClearFilters = () => {
        setSelectedSeminar('')
        setStartDate('')
        setEndDate('')
        setSearch('')
        setPage(1)
    }

    const hasActiveFilters = selectedSeminar || startDate || endDate || search

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Participants List</h1>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
                            <div className="relative">
                                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search name, phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-[200px]">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Seminar</label>
                            <div className="relative">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                    value={selectedSeminar}
                                    onChange={(e) => setSelectedSeminar(e.target.value)}
                                >
                                    <option value="">All Seminars</option>
                                    {seminars.map(sem => (
                                        <option key={sem} value={sem}>{sem}</option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                            </div>
                        </div>

                        <div className="w-full md:w-[160px]">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">From Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="w-full md:w-[160px]">
                            <label className="text-xs font-medium text-gray-500 mb-1 block">To Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit">Apply</Button>
                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleClearFilters}
                                    className="text-gray-500"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Seminar</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Name</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Phone</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Email</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Ticket</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Day 1</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Day 2</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Niche</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">State</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Sales</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Reg. Date</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">BDS Invited</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">BDS Status</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Close By</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Package</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Payment</TableHead>
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">Day</TableHead>
                            <TableHead className="whitespace-nowrap px-4 py-3 bg-gray-50 font-semibold text-gray-700">PIC</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={18} className="text-center h-24 border-r border-gray-200">Loading...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={18} className="text-center h-24 border-r border-gray-200">No records found.</TableCell>
                            </TableRow>
                        ) : (
                            data.map((p) => {
                                // Determine attendance from nested checkins data
                                const day1 = p.checkins?.some((c: any) => c.day === 1) ? 'Present' : '-'
                                const day2 = p.checkins?.some((c: any) => c.day === 2) ? 'Present' : '-'

                                return (
                                    <TableRow key={p.id} className="hover:bg-gray-50 transition-colors border-b border-gray-200">
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3 text-blue-600 font-medium">{p.event_code || '-'}</TableCell>
                                        <TableCell className="font-medium whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.name}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.phone}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.email || '-'}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">{p.ticket_type}</TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <span className={day1 === 'Present' ? 'text-green-600 font-bold' : 'text-gray-400'}>{day1}</span>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <span className={day2 === 'Present' ? 'text-green-600 font-bold' : 'text-gray-400'}>{day2}</span>
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
        </div >
    )
}
