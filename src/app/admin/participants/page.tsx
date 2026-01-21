/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
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
import { getParticipants, getFilterOptions } from './actions'
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

    // New filter states
    const [niches, setNiches] = useState<string[]>([])
    const [closeByOptions, setCloseByOptions] = useState<string[]>([])
    const [states, setStates] = useState<string[]>([])
    const [selectedNiche, setSelectedNiche] = useState('')
    const [selectedCloseBy, setSelectedCloseBy] = useState('')
    const [selectedState, setSelectedState] = useState('')

    // Handle Update
    const handleUpdate = async (id: string, field: string, value: string) => {
        await updateParticipant(id, field, value)
        // Optimistic update locally
        setData(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    const loadData = async () => {
        setLoading(true)
        const res = await getParticipants(page, 20, search, selectedSeminar, startDate, endDate, selectedNiche, selectedCloseBy, selectedState)
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

    const loadFilterOptions = async () => {
        const options = await getFilterOptions()
        setNiches(options.niches)
        setCloseByOptions(options.closeByOptions)
        setStates(options.states)
    }

    useEffect(() => {
        loadSeminars()
        loadFilterOptions()
    }, [])

    useEffect(() => {
        loadData()
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
        setSelectedNiche('')
        setSelectedCloseBy('')
        setSelectedState('')
        setPage(1)
    }

    const hasActiveFilters = selectedSeminar || startDate || endDate || search || selectedNiche || selectedCloseBy || selectedState

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Participants List</h1>
            </div>

            <Card className="mb-6">
                <CardContent className="p-4 space-y-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Search - Full width on top */}
                        <div className="w-full">
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

                        {/* Filter dropdowns row */}
                        <div className="flex flex-col md:flex-row gap-4 items-end">

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

                            <div className="w-full md:w-[180px]">
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Niche</label>
                                <div className="relative">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        value={selectedNiche}
                                        onChange={(e) => setSelectedNiche(e.target.value)}
                                    >
                                        <option value="">All Niches</option>
                                        {niches.map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>

                            <div className="w-full md:w-[180px]">
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Sales</label>
                                <div className="relative">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        value={selectedCloseBy}
                                        onChange={(e) => setSelectedCloseBy(e.target.value)}
                                    >
                                        <option value="">All Sales</option>
                                        {closeByOptions.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </div>

                            <div className="w-full md:w-[160px]">
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Negeri</label>
                                <div className="relative">
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        value={selectedState}
                                        onChange={(e) => setSelectedState(e.target.value)}
                                    >
                                        <option value="">All States</option>
                                        {states.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
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
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="border rounded-md overflow-x-auto">
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
                            <TableHead className="whitespace-nowrap border-r border-gray-200 px-4 py-3 bg-gray-50 font-semibold text-gray-700">PIC</TableHead>
                            <TableHead className="whitespace-nowrap px-4 py-3 bg-gray-50 font-semibold text-gray-700">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={19} className="text-center h-24 border-r border-gray-200">Loading...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={19} className="text-center h-24 border-r border-gray-200">No records found.</TableCell>
                            </TableRow>
                        ) : (
                            data.map((p) => {
                                // Determine attendance from nested checkins data
                                const checkin1 = p.checkins?.find((c: any) => c.day === 1)
                                const checkin2 = p.checkins?.find((c: any) => c.day === 2)

                                const day1 = checkin1 ? `Present (${checkin1.attend_count})` : '-'
                                const day2 = checkin2 ? `Present (${checkin2.attend_count})` : '-'

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
                                        <TableCell className="whitespace-nowrap border-r border-gray-200 px-4 py-3">
                                            <EditableCell
                                                id={p.id}
                                                field="pic"
                                                value={p.pic}
                                                options={['Farizul', 'Hazim', 'Amzar', 'Shah', 'Aiman', 'Firdaus']}
                                                onUpdate={handleUpdate}
                                            />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap px-4 py-3">
                                            {p.phone && (
                                                <a
                                                    href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '').replace(/^0/, '60')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                    </svg>
                                                </a>
                                            )}
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
