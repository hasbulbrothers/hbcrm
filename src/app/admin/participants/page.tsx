/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Download, Search } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getParticipants, getFilterOptions } from './actions'
import { getSeminars } from '../actions'
import { updateParticipant } from './updateAction'
import { ParticipantRow } from './components/participant-row'
import { handleExportCSV } from './components/export-csv'
import { toast } from 'sonner'

export default function ParticipantsPage() {
    const [data, setData] = useState<any[]>([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [seminars, setSeminars] = useState<string[]>([])
    const [selectedSeminar, setSelectedSeminar] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [niches, setNiches] = useState<string[]>([])
    const [closeByOptions, setCloseByOptions] = useState<string[]>([])
    const [states, setStates] = useState<string[]>([])
    const [selectedNiche, setSelectedNiche] = useState('')
    const [selectedCloseBy, setSelectedCloseBy] = useState('')
    const [selectedState, setSelectedState] = useState('')
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    const handleUpdate = async (id: string, field: string, value: string) => {
        await updateParticipant(id, field, value)
        setData(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
        toast.success('Dikemaskini')
    }

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await getParticipants(page, 20, search, selectedSeminar, startDate, endDate, selectedNiche, selectedCloseBy, selectedState)
            if (res.error) {
                toast.error('Gagal memuatkan data')
                setData([]); setCount(0)
            } else {
                setData(res.data || []); setCount(res.count || 0)
            }
        } catch {
            toast.error('Carian gagal')
            setData([]); setCount(0)
        } finally {
            setLoading(false)
        }
    }, [page, search, selectedSeminar, startDate, endDate, selectedNiche, selectedCloseBy, selectedState])

    useEffect(() => {
        getSeminars().then(res => { if (res.success && res.events) setSeminars(res.events) })
        getFilterOptions().then(opts => {
            setNiches(opts.niches); setCloseByOptions(opts.closeByOptions); setStates(opts.states)
        })
    }, [])

    useEffect(() => { loadData() }, [loadData])

    const handleSearchChange = (val: string) => {
        setSearch(val); setPage(1)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => loadData(), 400)
    }

    const handleFilterChange = (setter: (v: string) => void, val: string) => {
        setter(val); setPage(1)
    }

    const handleClearFilters = () => {
        setSelectedSeminar(''); setStartDate(''); setEndDate('')
        setSearch(''); setSelectedNiche(''); setSelectedCloseBy(''); setSelectedState('')
        setPage(1)
    }

    const handleExport = async () => {
        setExporting(true)
        try {
            await handleExportCSV(search, selectedSeminar, startDate, endDate, selectedNiche, selectedCloseBy, selectedState)
        } catch { toast.error('Export gagal') }
        setExporting(false)
    }

    const hasFilters = selectedSeminar || startDate || endDate || search || selectedNiche || selectedCloseBy || selectedState
    const totalPages = Math.ceil(count / 20)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Participants</h1>
                <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    {exporting ? 'Exporting...' : 'Export CSV'}
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Cari nama atau telefon..." value={search} onChange={(e) => handleSearchChange(e.target.value)} className="pl-9" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <FilterSelect label="Seminar" value={selectedSeminar} options={seminars} onChange={(v) => handleFilterChange(setSelectedSeminar, v)} />
                    <FilterSelect label="Niche" value={selectedNiche} options={niches} onChange={(v) => handleFilterChange(setSelectedNiche, v)} />
                    <FilterSelect label="Sales" value={selectedCloseBy} options={closeByOptions} onChange={(v) => handleFilterChange(setSelectedCloseBy, v)} />
                    <FilterSelect label="Negeri" value={selectedState} options={states} onChange={(v) => handleFilterChange(setSelectedState, v)} />
                    <input type="date" value={startDate} onChange={(e) => handleFilterChange(setStartDate, e.target.value)} className="h-9 rounded-lg border border-gray-200 px-3 text-sm" />
                    <input type="date" value={endDate} onChange={(e) => handleFilterChange(setEndDate, e.target.value)} className="h-9 rounded-lg border border-gray-200 px-3 text-sm" />
                    {hasFilters && <button onClick={handleClearFilters} className="h-9 px-3 text-sm text-gray-500 hover:text-gray-700">Reset</button>}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-10 px-4" />
                            <TableHead className="px-4 font-semibold text-gray-700">Nama</TableHead>
                            <TableHead className="px-4 font-semibold text-gray-700">Telefon</TableHead>
                            <TableHead className="px-4 font-semibold text-gray-700">Tiket</TableHead>
                            <TableHead className="px-4 font-semibold text-gray-700">Hari 1</TableHead>
                            <TableHead className="px-4 font-semibold text-gray-700">Hari 2</TableHead>
                            <TableHead className="px-4 font-semibold text-gray-700 w-12" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <TableCell key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded" /></TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-400">Tiada rekod dijumpai</TableCell>
                            </TableRow>
                        ) : data.map(p => <ParticipantRow key={p.id} p={p} onUpdate={handleUpdate} />)}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
                <p>{count} rekod {hasFilters ? '(ditapis)' : ''}</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                    <span className="text-gray-600 font-medium">{page} / {totalPages || 1}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
            </div>
        </div>
    )
}

function FilterSelect({ label, value, options, onChange }: {
    label: string, value: string, options: string[], onChange: (v: string) => void
}) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm min-w-[120px]">
            <option value="">{label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    )
}
