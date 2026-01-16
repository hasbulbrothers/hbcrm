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

            // Simple CSV Parse
            const lines = text.split('\n')
            const rawHeaders = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))

            // Mapping Logic
            const headerMap: Record<string, string> = {
                'nama': 'name',
                'name': 'name',
                'no telefon': 'phone',
                'phone': 'phone',
                'email': 'email',
                'niche bisnes': 'niche',
                'niche': 'niche',
                'tarikh daftar': 'registration_date',
                'registration date': 'registration_date',
                'negeri': 'state',
                'state': 'state',
                'jenis tiket': 'ticket_type',
                'ticket_type': 'ticket_type',
                'ticket type': 'ticket_type',
                'purata sales': 'total_sales',
                'total sales': 'total_sales',
                'total_sales': 'total_sales',
                'event_code': 'event_code',
                // CRM Fields
                'status hadir': 'status_hadir',
                'attendance status': 'status_hadir',
                'pakej': 'package',
                'package': 'package',
                'status pembayaran': 'payment_status',
                'payment status': 'payment_status',
                'pic': 'pic',
                'person in charge': 'pic',
                // BDS Fields
                'bds invited': 'bds_invited',
                'bds status': 'bds_status',
                // New Close Fields
                'close by': 'close_by',
                'closed by': 'close_by',
                'day': 'close_day',
                'close day': 'close_day',
            }

            const rows = []
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim()
                if (!line) continue

                // Better CSV split that handles quotes loosely (simple regex for MVP)
                // Assuming no commas inside fields for now or standard CSV
                const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, ''))

                const row: any = {}
                let hasData = false

                rawHeaders.forEach((h, index) => {
                    const dbField = headerMap[h] || h // Fallback to header name if no map
                    if (dbField) {
                        row[dbField] = values[index] || ''
                        if (values[index]) hasData = true
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
        <div className="p-8 max-w-2xl">
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
