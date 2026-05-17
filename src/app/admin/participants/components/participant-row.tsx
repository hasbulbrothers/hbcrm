/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { TableRow, TableCell } from '@/components/ui/table'
import { EditableCell } from './editable-cell'

export function ParticipantRow({ p, onUpdate }: { p: any, onUpdate: (id: string, field: string, value: string) => void }) {
    const [expanded, setExpanded] = useState(false)
    const checkin1 = p.checkins?.find((c: any) => c.day === 1)
    const checkin2 = p.checkins?.find((c: any) => c.day === 2)
    const day1 = checkin1 ? `Hadir (${checkin1.attend_count})` : '-'
    const day2 = checkin2 ? `Hadir (${checkin2.attend_count})` : '-'

    return (
        <>
            <TableRow className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
                <TableCell className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600">
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </TableCell>
                <TableCell className="font-medium px-4 py-3">{p.name}</TableCell>
                <TableCell className="px-4 py-3 text-gray-600">{p.phone}</TableCell>
                <TableCell className="px-4 py-3">{p.ticket_type || '-'}</TableCell>
                <TableCell className="px-4 py-3">
                    <span className={checkin1 ? 'text-green-600 font-semibold' : 'text-gray-400'}>{day1}</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                    <span className={checkin2 ? 'text-green-600 font-semibold' : 'text-gray-400'}>{day2}</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                    {p.phone && (
                        <a
                            href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '').replace(/^0/, '60')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        </a>
                    )}
                </TableCell>
            </TableRow>
            {expanded && (
                <TableRow className="bg-gray-50/50">
                    <TableCell colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" onClick={(e) => e.stopPropagation()}>
                            <DetailField label="Seminar" value={p.event_code} />
                            <DetailField label="Email" value={p.email} />
                            <DetailField label="Niche" value={p.niche} />
                            <DetailField label="Negeri" value={p.state} />
                            <DetailField label="Sales" value={p.total_sales} />
                            <DetailField label="Tarikh Daftar" value={p.registration_date ? new Date(p.registration_date).toLocaleDateString() : '-'} />
                            <EditField label="BDS Invited" id={p.id} field="bds_invited" value={p.bds_invited} options={['Yes', 'No']} onUpdate={onUpdate} />
                            <EditField label="BDS Status" id={p.id} field="bds_status" value={p.bds_status} options={['Open', 'Close', 'KIV']} onUpdate={onUpdate} />
                            <EditField label="Close By" id={p.id} field="close_by" value={p.close_by} options={['Farizul', 'Hazim', 'Amzar', 'Shah', 'Aiman', 'Firdaus', 'NST']} onUpdate={onUpdate} />
                            <EditField label="Package" id={p.id} field="package" value={p.package} options={['Icon', 'Principal', 'Strategist', 'Protege']} onUpdate={onUpdate} />
                            <EditField label="Payment" id={p.id} field="payment_status" value={p.payment_status} options={['Full Payment', 'Deposit']} onUpdate={onUpdate} />
                            <EditField label="Close Day" id={p.id} field="close_day" value={p.close_day} options={['Day 1', 'Day 2', 'After Seminar']} onUpdate={onUpdate} />
                            <EditField label="PIC" id={p.id} field="pic" value={p.pic} options={['Farizul', 'Hazim', 'Amzar', 'Shah', 'Aiman', 'Firdaus']} onUpdate={onUpdate} />
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    )
}

function DetailField({ label, value }: { label: string, value: string | number | null }) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-gray-700">{value || '-'}</p>
        </div>
    )
}

function EditField({ label, id, field, value, options, onUpdate }: {
    label: string, id: string, field: string, value: string, options: string[],
    onUpdate: (id: string, field: string, value: string) => void
}) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <EditableCell id={id} field={field} value={value} options={options} onUpdate={onUpdate} />
        </div>
    )
}
