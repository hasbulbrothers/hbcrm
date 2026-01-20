/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabaseClient'

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState('')
    const [loading, setLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    const downloadTemplate = () => {
        // CSV headers matching the expected format
        const headers = [
            'event_code',
            'name',
            'phone',
            'email',
            'niche',
            'registration date',
            'state',
            'ticket type',
            'total sales',
            'attendance status',
            'package',
            'payment status',
            'pic',
            'bds invited',
            'bds status',
            'close by',
            'day'
        ].join(',')

        // Example row
        const exampleRow = [
            '9xgrowth January',
            'John Doe',
            '60123456789',
            'john@example.com',
            'E-commerce',
            '2026-01-01',
            'Selangor',
            'VIP',
            '50000',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            ''
        ].join(',')

        const csvContent = `${headers}\n${exampleRow}`
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'participants_template.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    const handleUpload = async () => {
        if (!file) return
        setStatus('Reading file...')
        setLoading(true)

        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = e.target?.result
            if (typeof text !== 'string') return

            // Proper CSV Parser that handles multi-line cells in quotes
            const parseCSV = (csvText: string): string[][] => {
                const result: string[][] = []
                let currentRow: string[] = []
                let currentCell = ''
                let insideQuotes = false

                for (let i = 0; i < csvText.length; i++) {
                    const char = csvText[i]
                    const nextChar = csvText[i + 1]

                    if (char === '"') {
                        if (insideQuotes && nextChar === '"') {
                            // Escaped quote
                            currentCell += '"'
                            i++ // Skip the next quote
                        } else {
                            // Toggle quote state
                            insideQuotes = !insideQuotes
                        }
                    } else if (char === ',' && !insideQuotes) {
                        // End of cell
                        currentRow.push(currentCell.trim())
                        currentCell = ''
                    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !insideQuotes) {
                        // End of row
                        if (char === '\r') i++ // Skip \n after \r
                        currentRow.push(currentCell.trim())
                        if (currentRow.some(cell => cell !== '')) {
                            result.push(currentRow)
                        }
                        currentRow = []
                        currentCell = ''
                    } else if (char === '\r' && !insideQuotes) {
                        // Handle standalone \r
                        currentRow.push(currentCell.trim())
                        if (currentRow.some(cell => cell !== '')) {
                            result.push(currentRow)
                        }
                        currentRow = []
                        currentCell = ''
                    } else {
                        currentCell += char
                    }
                }

                // Don't forget the last cell/row
                if (currentCell || currentRow.length > 0) {
                    currentRow.push(currentCell.trim())
                    if (currentRow.some(cell => cell !== '')) {
                        result.push(currentRow)
                    }
                }

                return result
            }

            const parsedRows = parseCSV(text)
            if (parsedRows.length === 0) {
                setStatus('Error: CSV file is empty')
                setLoading(false)
                return
            }

            const rawHeaders = parsedRows[0].map(h => h.toLowerCase().replace(/"/g, ''))

            // Mapping Logic - supports both English and Malay headers
            const headerMap: Record<string, string> = {
                // Event/Seminar
                'event_code': 'event_code',
                'event code': 'event_code',
                'eventcode': 'event_code',
                'seminar': 'event_code',
                'nama seminar': 'event_code',
                'event': 'event_code',
                // Name
                'nama': 'name',
                'name': 'name',
                'nama penuh': 'name',
                'full name': 'name',
                // Phone
                'no telefon': 'phone',
                'phone': 'phone',
                'telefon': 'phone',
                'no hp': 'phone',
                'no. telefon': 'phone',
                'mobile': 'phone',
                // Email
                'email': 'email',
                'emel': 'email',
                // Niche
                'niche bisnes': 'niche',
                'niche': 'niche',
                'bisnes': 'niche',
                'business': 'niche',
                // Registration Date
                'tarikh daftar': 'registration_date',
                'registration date': 'registration_date',
                'registration_date': 'registration_date',
                'tarikh': 'registration_date',
                'date': 'registration_date',
                // State
                'negeri': 'state',
                'state': 'state',
                // Ticket Type
                'jenis tiket': 'ticket_type',
                'ticket_type': 'ticket_type',
                'ticket type': 'ticket_type',
                'tiket': 'ticket_type',
                'ticket': 'ticket_type',
                'type': 'ticket_type',
                // Total Sales
                'purata sales': 'total_sales',
                'total sales': 'total_sales',
                'total_sales': 'total_sales',
                'sales': 'total_sales',
                'jualan': 'total_sales',
                // CRM Fields
                'status hadir': 'status_hadir',
                'attendance status': 'status_hadir',
                'attendance': 'status_hadir',
                'pakej': 'package',
                'package': 'package',
                'status pembayaran': 'payment_status',
                'payment status': 'payment_status',
                'payment': 'payment_status',
                'pic': 'pic',
                'person in charge': 'pic',
                // BDS Fields
                'bds invited': 'bds_invited',
                'bds status': 'bds_status',
                // Close Fields
                'close by': 'close_by',
                'closed by': 'close_by',
                'day': 'close_day',
                'close day': 'close_day',
            }

            const rows = []
            // Start from index 1 to skip header row
            for (let i = 1; i < parsedRows.length; i++) {
                const values = parsedRows[i]
                if (!values || values.length === 0) continue

                const row: any = {}
                let hasData = false

                // Fields that should be null instead of empty string
                const nullableFields = ['registration_date', 'total_sales', 'created_at']

                rawHeaders.forEach((h, index) => {
                    const dbField = headerMap[h] || h // Fallback to header name if no map
                    if (dbField) {
                        const value = values[index]?.trim()
                        // Set null for empty nullable fields, empty string for others
                        if (!value || value === '') {
                            row[dbField] = nullableFields.includes(dbField) ? null : ''
                        } else {
                            // Replace line breaks within cell with space for cleaner data
                            row[dbField] = value.replace(/[\r\n]+/g, ' ')
                        }
                        if (value) hasData = true
                    }
                })

                // Validation: Ensure required fields
                // Relaxed validation: Just need Name or Phone to try import
                if (hasData && (row.name || row.phone)) {
                    // Normalize Phone (remove chars)
                    if (row.phone) {
                        row.phone = row.phone.replace(/\D/g, '')
                    }
                    rows.push(row)
                }
            }

            setStatus(`Found ${rows.length} records. Uploading...`)

            // Batch Insert
            const { error } = await supabase.from('participants').insert(rows)

            if (error) {
                setStatus(`Error: ${error.message}`)
            } else {
                setStatus(`Success! Imported ${rows.length} participants.`)
            }
            setLoading(false)
        }
        reader.readAsText(file)
    }

    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold mb-6">Import Participants (CSV)</h1>

            <div className="space-y-4 bg-white p-6 rounded shadow">
                <div>
                    <p className="mb-2 text-sm text-gray-600">
                        CSV Format: <code className="bg-gray-100 p-1">event_code, name, phone, email, niche, registration date, state, ticket type, total sales, attendance status, package, payment status, pic, bds invited, bds status, close by, day</code>
                    </p>
                    <Input type="file" accept=".csv" onChange={handleFileChange} />
                </div>

                <div className="flex gap-3">
                    <Button onClick={handleUpload} disabled={!file || loading}>
                        {loading ? 'Processing...' : 'Upload CSV'}
                    </Button>
                    <Button variant="outline" onClick={downloadTemplate}>
                        Download Template
                    </Button>
                </div>

                {status && (
                    <Alert className="mt-4">
                        <AlertTitle>Status</AlertTitle>
                        <AlertDescription>{status}</AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    )
}
